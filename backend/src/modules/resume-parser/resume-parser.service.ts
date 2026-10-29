import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/** Uploaded file as provided by multer (memory storage). */
export interface UploadedResume {
  buffer: Buffer;
  originalname: string;
  size: number;
  mimetype?: string;
}

/** Normalized candidate fields returned to the Candidate Search & Entry page. */
export interface ParsedResume {
  candidateName: string | null;
  email: string | null;
  contactNumber: string | null;
  linkedInUrl: string | null;
  qualification: string | null;
  skills: string | null;
  technologies: string | null;
  totalExperience: string | null;
  relevantExperience: string | null;
  currentCompany: string | null;
  currentLocation: string | null;
  sourceFile: string;
  parser: 'metaforge' | 'legacy' | string;
}

export interface BulkParseResult {
  sourceFile: string;
  status: 'done' | 'error';
  data?: ParsedResume;
  error?: string;
}

export {
  RESUME_ALLOWED_EXTENSIONS as RESUME_EXTENSIONS,
  MAX_UPLOAD_BYTES as MAX_RESUME_BYTES,
} from '../../common/security/upload-validation.util';
export const MAX_BULK_RESUMES = 5;

/**
 * Bridges resume parsing via parser-api (PARSER_API_URL) when configured,
 * otherwise loads resume-parser-module-ready in-process (legacy path).
 * Extraction logic is unchanged either way.
 */
@Injectable()
export class ResumeParserService implements OnModuleInit {
  private readonly logger = new Logger(ResumeParserService.name);
  private lib: any = null;
  private loadError: string | null = null;
  private parserApiUrl = '';

  onModuleInit() {
    this.parserApiUrl = String(process.env.PARSER_API_URL || '').trim().replace(/\/$/, '');
    if (this.parserApiUrl) {
      this.logger.log(`Resume parser via parser-api at ${this.parserApiUrl}`);
      return;
    }

    const dir =
      process.env.RESUME_PARSER_DIR ||
      path.resolve(process.cwd(), '..', 'JD', 'resume parser_node', 'resume-parser-module-ready');
    try {
      this.loadGeminiSettings(path.join(dir, '.env'));
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.lib = require(path.join(dir, 'dist'));
      const h = this.health();
      this.logger.log(`Resume parser loaded from ${dir} (mode: ${h.mode})`);
    } catch (err: any) {
      this.loadError = `Resume parser module not available at ${dir}: ${err?.message}`;
      this.logger.error(this.loadError);
    }
  }

  private loadGeminiSettings(envFile: string) {
    if (!fs.existsSync(envFile)) return;
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*(GEMINI_[A-Z_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, '').trim();
      if (value && !process.env[m[1]]) process.env[m[1]] = value;
    }
  }

  private requireLib() {
    if (!this.lib) throw new ServiceUnavailableException(this.loadError || 'Resume parser is not loaded');
    return this.lib;
  }

  private parserHeaders(json = false): Record<string, string> {
    const headers: Record<string, string> = {};
    const key = String(process.env.PARSER_API_KEY || '').trim();
    if (key) headers['X-API-Key'] = key;
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
  }

  health() {
    if (this.parserApiUrl) {
      return {
        status: 'ok',
        mode: 'parser-api',
        parserApiUrl: this.parserApiUrl,
        aiParserAvailable: true,
        aiSuspendedNotice: null,
      };
    }
    if (!this.lib) return { status: 'unavailable', error: this.loadError, mode: 'unavailable' };
    const aiAvailable = !!this.lib.isMetaforgeParserAvailable?.();
    const suspended = this.lib.getAiParsingSuspendedReason?.() || null;
    return {
      status: 'ok',
      aiParserAvailable: aiAvailable,
      aiSuspendedNotice: suspended,
      mode: aiAvailable && !suspended ? 'hybrid-ai-with-fallback' : 'local-deterministic',
    };
  }

  async parseOne(file: UploadedResume): Promise<ParsedResume> {
    if (this.parserApiUrl) {
      const form = new FormData();
      form.append(
        'resume',
        new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype || 'application/octet-stream' }),
        file.originalname || 'resume.pdf',
      );
      const res = await fetch(`${this.parserApiUrl}/v1/resume/parse`, {
        method: 'POST',
        headers: this.parserHeaders(),
        body: form,
      });
      const payload: any = await res.json().catch(() => null);
      if (!res.ok) {
        throw new ServiceUnavailableException(payload?.error || `parser-api resume parse failed (${res.status})`);
      }
      return payload.data as ParsedResume;
    }

    const raw = await this.requireLib().parseResumeBuffer(file.buffer, file.originalname || 'resume.pdf');
    return normalize(raw, file.originalname);
  }

  async parseMany(files: UploadedResume[]): Promise<BulkParseResult[]> {
    if (this.parserApiUrl) {
      const form = new FormData();
      for (const file of files) {
        form.append(
          'resumes',
          new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype || 'application/octet-stream' }),
          file.originalname || 'resume.pdf',
        );
      }
      const res = await fetch(`${this.parserApiUrl}/v1/resume/parse/bulk`, {
        method: 'POST',
        headers: this.parserHeaders(),
        body: form,
      });
      const payload: any = await res.json().catch(() => null);
      if (!res.ok) {
        throw new ServiceUnavailableException(payload?.error || `parser-api bulk parse failed (${res.status})`);
      }
      return (payload.results || []) as BulkParseResult[];
    }

    const results = await this.requireLib().parseResumeBuffersBulk(
      files.map((f) => ({ buffer: f.buffer, filename: f.originalname || 'resume.pdf' })),
    );
    return (results as any[]).map((r) =>
      r.status === 'done'
        ? { sourceFile: r.sourceFile, status: 'done' as const, data: normalize(r.data, r.sourceFile) }
        : { sourceFile: r.sourceFile, status: 'error' as const, error: r.error || 'Failed to parse resume' },
    );
  }
}

function text(v: unknown): string | null {
  const s = String(v ?? '').trim();
  return s && !['null', 'undefined', 'n/a', 'na'].includes(s.toLowerCase()) ? s : null;
}

/** "+91 98765 43210" -> "+919876543210" (the module's documented format). */
function normalizePhone(v: unknown): string | null {
  const s = text(v);
  if (!s) return null;
  const firstPart = s.split(/[\/,|\n]|(?:\bor\b)/i)[0].trim();
  const digits = firstPart.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  if (!digits) return null;
  if (digits.startsWith('+91') && digits.length > 13) {
    return digits.slice(0, 13);
  }
  if (digits.length > 15) {
    return digits.slice(0, 12);
  }
  return digits || null;
}

function normalize(raw: any, filename: string): ParsedResume {
  return {
    candidateName: text(raw?.candidateName),
    email: text(raw?.email),
    contactNumber: normalizePhone(raw?.contactNumber),
    linkedInUrl: text(raw?.linkedinUrl ?? raw?.linkedInUrl),
    qualification: text(raw?.highestQualification),
    skills: text(raw?.skillsRaw),
    technologies: text(raw?.technologiesRaw ?? raw?.role ?? raw?.technologies),
    totalExperience: text(raw?.totalExperience),
    relevantExperience: text(raw?.relevantExperience),
    currentCompany: text(raw?.currentEmployer),
    currentLocation: text(raw?.currentLocation ?? raw?.location),
    sourceFile: text(raw?.sourceFile) || filename,
    parser: raw?.parser || 'legacy',
  };
}
