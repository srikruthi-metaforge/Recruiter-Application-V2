import * as path from 'path';
import { loadGeminiSettings, resumeParserDir } from './config';

export type ParsedResume = {
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
  parser: string;
};

export type BulkParseResult = {
  sourceFile: string;
  status: 'done' | 'error';
  data?: ParsedResume;
  error?: string;
};

let lib: any = null;
let loadError: string | null = null;

function text(v: unknown): string | null {
  const s = String(v ?? '').trim();
  return s && !['null', 'undefined', 'n/a', 'na'].includes(s.toLowerCase()) ? s : null;
}

function normalizePhone(v: unknown): string | null {
  const s = text(v);
  if (!s) return null;
  const firstPart = s.split(/[\/,|\n]|(?:\bor\b)/i)[0].trim();
  const digits = firstPart.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  if (!digits) return null;
  if (digits.startsWith('+91') && digits.length > 13) return digits.slice(0, 13);
  if (digits.length > 15) return digits.slice(0, 12);
  return digits || null;
}

/** Same normalize mapping Nest ResumeParserService uses. */
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

export function initResumeParser() {
  const dir = resumeParserDir();
  try {
    loadGeminiSettings(path.join(dir, '.env'));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    lib = require(path.join(dir, 'dist'));
    loadError = null;
  } catch (err: any) {
    lib = null;
    loadError = `Resume parser module not available at ${dir}: ${err?.message}`;
  }
}

export function resumeHealth() {
  if (!lib) return { status: 'unavailable', error: loadError, mode: 'unavailable' };
  const aiAvailable = !!lib.isMetaforgeParserAvailable?.();
  const suspended = lib.getAiParsingSuspendedReason?.() || null;
  return {
    status: 'ok',
    aiParserAvailable: aiAvailable,
    aiSuspendedNotice: suspended,
    mode: aiAvailable && !suspended ? 'hybrid-ai-with-fallback' : 'local-deterministic',
  };
}

function requireLib() {
  if (!lib) throw Object.assign(new Error(loadError || 'Resume parser is not loaded'), { status: 503 });
  return lib;
}

export async function parseOne(file: { buffer: Buffer; originalname: string }): Promise<ParsedResume> {
  const raw = await requireLib().parseResumeBuffer(file.buffer, file.originalname || 'resume.pdf');
  return normalize(raw, file.originalname);
}

export async function parseMany(
  files: Array<{ buffer: Buffer; originalname: string }>,
): Promise<BulkParseResult[]> {
  const results = await requireLib().parseResumeBuffersBulk(
    files.map((f) => ({ buffer: f.buffer, filename: f.originalname || 'resume.pdf' })),
  );
  return (results as any[]).map((r) =>
    r.status === 'done'
      ? { sourceFile: r.sourceFile, status: 'done' as const, data: normalize(r.data, r.sourceFile) }
      : { sourceFile: r.sourceFile, status: 'error' as const, error: r.error || 'Failed to parse resume' },
  );
}
