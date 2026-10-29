import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as path from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JdParserService } from './jd-parser.service';

const MAX_JD_BYTES = 10 * 1024 * 1024;

const uploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_JD_BYTES, files: 1 },
  fileFilter: (
    _req: unknown,
    file: { originalname?: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      return cb(new BadRequestException('Only PDF or DOCX files are allowed'), false);
    }
    return cb(null, true);
  },
};

@Controller('jd-parser')
@UseGuards(JwtAuthGuard)
export class JdParserController {
  constructor(private readonly jdParser: JdParserService) {}

  /** GET /api/v1/jd-parser/health */
  @Get('health')
  health() {
    return this.jdParser.health();
  }

  /**
   * POST /api/v1/jd-parser/extract
   * Accepts either JSON `{ text }` or multipart `file` (+ optional `text` / `subject`).
   */
  @Post('extract')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async extract(
    @UploadedFile() file?: { buffer?: Buffer; originalname?: string },
    @Body() body?: { text?: string; subject?: string },
  ) {
    const subjectHint = typeof body?.subject === 'string' ? body.subject.trim() : undefined;
    const bodyText = typeof body?.text === 'string' ? body.text.trim() : '';

    let data;
    if (file?.buffer?.length) {
      data = await this.jdParser.extractFromFile(
        { buffer: file.buffer, originalname: file.originalname || 'jd.pdf' },
        subjectHint,
      );
    } else if (bodyText) {
      data = await this.jdParser.extractFromText(bodyText, subjectHint);
    } else {
      throw new BadRequestException(
        'Provide pasted JD text (min 50 characters) or upload a PDF/DOCX file.',
      );
    }

    return { success: true, message: 'JD extracted successfully', data };
  }
}
