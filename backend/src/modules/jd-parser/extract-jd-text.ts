import * as path from 'path';
import mammoth from 'mammoth';

export type ExtractJdTextResult = {
  text: string;
  error?: string;
};

function normalize(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Extract plain text from an uploaded JD PDF/DOCX/DOC buffer. */
export async function extractJdTextFromBuffer(
  buffer: Buffer,
  originalname: string,
): Promise<ExtractJdTextResult> {
  const ext = path.extname(originalname || '').toLowerCase();
  try {
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      const text = normalize(result.value || '');
      return text
        ? { text }
        : { text: '', error: 'Could not read text from this DOCX file.' };
    }

    if (ext === '.doc') {
      return {
        text: '',
        error: 'Legacy .doc is not supported. Please upload PDF or DOCX.',
      };
    }

    if (ext === '.pdf' || !ext) {
      // pdf-parse v2 CJS export
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      if (typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          /* ignore */
        }
      }
      const text = normalize(typeof data?.text === 'string' ? data.text : '');
      return text
        ? { text }
        : { text: '', error: 'Could not read text from this PDF. Try DOCX or paste the JD.' };
    }

    return { text: '', error: 'Unsupported file type. Upload PDF or DOCX.' };
  } catch (err: any) {
    return {
      text: '',
      error: err?.message || 'Failed to read document text.',
    };
  }
}
