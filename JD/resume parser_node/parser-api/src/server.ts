import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as crypto from 'crypto';
import { PARSER_API_KEY, PORT } from './config';
import {
  initResumeParser,
  parseMany,
  parseOne,
  resumeHealth,
} from './resume';
import { extractFromFile, extractFromText, initJdParser, jdHealth } from './jd';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
});

function requireApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!PARSER_API_KEY) return next();
  const key = String(req.header('X-API-Key') || '');
  const a = Buffer.from(key);
  const b = Buffer.from(PARSER_API_KEY);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Invalid or missing X-API-Key' });
  }
  return next();
}

initResumeParser();
initJdParser();

app.get('/', (_req, res) => {
  res.json({
    service: 'metaforge-parser-api',
    status: 'ok',
    health: '/health',
    resume: 'POST /v1/resume/parse , POST /v1/resume/parse/bulk',
    jd: 'POST /v1/jd/extract',
    note: 'Nest proxies resume/JD here when PARSER_API_URL is set.',
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'metaforge-parser-api',
    resume: resumeHealth(),
    jd: jdHealth(),
  });
});

app.post('/v1/resume/parse', requireApiKey, upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    if (!file?.buffer?.length) {
      return res.status(400).json({ error: 'Upload a resume under the form field "resume"' });
    }
    const data = await parseOne({
      buffer: file.buffer,
      originalname: file.originalname || 'resume.pdf',
    });
    return res.json({ success: true, data });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || 'Resume parse failed' });
  }
});

app.post('/v1/resume/parse/bulk', requireApiKey, upload.array('resumes', 5), async (req, res) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) || [];
    const valid = files.filter((f) => f?.buffer?.length);
    if (!valid.length) {
      return res.status(400).json({ error: 'Upload at least one resume under the form field "resumes"' });
    }
    const results = await parseMany(
      valid.map((f) => ({ buffer: f.buffer, originalname: f.originalname || 'resume.pdf' })),
    );
    return res.json({
      success: true,
      count: results.length,
      parsed: results.filter((r) => r.status === 'done').length,
      failed: results.filter((r) => r.status === 'error').length,
      notice: resumeHealth().aiSuspendedNotice || null,
      results,
    });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || 'Bulk resume parse failed' });
  }
});

app.post('/v1/jd/extract', requireApiKey, upload.single('file'), async (req, res) => {
  try {
    const subjectHint =
      typeof req.body?.subject === 'string' ? String(req.body.subject).trim() : undefined;
    const bodyText = typeof req.body?.text === 'string' ? String(req.body.text).trim() : '';
    let data;
    if (req.file?.buffer?.length) {
      data = await extractFromFile(
        { buffer: req.file.buffer, originalname: req.file.originalname || 'jd.pdf' },
        subjectHint,
      );
    } else if (bodyText) {
      data = await extractFromText(bodyText, subjectHint);
    } else {
      return res.status(400).json({
        error: 'Provide pasted JD text (min 50 characters) or upload a PDF/DOCX file.',
      });
    }
    return res.json({ success: true, message: 'JD extracted successfully', data });
  } catch (err: any) {
    const status = err?.status || 500;
    return res.status(status).json({ error: err?.message || 'JD extract failed' });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MetaForge parser-api listening on http://0.0.0.0:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Resume: ${JSON.stringify(resumeHealth())}`);
  // eslint-disable-next-line no-console
  console.log(`JD: ${JSON.stringify(jdHealth())}`);
});
