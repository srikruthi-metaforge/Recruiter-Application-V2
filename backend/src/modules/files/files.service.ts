import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FilesRepository } from './repositories/files.repository';
import { FileMetadataDocument } from './schemas/file-metadata.schema';
import { requireOrgId } from '../../common/security/resource-access.util';
import {
  resolveResumeStorageDir,
  resolveStoredFilePath,
  resolveStorageRoot,
} from '../../common/security/storage-paths.util';
import {
  buildSignedDownloadPath,
  createFileDownloadToken,
  defaultSignedUrlTtlSeconds,
  verifyFileDownloadToken,
} from '../../common/security/signed-url.util';
import {
  assertSafeUploadFilename,
  scanUploadBuffer,
  validateUploadedResume,
} from '../../common/security/upload-validation.util';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly storageRoot: string;

  constructor(private readonly filesRepository: FilesRepository) {
    this.storageRoot = resolveStorageRoot();
    this.logger.log(`Resume storage root: ${this.storageRoot}`);
  }

  private getOrgId(currentUser: any): Types.ObjectId {
    return requireOrgId(currentUser);
  }

  private getUserId(currentUser: any): Types.ObjectId {
    const raw = currentUser?.id || currentUser?._id || currentUser?.userId;
    if (!raw || !Types.ObjectId.isValid(String(raw))) {
      throw new BadRequestException('Authenticated user id is required for uploads');
    }
    return new Types.ObjectId(String(raw));
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
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file payload provided');
    }

    const orgId = this.getOrgId(currentUser);
    const uploadedBy = this.getUserId(currentUser);
    const originalName = assertSafeUploadFilename(file.originalname || 'unnamed_file');

    // Defense in depth: re-scan even if controller already validated.
    let scanStatus: 'CLEAN' | 'INFECTED' | 'PENDING' = 'PENDING';
    try {
      validateUploadedResume({ ...file, originalname: originalName });
      scanUploadBuffer(originalName, file.buffer, file.mimetype);
      scanStatus = 'CLEAN';
    } catch (err) {
      scanStatus = 'INFECTED';
      throw err;
    }

    const count = await this.filesRepository.countFiles(orgId);
    const fileId = `FILE-${Date.now()}-${String(count + 1).padStart(3, '0')}`;
    const ext = path.extname(originalName).toLowerCase() || '.bin';
    const opaqueName = `${crypto.randomUUID()}${ext}`;
    const orgDir = resolveResumeStorageDir(orgId.toString());
    const absolutePath = path.join(orgDir, opaqueName);
    // Relative key under STORAGE_ROOT (never store absolute web paths).
    const storageKey = path
      .relative(this.storageRoot, absolutePath)
      .split(path.sep)
      .join('/');

    fs.writeFileSync(absolutePath, file.buffer, { mode: 0o600 });

    const checksumSha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');

    const saved = await this.filesRepository.create({
      orgId,
      fileId,
      originalName,
      mimeType: file.mimetype || 'application/octet-stream',
      sizeBytes: file.size || file.buffer.length,
      storageProvider: 'LOCAL',
      bucketName: 'private-resumes',
      storageKey,
      checksumSha256,
      scanStatus,
      uploadedBy,
      deletedAt: null,
      schemaVersion: 1,
    });

    const signed = this.createSignedDownloadForRecord(saved, currentUser);
    return {
      ...saved.toObject(),
      id: saved._id.toString(),
      downloadUrl: signed.url,
      downloadExpiresAt: signed.expiresAt,
    };
  }

  /** Mint a short-lived signed download URL (auth required). */
  async createSignedDownloadUrl(
    currentUser: any,
    id: string,
    expiresInSeconds?: number,
  ): Promise<{ url: string; expiresAt: string; token: string }> {
    const file = await this.findOne(currentUser, id);
    if (file.scanStatus === 'INFECTED') {
      throw new BadRequestException('Infected file cannot be downloaded');
    }
    return this.createSignedDownloadForRecord(file, currentUser, expiresInSeconds);
  }

  private createSignedDownloadForRecord(
    file: FileMetadataDocument,
    currentUser: any,
    expiresInSeconds?: number,
  ): { url: string; expiresAt: string; token: string } {
    const ttl = Math.min(
      Math.max(Number(expiresInSeconds) || defaultSignedUrlTtlSeconds(), 30),
      3600,
    );
    const exp = Math.floor(Date.now() / 1000) + ttl;
    const token = createFileDownloadToken({
      fid: file._id.toString(),
      oid: file.orgId.toString(),
      uid: (currentUser?.id || currentUser?._id || '').toString() || undefined,
      exp,
    });
    return {
      token,
      url: buildSignedDownloadPath(token),
      expiresAt: new Date(exp * 1000).toISOString(),
    };
  }

  /**
   * New resumes live under STORAGE_ROOT. Older uploads were written as a bare
   * filename in backend/uploads and are still readable from there.
   */
  private resolveExistingFilePath(storageKey: string): string {
    const primary = resolveStoredFilePath(storageKey);
    if (fs.existsSync(primary)) return primary;

    const key = String(storageKey || '').replace(/\\/g, '/').replace(/^\/+/, '');
    if (!key || key.includes('..') || key.includes('/') || path.isAbsolute(storageKey)) {
      throw new NotFoundException('File content on disk not found');
    }
    const legacyRoot = path.resolve(process.cwd(), 'uploads');
    const legacy = path.resolve(legacyRoot, key);
    const rootWithSep = legacyRoot.endsWith(path.sep) ? legacyRoot : legacyRoot + path.sep;
    if (!legacy.toLowerCase().startsWith(rootWithSep.toLowerCase()) || !fs.existsSync(legacy)) {
      throw new NotFoundException('File content on disk not found');
    }
    return legacy;
  }

  async getFilePath(currentUser: any, id: string): Promise<{ fileRecord: FileMetadataDocument; absolutePath: string }> {
    const fileRecord = await this.findOne(currentUser, id);
    if (fileRecord.scanStatus === 'INFECTED') {
      throw new BadRequestException('Infected file cannot be downloaded');
    }
    const absolutePath = this.resolveExistingFilePath(fileRecord.storageKey);
    return { fileRecord, absolutePath };
  }

  /** Resolve path using signed token only (no session) — for time-boxed downloads. */
  async getFilePathFromSignedToken(token: string): Promise<{ fileRecord: FileMetadataDocument; absolutePath: string }> {
    const claims = verifyFileDownloadToken(token);
    if (!Types.ObjectId.isValid(claims.oid)) {
      throw new BadRequestException('Invalid organization in download token');
    }
    const orgId = new Types.ObjectId(claims.oid);
    const fileRecord = await this.filesRepository.findById(orgId, claims.fid);
    if (!fileRecord) {
      throw new NotFoundException('File not found');
    }
    if (fileRecord.scanStatus === 'INFECTED') {
      throw new BadRequestException('Infected file cannot be downloaded');
    }
    const absolutePath = this.resolveExistingFilePath(fileRecord.storageKey);
    return { fileRecord, absolutePath };
  }

  /** True when file metadata points at a readable file outside the web root. */
  isReadable(file: FileMetadataDocument | null | undefined): boolean {
    if (!file?.storageKey || file.scanStatus === 'INFECTED') return false;
    try {
      this.resolveExistingFilePath(file.storageKey);
      return true;
    } catch {
      return false;
    }
  }

  /** Load a stored file by mongo id or business file id when its bytes are on disk. */
  async readableById(currentUser: any, id: string): Promise<FileMetadataDocument | null> {
    const raw = String(id || '').trim();
    if (!raw) return null;
    try {
      const file = await this.findOne(currentUser, raw);
      return this.isReadable(file) ? file : null;
    } catch (err) {
      if (err instanceof NotFoundException) return null;
      throw err;
    }
  }

  /**
   * Find a resume already in file_metadata, or copy it in from the V1 resumes
   * folder when that file is still on disk. Returns null when only a filename exists.
   */
  async locateOrImportResumeByName(
    currentUser: any,
    rawNames: string[],
    uploadedBy?: Types.ObjectId,
  ): Promise<FileMetadataDocument | null> {
    const orgId = this.getOrgId(currentUser);
    const names = this.safeResumeBasenames(rawNames);
    if (!names.length) return null;

    const existing = await this.filesRepository.findByResumeNames(orgId, names);
    if (existing && this.isReadable(existing)) return existing;

    const fileName = existing?.originalName || names[0];
    const sourcePath = this.findLegacyResumePath(names);
    if (!sourcePath) return null;

    if (existing) {
      existing.storageKey = this.copyResumeIntoStorage(orgId, sourcePath, fileName);
      existing.sizeBytes = fs.statSync(sourcePath).size;
      existing.checksumSha256 = this.checksumFile(sourcePath);
      existing.scanStatus = 'CLEAN';
      existing.deletedAt = null;
      await existing.save();
      return existing;
    }

    const owner = uploadedBy && Types.ObjectId.isValid(String(uploadedBy))
      ? new Types.ObjectId(String(uploadedBy))
      : this.getUserId(currentUser);
    const ext = path.extname(fileName).toLowerCase();
    const count = await this.filesRepository.countFiles(orgId);
    const saved = await this.filesRepository.create({
      orgId,
      fileId: `FILE-V1-${Date.now()}-${String(count + 1).padStart(3, '0')}`,
      originalName: fileName,
      mimeType: this.mimeForExtension(ext),
      sizeBytes: fs.statSync(sourcePath).size,
      storageProvider: 'LOCAL',
      bucketName: 'private-resumes',
      storageKey: this.copyResumeIntoStorage(orgId, sourcePath, fileName),
      checksumSha256: this.checksumFile(sourcePath),
      scanStatus: 'CLEAN',
      uploadedBy: owner,
      deletedAt: null,
      legacyPostgresId: `resume:${fileName}`,
      legacy: { v1ResumeUrl: fileName, v1SourcePath: sourcePath },
      schemaVersion: 1,
    });
    return saved;
  }

  private safeResumeBasenames(rawNames: string[]): string[] {
    const names = new Set<string>();
    for (const raw of rawNames) {
      const base = path.basename(String(raw || '').replace(/\\/g, '/')).trim();
      if (!base || base === '.' || base === '..' || base.includes('..') || base.length > 255) continue;
      names.add(base);
    }
    return [...names];
  }

  private legacyResumeDirs(): string[] {
    const guesses = [
      (process.env.V1_RESUMES_DIR || '').trim(),
      path.resolve(process.cwd(), 'uploads', 'resumes'),
      path.resolve(
        process.cwd(),
        '..',
        'V1_postgre_backup',
        'staffing_db_full_2026-10-31_120514',
        'uploads',
        'resumes',
      ),
      path.resolve(
        process.cwd(),
        'V1_postgre_backup',
        'staffing_db_full_2026-10-31_120514',
        'uploads',
        'resumes',
      ),
    ];
    const dirs: string[] = [];
    const seen = new Set<string>();
    for (const guess of guesses) {
      if (!guess) continue;
      const abs = path.resolve(guess);
      const key = abs.toLowerCase();
      if (seen.has(key) || !fs.existsSync(abs)) continue;
      seen.add(key);
      try {
        if (fs.statSync(abs).isDirectory()) dirs.push(abs);
      } catch {
        /* skip unreadable dirs */
      }
    }
    return dirs;
  }

  private findLegacyResumePath(names: string[]): string | null {
    for (const dir of this.legacyResumeDirs()) {
      const rootWithSep = dir.endsWith(path.sep) ? dir : dir + path.sep;
      for (const name of names) {
        const candidate = path.resolve(dir, name);
        if (!candidate.toLowerCase().startsWith(rootWithSep.toLowerCase())) continue;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
      }
    }
    return null;
  }

  private copyResumeIntoStorage(orgId: Types.ObjectId, sourcePath: string, originalName: string): string {
    const ext = path.extname(originalName).toLowerCase() || '.bin';
    const opaqueName = `${crypto.randomUUID()}${ext}`;
    const orgDir = resolveResumeStorageDir(orgId.toString());
    const absolutePath = path.join(orgDir, opaqueName);
    fs.copyFileSync(sourcePath, absolutePath);
    try {
      fs.chmodSync(absolutePath, 0o600);
    } catch {
      /* windows may ignore chmod */
    }
    return path.relative(this.storageRoot, absolutePath).split(path.sep).join('/');
  }

  private checksumFile(absolutePath: string): string {
    return crypto.createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex');
  }

  private mimeForExtension(ext: string): string {
    const mime: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.rtf': 'application/rtf',
    };
    return mime[ext] || 'application/octet-stream';
  }

  async remove(currentUser: any, id: string) {
    const orgId = this.getOrgId(currentUser);
    const file = await this.filesRepository.findById(orgId, id);
    if (!file) {
      throw new NotFoundException(`File with ID "${id}" not found`);
    }

    await this.filesRepository.softDelete(orgId, id);

    try {
      const diskPath = this.resolveExistingFilePath(file.storageKey);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch (err) {
      this.logger.warn(`Disk cleanup failed for ${id}: ${(err as Error).message}`);
    }

    return { success: true, message: `File ${id} deleted successfully` };
  }
}
