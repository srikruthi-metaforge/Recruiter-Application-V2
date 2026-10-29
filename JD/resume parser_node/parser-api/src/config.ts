import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// parser-api → "resume parser_node" → JD → repo root
const ROOT = path.resolve(__dirname, '..');
export const BUNDLE_ROOT = path.resolve(ROOT, '..');
export const REPO_ROOT = path.resolve(BUNDLE_ROOT, '..', '..');
dotenv.config({ path: path.join(ROOT, '.env') });

export function env(name: string, fallback = ''): string {
  return String(process.env[name] ?? fallback).trim();
}

export const PORT = parseInt(env('PORT', '8001'), 10) || 8001;
export const PARSER_API_KEY = env('PARSER_API_KEY');

export function resumeParserDir(): string {
  return (
    env('RESUME_PARSER_DIR') ||
    path.join(BUNDLE_ROOT, 'resume-parser-module-ready')
  );
}

export function jdParserDistDir(): string {
  return (
    env('JD_PARSER_DIST') ||
    path.join(REPO_ROOT, 'backend', 'dist', 'modules', 'jd-parser')
  );
}

/** Load GEMINI_* from known .env files without overriding existing values. */
export function loadGeminiSettings(...envFiles: string[]) {
  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) continue;
    for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*(GEMINI_[A-Z_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, '').trim();
      if (value && !process.env[m[1]]) process.env[m[1]] = value;
    }
  }
}
