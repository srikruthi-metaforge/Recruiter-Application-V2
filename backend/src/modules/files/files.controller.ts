import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const uploadDir = path.join(process.cwd(), 'uploads');

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /** GET /api/v1/files */
  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.filesService.findAll(req.user, { page, limit, search });
  }

  /** GET /api/v1/files/:id */
  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.filesService.findOne(req.user, id);
  }

  /** GET /api/v1/files/:id/download */
  @Get(':id/download')
  async downloadFile(
    @Req() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { fileRecord, absolutePath } = await this.filesService.getFilePath(
      req.user,
      id,
    );
    res.setHeader('Content-Type', fileRecord.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileRecord.originalName)}"`,
    );
    return res.sendFile(absolutePath);
  }

  /** POST /api/v1/files */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@Req() req: any, @UploadedFile() file: any) {
    return this.filesService.uploadFile(req.user, file);
  }

  /** DELETE /api/v1/files/:id */
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.filesService.remove(req.user, id);
  }
}
