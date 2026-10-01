import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FilesRepository } from './repositories/files.repository';
import { FileMetadataDocument } from './schemas/file-metadata.schema';

@Injectable()
export class FilesService {
  private readonly uploadDir: string;

  constructor(private readonly filesRepository: FilesRepository) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getOrgId(currentUser: any): Types.ObjectId {
    return currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
  }

  private getUserId(currentUser: any): Types.ObjectId {
    return currentUser?.id || currentUser?._id
      ? new Types.ObjectId((currentUser.id || currentUser._id).toString())
      : new Types.ObjectId('6ab6245b10fcb90ec8ecbf01');
  }

  async findAll(currentUser: any, query?: { page?: string; limit?: string; search?: string }) {
    const orgId = this.getOrgId(currentUser);
    const filter: Record<string, any> = { orgId, deletedAt: null };

    if (query?.search && query.search.trim()) {
      const term = query.search.trim();
      const regex = new RegExp(term, 'i');
      filter.$or = [
        { originalName: regex },
        { fileId: regex },
        { mimeType: regex },
      ];
    }

    const page = Math.max(1, parseInt(String(query?.page || 1), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query?.limit || 20), 10)));

    return this.filesRepository.findAll(filter, page, limit);
  }

  async findOne(currentUser: any, id: string) {
    const orgId = this.getOrgId(currentUser);
    const file = await this.filesRepository.findById(orgId, id);
    if (!file) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }
    return file;
  }

  async uploadFile(currentUser: any, file: any) {
    if (!file) {
      throw new BadRequestException('No file payload provided');
    }

    const orgId = this.getOrgId(currentUser);
    const uploadedBy = this.getUserId(currentUser);

    const count = await this.filesRepository.countFiles(orgId);
    const fileId = `FILE-${Date.now()}-${String(count + 1).padStart(3, '0')}`;

    // Storage key: filename stored on local disk
    const storageKey = file.filename || `${fileId}-${file.originalname}`;
    const filePath = file.path || path.join(this.uploadDir, storageKey);

    // If file was passed as buffer (memory storage), write it to disk
    if (file.buffer && !fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.buffer);
    }

    // Compute checksum
    let checksumSha256 = '';
    try {
      if (fs.existsSync(filePath)) {
        const fileBuf = fs.readFileSync(filePath);
        checksumSha256 = crypto.createHash('sha256').update(fileBuf).digest('hex');
      }
    } catch {
      checksumSha256 = '';
    }

    return this.filesRepository.create({
      orgId,
      fileId,
      originalName: file.originalname || 'unnamed_file',
      mimeType: file.mimetype || 'application/octet-stream',
      sizeBytes: file.size || (fs.existsSync(filePath) ? fs.statSync(filePath).size : 0),
      storageProvider: 'LOCAL',
      bucketName: 'uploads',
      storageKey,
      checksumSha256,
      scanStatus: 'CLEAN',
      uploadedBy,
      deletedAt: null,
      schemaVersion: 1,
    });
  }

  async getFilePath(currentUser: any, id: string): Promise<{ fileRecord: FileMetadataDocument; absolutePath: string }> {
    const fileRecord = await this.findOne(currentUser, id);
    const absolutePath = path.join(this.uploadDir, fileRecord.storageKey);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException(`File content on disk for "${id}" not found`);
    }

    return { fileRecord, absolutePath };
  }

  async remove(currentUser: any, id: string) {
    const orgId = this.getOrgId(currentUser);
    const file = await this.filesRepository.findById(orgId, id);
    if (!file) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }

    // Soft delete metadata
    await this.filesRepository.softDelete(orgId, id);

    // Optionally delete disk file if it exists
    const diskPath = path.join(this.uploadDir, file.storageKey);
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch {
        // Log or ignore disk cleanup error
      }
    }

    return { success: true, message: `File ${id} deleted successfully` };
  }
}
