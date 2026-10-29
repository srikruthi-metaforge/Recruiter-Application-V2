import * as path from 'path';
import { BUNDLE_ROOT, jdParserDistDir, loadGeminiSettings, resumeParserDir } from './config';

const MIN_JD_CHARS = 50;

let analyzeJdText: any = null;
let parseJdToFormFields: any = null;
let extractJdTextFromBuffer: any = null;
let loadError: string | null = null;

export function initJdParser() {
  const dist = jdParserDistDir();
  try {
    loadGeminiSettings(
      path.join(resumeParserDir(), '.env'),
      path.join(BUNDLE_ROOT, 'jd-module', '.env'),
      path.resolve(__dirname, '..', '.env'),
    );
    // Same compiled Nest jd-parser lib (business logic unchanged).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    analyzeJdText = require(path.join(dist, 'lib', 'analyser', 'analyzeJd')).analyzeJdText;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    parseJdToFormFields = require(path.join(dist, 'lib', 'jdFieldExtractor')).parseJdToFormFields;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    extractJdTextFromBuffer = require(path.join(dist, 'extract-jd-text')).extractJdTextFromBuffer;
    loadError = null;
  } catch (err: any) {
    analyzeJdText = null;
    parseJdToFormFields = null;
    extractJdTextFromBuffer = null;
    loadError = `JD parser not available at ${dist}: ${err?.message}. Build the Nest backend first (npm run build).`;
  }
}

export function jdHealth() {
  return {
    status: analyzeJdText ? 'ok' : 'unavailable',
    error: loadError,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    minChars: MIN_JD_CHARS,
  };
}

async function runExtract(jdText: string, subjectHint?: string) {
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
    const fallback = parseJdToFormFields(jdText, { subjectHint });
    return {
      ...fallback,
      jdDescription: fallback.jdDescription ?? jdText.trim(),
      usedFallbackParser: true,
      fallbackReason: llmError?.message || String(llmError),
    };
  }
}

export async function extractFromText(text: string, subjectHint?: string) {
  if (!analyzeJdText) {
    throw Object.assign(new Error(loadError || 'JD parser is not loaded'), { status: 503 });
  }
  const jdText = String(text || '').trim();
  if (jdText.length < MIN_JD_CHARS) {
    throw Object.assign(
      new Error(`Job description is too short (minimum ${MIN_JD_CHARS} characters).`),
      { status: 400 },
    );
  }
  return runExtract(jdText, subjectHint);
}

export async function extractFromFile(
  file: { buffer: Buffer; originalname: string },
  subjectHint?: string,
) {
  if (!analyzeJdText || !extractJdTextFromBuffer) {
    throw Object.assign(new Error(loadError || 'JD parser is not loaded'), { status: 503 });
  }
  if (!file?.buffer?.length) {
    throw Object.assign(new Error('Upload a JD file under the form field "file".'), { status: 400 });
  }
  const { text, error } = await extractJdTextFromBuffer(file.buffer, file.originalname || 'jd.pdf');
  if (!String(text || '').trim()) {
    throw Object.assign(
      new Error(error || 'Could not read text from this document. Try PDF or DOCX.'),
      { status: 400 },
    );
  }
  if (String(text).trim().length < MIN_JD_CHARS) {
    throw Object.assign(
      new Error(`Job description is too short (minimum ${MIN_JD_CHARS} characters).`),
      { status: 400 },
    );
  }
  return runExtract(String(text).trim(), subjectHint);
}
