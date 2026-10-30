import { BadRequestException } from '@nestjs/common';
import {
  assertSafeUploadFilename,
  scanUploadBuffer,
  validateUploadedResume,
} from './upload-validation.util';

describe('upload-validation.util', () => {
  it('rejects path traversal / null bytes in filenames', () => {
    expect(() => assertSafeUploadFilename('../etc/passwd.pdf')).not.toThrow();
    expect(assertSafeUploadFilename('../etc/passwd.pdf')).toBe('passwd.pdf');
    expect(() => assertSafeUploadFilename('evil\0.pdf')).toThrow(BadRequestException);
  });

  it('rejects executable content disguised as pdf', () => {
    const pe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
    expect(() => scanUploadBuffer('resume.pdf', pe, 'application/pdf')).toThrow(BadRequestException);
  });

  it('accepts a minimal PDF header without active content', () => {
    const pdf = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
    expect(() => scanUploadBuffer('resume.pdf', pdf, 'application/pdf')).not.toThrow();
  });

  it('rejects PDF with JavaScript action', () => {
    const pdf = Buffer.from('%PDF-1.4\n/JavaScript (app.alert(1))\n%%EOF\n');
    expect(() => scanUploadBuffer('resume.pdf', pdf, 'application/pdf')).toThrow(BadRequestException);
  });

  it('accepts PDF with benign /OpenAction (LaTeX hyperref / open-to-page)', () => {
    const pdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<<\n/Type /Catalog\n/Pages 2 0 R\n/OpenAction 98 0 R\n/PageMode /UseOutlines\n>>\nendobj\n%%EOF\n',
    );
    expect(() => scanUploadBuffer('Ayush_srivastava.pdf', pdf, 'application/pdf')).not.toThrow();
  });

  it('rejects PDF whose /OpenAction launches JavaScript', () => {
    const pdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/OpenAction<</S/JavaScript/JS(app.alert(1))>>>>endobj\n%%EOF\n',
    );
    expect(() => scanUploadBuffer('evil.pdf', pdf, 'application/pdf')).toThrow(BadRequestException);
  });

  it('accepts PDF that only has EmbeddedFile (common in Word/Canva resume exports)', () => {
    const pdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Filespec/EF<</F 2 0 R>>>>endobj\n2 0 obj<</Type/EmbeddedFile/Length 3>>stream\nabc\nendstream\nendobj\n%%EOF\n',
    );
    expect(() => scanUploadBuffer('Haripriya_Fresher_Resume.pdf', pdf, 'application/pdf')).not.toThrow();
  });

  it('rejects EICAR signature', () => {
    const eicar = Buffer.from(
      'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*',
    );
    expect(() =>
      validateUploadedResume({ originalname: 'note.txt', mimetype: 'text/plain', buffer: eicar, size: eicar.length }),
    ).toThrow(BadRequestException);
  });
});
