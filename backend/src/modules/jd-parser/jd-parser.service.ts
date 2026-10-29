import { BadRequestException, Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { analyzeJdText } from './lib/analyser/analyzeJd';
import { parseJdToFormFields, type JdExtractFormFields } from './lib/jdFieldExtractor';
import { extractJdTextFromBuffer } from './extract-jd-text';

const MIN_JD_CHARS = 50;

export type JdExtractResponse = JdExtractFormFields & {
  extractionSource?: string;
  totalRolesDetected?: number;
  roleTitle?: string;
  usedFallbackParser?: boolean;
};

/**
 * JD extract via parser-api when PARSER_API_URL is set; otherwise in-process (legacy).
 * Analyser / fallback logic is unchanged.
 */
@Injectable()
export class JdParserService implements OnModuleInit {
  private readonly logger = new Logger(JdParserService.name);
  private parserApiUrl = '';

  onModuleInit() {
    this.parserApiUrl = String(process.env.PARSER_API_URL || '').trim().replace(/\/$/, '');
    if (this.parserApiUrl) {
      this.logger.log(`JD parser via parser-api at ${this.parserApiUrl}`);
      return;
    }
    this.loadGeminiSettings(
      path.resolve(process.cwd(), '..', 'JD', 'resume parser_node', 'resume-parser-module-ready', '.env'),
    );
    this.loadGeminiSettings(
      path.resolve(process.cwd(), '..', 'JD', 'resume parser_node', 'jd-module', '.env'),
    );
    this.loadGeminiSettings(path.resolve(process.cwd(), '.env'));
    const hasKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    this.logger.log(`JD parser ready (Gemini: ${hasKey ? 'configured' : 'fallback-only'})`);
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
        geminiConfigured: true,
        minChars: MIN_JD_CHARS,
      };
    }
    return {
      status: 'ok',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      minChars: MIN_JD_CHARS,
    };
  }

  async extractFromText(text: string, subjectHint?: string): Promise<JdExtractResponse> {
    if (this.parserApiUrl) {
      const res = await fetch(`${this.parserApiUrl}/v1/jd/extract`, {
        method: 'POST',
        headers: this.parserHeaders(true),
        body: JSON.stringify({ text, subject: subjectHint }),
      });
      const payload: any = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = payload?.error || `parser-api JD extract failed (${res.status})`;
        if (res.status === 400) throw new BadRequestException(msg);
        throw new ServiceUnavailableException(msg);
      }
      return payload.data as JdExtractResponse;
    }

    const jdText = String(text || '').trim();
    if (jdText.length < MIN_JD_CHARS) {
      throw new BadRequestException(
        `Job description is too short (minimum ${MIN_JD_CHARS} characters).`,
      );
    }
    return this.runExtract(jdText, subjectHint);
  }

  async extractFromFile(
    file: { buffer: Buffer; originalname: string; mimetype?: string },
    subjectHint?: string,
  ): Promise<JdExtractResponse> {
    if (this.parserApiUrl) {
      const form = new FormData();
      form.append(
        'file',
        new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype || 'application/octet-stream' }),
        file.originalname || 'jd.pdf',
      );
      if (subjectHint) form.append('subject', subjectHint);
      const res = await fetch(`${this.parserApiUrl}/v1/jd/extract`, {
        method: 'POST',
        headers: this.parserHeaders(),
        body: form,
      });
      const payload: any = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = payload?.error || `parser-api JD extract failed (${res.status})`;
        if (res.status === 400) throw new BadRequestException(msg);
        throw new ServiceUnavailableException(msg);
      }
      return payload.data as JdExtractResponse;
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException('Upload a JD file under the form field "file".');
    }
    const { text, error } = await extractJdTextFromBuffer(file.buffer, file.originalname || 'jd.pdf');
    if (!text.trim()) {
      throw new BadRequestException(error || 'Could not read text from this document. Try PDF or DOCX.');
    }
    if (text.trim().length < MIN_JD_CHARS) {
      throw new BadRequestException(
        `Job description is too short (minimum ${MIN_JD_CHARS} characters).`,
      );
    }
    return this.runExtract(text, subjectHint);
  }

  private async runExtract(jdText: string, subjectHint?: string): Promise<JdExtractResponse> {
    try {
      const analyzed = await analyzeJdText(jdText);
      return {
        ...analyzed.fields,
        jdDescription: analyzed.fields.jdDescription ?? jdText.trim(),
        extractionSource: analyzed.source,
        totalRolesDetected: analyzed.totalRoles,
        roleTitle: analyzed.roleTitle,
        usedFallbackParser: false,
      };
    } catch (llmError: any) {
      this.logger.warn(
        `LLM JD analyser failed, using rule-based fallback: ${llmError?.message || llmError}`,
      );
      const fallback = parseJdToFormFields(jdText, { subjectHint });
      return {
        ...fallback,
        jdDescription: fallback.jdDescription ?? jdText.trim(),
        usedFallbackParser: true,
      };
    }
  }
}
