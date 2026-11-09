import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import {
  CandidateDocumentRecord,
  CandidateDocumentRecordDocument,
} from './schemas/candidate-document.schema';
import { CandidateRepository } from './repositories/candidate.repository';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { DuplicateCheckDto } from './dto/duplicate-check.dto';
import { assertCanAccessCandidate, orgScope, requireOrgId } from '../../common/security/resource-access.util';

import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { FilesService } from '../files/files.service';
import {
  displayCandidateId,
  formatCandidateId,
  parseCandidateSeq,
} from '../../common/candidate-id.util';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(CandidateDocumentRecord.name)
    private readonly candidateDocumentModel: Model<CandidateDocumentRecordDocument>,
    private readonly candidateRepository: CandidateRepository,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly filesService: FilesService,
  ) {}

  /** Format document for API output */
  private sanitizeCandidate(doc: any, fallbackCreatedByName?: string) {
    const obj = doc.toObject ? doc.toObject() : doc;

    const skillsList = Array.isArray(obj.skills) && obj.skills.length > 0
      ? obj.skills
      : (Array.isArray(obj.primarySkills) && obj.primarySkills.length > 0
          ? obj.primarySkills
          : (typeof obj.skills === 'string' ? obj.skills.split(',').map((s: string) => s.trim()) : []));

    const nameVal = obj.name || obj.fullName || 'N/A';
    const sourced =
      obj.sourcedByRecruiterId && typeof obj.sourcedByRecruiterId === 'object'
        ? obj.sourcedByRecruiterId
        : null;
    const sourcedId = sourced?._id
      ? String(sourced._id)
      : obj.sourcedByRecruiterId
        ? String(obj.sourcedByRecruiterId)
        : null;
    const createdByName =
      (sourced?.name && String(sourced.name).trim()) ||
      (obj.createdByName && String(obj.createdByName).trim()) ||
      (fallbackCreatedByName && String(fallbackCreatedByName).trim()) ||
      '';

    return {
      ...obj,
      id: obj._id ? obj._id.toString() : obj.id,
      candidateId: displayCandidateId(obj.candidateId, '—'),
      name: nameVal,
      fullName: nameVal,
      email: obj.email || '',
      phone: obj.phone || '',
      linkedInUrl: obj.linkedInUrl || null,
      currentCompany: obj.currentCompany || null,
      qualification: obj.qualification || null,
      totalExperienceYears: typeof obj.totalExperienceYears === 'number' ? obj.totalExperienceYears : (typeof obj.experience === 'number' ? obj.experience : 0),
      relevantExperienceYears: typeof obj.relevantExperienceYears === 'number' ? obj.relevantExperienceYears : 0,
      currentCtc: typeof obj.currentCtc === 'number' ? obj.currentCtc : (typeof obj.currentCtcLpa === 'number' ? obj.currentCtcLpa : 0),
      expectedCtc: typeof obj.expectedCtc === 'number' ? obj.expectedCtc : (typeof obj.expectedCtcLpa === 'number' ? obj.expectedCtcLpa : 0),
      noticePeriodDays: typeof obj.noticePeriodDays === 'number' ? obj.noticePeriodDays : 30,
      currentLocation: obj.currentLocation || 'N/A',
      preferredLocation: obj.preferredLocation || (Array.isArray(obj.preferredLocations) ? obj.preferredLocations.join(', ') : 'N/A'),
      offerInHand: obj.offerInHand || 'No',
      interviewAvailability: obj.interviewAvailability || null,
      reasonForChange: obj.reasonForChange || null,
      notes: obj.notes || null,
      skills: skillsList,
      primarySkills: skillsList,
      resumeFileId: obj.resumeFileId ? String(obj.resumeFileId) : null,
      resumeFileName: obj.resumeFileName || null,
      resumeUrl: obj.resumeFileId
        ? `/api/v1/files/${String(obj.resumeFileId)}/download`
        : (obj.resumeUrl || obj.resumeFileUrl || null),
      status: obj.status || 'New',
      sourcedByRecruiterId: sourcedId,
      createdByName,
      createdAt: obj.createdAt || new Date(),
      updatedAt: obj.updatedAt || new Date(),
    };
  }

  private async withSourcedRecruiter(doc: CandidateDocument | null) {
    if (!doc) return doc;
    await doc.populate('sourcedByRecruiterId', 'name email');
    return doc;
  }

  /**
   * Next unique candidate number for the org.
   * Continues from the highest existing id in Mongo (after dump/restore), e.g. 20834 → 20835.
   * Stored as plain digits to match repository UI (not CAND-xxxxx).
   */
  async generateCandidateId(orgId: Types.ObjectId): Promise<string> {
    const db = this.candidateModel.db;
    const counters = db.collection('counters');
    const counterKey = `candidateId:${orgId.toString()}`;

    const existing = await counters.findOne({ _id: counterKey } as any);
    if (!existing) {
      const rows = await this.candidateModel
        .find({ orgId, deletedAt: null })
        .select('candidateId')
        .lean()
        .exec();
      let maxSeq = 0;
      for (const row of rows as Array<{ candidateId?: string }>) {
        const n = parseCandidateSeq(row.candidateId);
        if (n != null && n > maxSeq) maxSeq = n;
      }
      await counters.updateOne(
        { _id: counterKey } as any,
        { $setOnInsert: { seq: maxSeq, orgId } },
        { upsert: true },
      );
    }

    const updated: any = await counters.findOneAndUpdate(
      { _id: counterKey } as any,
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true },
    );
    const seq = Number(updated?.seq ?? updated?.value?.seq ?? 0);
    if (!Number.isFinite(seq) || seq <= 0) {
      const rows = await this.candidateModel.find({ orgId, deletedAt: null }).select('candidateId').lean().exec();
      let maxSeq = 0;
      for (const row of rows as Array<{ candidateId?: string }>) {
        const n = parseCandidateSeq(row.candidateId);
        if (n != null && n > maxSeq) maxSeq = n;
      }
      const next = maxSeq + 1;
      await counters.updateOne({ _id: counterKey } as any, { $set: { seq: next, orgId } }, { upsert: true });
      return formatCandidateId(next);
    }
    return formatCandidateId(seq);
  }

  /** GET /api/v1/candidates */
  async findAll(
    currentUser: any,
    query?: {
      search?: string;
      skill?: string;
      minExperience?: number;
      maxExperience?: number;
      noticePeriod?: number;
      location?: string;
      status?: string;
      /** User id (sourcedByRecruiterId) or creator display name */
      createdBy?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const orgId = requireOrgId(currentUser);

    const filter: Record<string, any> = { orgId, deletedAt: null };

    if (query?.status) {
      filter.status = query.status;
    }

    // Filter by who added the candidate (Created By → sourcedByRecruiterId).
    // Fail closed: if a creator filter was requested but cannot be resolved,
    // return an empty page — never the full org repository.
    const createdBy = String(query?.createdBy || '').trim();
    if (createdBy) {
      const resolvedCreatorId = await this.resolveCreatedByRecruiterId(orgId, createdBy);
      if (!resolvedCreatorId) {
        const pageEarly = query?.page ? Math.max(1, Number(query.page)) : 1;
        const limitEarly = query?.limit ? Math.max(1, Math.min(100, Number(query.limit))) : 0;
        if (limitEarly > 0) {
          return { items: [], total: 0, page: pageEarly, limit: limitEarly, totalPages: 0 };
        }
        return [];
      }
      filter.sourcedByRecruiterId = resolvedCreatorId;
    }

    if (query?.minExperience !== undefined && !isNaN(Number(query.minExperience))) {
      filter.totalExperienceYears = { $gte: Number(query.minExperience) };
    }

    if (query?.maxExperience !== undefined && !isNaN(Number(query.maxExperience))) {
      filter.totalExperienceYears = {
        ...filter.totalExperienceYears,
        $lte: Number(query.maxExperience),
      };
    }

    if (query?.noticePeriod !== undefined && !isNaN(Number(query.noticePeriod))) {
      filter.noticePeriodDays = { $lte: Number(query.noticePeriod) };
    }

    if (query?.location) {
      const locRegex = new RegExp(query.location.trim(), 'i');
      filter.$or = [{ currentLocation: locRegex }, { preferredLocation: locRegex }, { preferredLocations: locRegex }];
    }

    if (query?.skill) {
      const skillRegex = new RegExp(query.skill.trim(), 'i');
      filter.$or = [{ skills: skillRegex }, { primarySkills: skillRegex }, { secondarySkills: skillRegex }];
    }

    if (query?.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { candidateId: searchRegex },
        { skills: searchRegex },
        { primarySkills: searchRegex },
      ];
    }

    const page = query?.page ? Math.max(1, Number(query.page)) : 1;
    // Cap page size for UI pagination (never allow unbounded page storms from clients).
    const limit = query?.limit ? Math.max(1, Math.min(100, Number(query.limit))) : 0;

    if (limit > 0) {
      const [items, total] = await Promise.all([
        this.candidateModel
          .find(filter)
          .populate('sourcedByRecruiterId', 'name email')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec(),
        this.candidateModel.countDocuments(filter).exec(),
      ]);

      return {
        items: items.map((item) => this.sanitizeCandidate(item)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // Array shape is unchanged. The read is capped so an omitted limit cannot scan the collection.
    const items = await this.candidateModel
      .find(filter)
      .populate('sourcedByRecruiterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean()
      .exec();
    return items.map((item) => this.sanitizeCandidate(item));
  }

  /** Resolve Created By filter to a recruiter Mongo ObjectId (id / userId / email). */
  private async resolveCreatedByRecruiterId(
    orgId: Types.ObjectId,
    createdBy: string,
  ): Promise<Types.ObjectId | null> {
    const raw = String(createdBy || '').trim();
    if (!raw) return null;
    if (Types.ObjectId.isValid(raw) && String(new Types.ObjectId(raw)) === raw) {
      return new Types.ObjectId(raw);
    }
    const user = await this.candidateModel.db.collection('users').findOne(
      {
        orgId,
        $and: [
          { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
          { $or: [{ userId: raw }, { email: raw.toLowerCase() }] },
        ],
      },
      { projection: { _id: 1 } },
    );
    return user?._id ? new Types.ObjectId(String(user._id)) : null;
  }

  /**
   * GET /api/v1/candidates/sourced-by/:recruiterId
   * Paged Candidate Repository rows for one sourcer (always filtered).
   * Optional `from` / `to` (ISO dates) filter on candidate.createdAt for period KPIs.
   */
  async findSourcedByRecruiter(
    currentUser: any,
    recruiterId: string,
    page = 1,
    limit = 10,
    from?: string,
    to?: string,
  ) {
    const orgId = requireOrgId(currentUser);
    const resolved = await this.resolveCreatedByRecruiterId(orgId, recruiterId);
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    if (!resolved) {
      return { items: [], total: 0, page: safePage, limit: safeLimit, totalPages: 0 };
    }
    const filter: Record<string, any> = {
      orgId,
      deletedAt: null,
      sourcedByRecruiterId: resolved,
    };
    const createdAt: Record<string, Date> = {};
    if (from) {
      const start = new Date(from);
      if (!Number.isNaN(start.getTime())) createdAt.$gte = start;
    }
    if (to) {
      const end = new Date(to);
      if (!Number.isNaN(end.getTime())) createdAt.$lte = end;
    }
    if (Object.keys(createdAt).length > 0) {
      filter.createdAt = createdAt;
    }
    const [items, total] = await Promise.all([
      this.candidateModel
        .find(filter)
        .populate('sourcedByRecruiterId', 'name email')
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .exec(),
      this.candidateModel.countDocuments(filter).exec(),
    ]);
    return {
      items: items.map((item) => this.sanitizeCandidate(item)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 0,
    };
  }

  /**
   * GET /api/v1/candidates/sourced-counts
   * One aggregation: active repo candidates grouped by sourcedByRecruiterId.
   */
  async sourcedCountsByRecruiter(currentUser: any) {
    const orgId = requireOrgId(currentUser);
    const [rows, total] = await Promise.all([
      this.candidateModel
        .aggregate<{ _id: Types.ObjectId | null; count: number }>([
          { $match: { orgId, deletedAt: null } },
          { $group: { _id: '$sourcedByRecruiterId', count: { $sum: 1 } } },
        ])
        .exec(),
      // Full Candidate Repository size for the org (includes records with no sourcer id).
      this.candidateModel.countDocuments({ orgId, deletedAt: null }).exec(),
    ]);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      if (!row?._id) continue;
      const key = String(row._id);
      counts[key] = Number(row.count) || 0;
    }
    return { counts, total: Number(total) || 0 };
  }

  /**
   * GET /api/v1/candidates/sourced-trend
   * Daily Candidate Repository counts (createdAt) for the chart window.
   * Omit recruiterId for the whole organization.
   */
  async sourcedTrend(
    currentUser: any,
    query?: { from?: string; to?: string; recruiterId?: string; timezone?: string },
  ) {
    const orgId = requireOrgId(currentUser);
    const filter: Record<string, any> = { orgId, deletedAt: null };
    const recruiterId = String(query?.recruiterId || '').trim();
    if (recruiterId) {
      const resolved = await this.resolveCreatedByRecruiterId(orgId, recruiterId);
      if (!resolved) return { days: [] as { date: string; count: number }[] };
      filter.sourcedByRecruiterId = resolved;
    }
    const createdAt: Record<string, Date> = {};
    if (query?.from) {
      const start = new Date(query.from);
      if (!Number.isNaN(start.getTime())) createdAt.$gte = start;
    }
    if (query?.to) {
      const end = new Date(query.to);
      if (!Number.isNaN(end.getTime())) createdAt.$lte = end;
    }
    if (Object.keys(createdAt).length > 0) filter.createdAt = createdAt;

    const requestedTz = String(query?.timezone || '').trim();
    const timezone = /^[A-Za-z0-9_+\-/]{1,64}$/.test(requestedTz) ? requestedTz : 'Asia/Kolkata';
    const rows = await this.candidateModel
      .aggregate<{ _id: string; count: number }>([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();
    return {
      days: rows
        .filter((row) => row?._id)
        .map((row) => ({ date: String(row._id), count: Number(row.count) || 0 })),
    };
  }

  /** Load candidate by Mongo id or business id, scoped to caller org. */
  private async loadCandidateForUser(id: string, currentUser: any): Promise<CandidateDocument> {
    const scope = orgScope(currentUser);
    let doc: CandidateDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.candidateModel.findOne({ _id: id, ...scope }).exec();
    }
    if (!doc) {
      doc = await this.candidateModel.findOne({ candidateId: id, ...scope }).exec();
    }
    if (!doc) {
      throw new NotFoundException(`Candidate '${id}' not found`);
    }
    assertCanAccessCandidate(doc, currentUser);
    return doc;
  }

  /** GET /api/v1/candidates/:id */
  async findById(id: string, currentUser: any) {
    const doc = await this.loadCandidateForUser(id, currentUser);
    await this.withSourcedRecruiter(doc);
    await this.ensureResumeLinked(doc, currentUser).catch((err) => {
      console.error('Candidate resume link failed:', err);
    });
    return this.sanitizeCandidate(doc);
  }

  /**
   * GET /api/v1/candidates/:id/resume
   * Resolves a stored resume (file id, candidate document, file metadata, or V1 disk)
   * and returns a short-lived download URL.
   */
  async createResumeDownload(id: string, currentUser: any) {
    const doc = await this.loadCandidateForUser(id, currentUser);
    const file = await this.ensureResumeLinked(doc, currentUser);
    if (!file) {
      const named = this.resumeNameHints(doc).length > 0;
      throw new NotFoundException(
        named
          ? 'The resume name is saved on this candidate, but the file is not stored. Upload the resume again to download it.'
          : 'No resume file is stored for this candidate.',
      );
    }
    const signed = await this.filesService.createSignedDownloadUrl(currentUser, String(file._id));
    return {
      ...signed,
      fileId: String(file._id),
      resumeFileName: file.originalName || doc.resumeFileName || null,
    };
  }

  /** Filenames recorded on the candidate, including the V1 resume_url leftover. */
  private resumeNameHints(doc: CandidateDocument | any): string[] {
    const legacy = doc?.legacy && typeof doc.legacy === 'object' ? doc.legacy : {};
    return [doc?.resumeFileName, legacy.resumeUrl, doc?.resumeUrl, doc?.resumeFileUrl]
      .map((value) => (value == null ? '' : String(value).trim()))
      .filter(Boolean);
  }

  private recruiterObjectId(doc: CandidateDocument | any): Types.ObjectId | undefined {
    const raw = doc?.sourcedByRecruiterId;
    const id = raw && typeof raw === 'object' ? raw._id : raw;
    if (id && Types.ObjectId.isValid(String(id))) return new Types.ObjectId(String(id));
    return undefined;
  }

  /**
   * Attach resumeFileId when the file is already stored but the candidate row
   * only has a filename. Returns null when no file bytes exist.
   */
  private async ensureResumeLinked(doc: CandidateDocument, currentUser: any) {
    if (doc.resumeFileId) {
      const linked = await this.filesService.readableById(currentUser, String(doc.resumeFileId));
      if (linked) return linked;
    }

    const documentRow = await this.candidateDocumentModel
      .findOne({
        orgId: doc.orgId,
        candidateId: doc._id,
        documentType: 'Resume',
        deletedAt: null,
      })
      .sort({ isPrimaryResume: -1, createdAt: -1 })
      .exec();
    if (documentRow?.fileMetadataId) {
      const fromDocument = await this.filesService.readableById(
        currentUser,
        String(documentRow.fileMetadataId),
      );
      if (fromDocument) {
        await this.persistResumeLink(doc, fromDocument);
        return fromDocument;
      }
    }

    const found = await this.filesService.locateOrImportResumeByName(
      currentUser,
      this.resumeNameHints(doc),
      this.recruiterObjectId(doc),
    );
    if (!found) return null;
    await this.persistResumeLink(doc, found);
    return found;
  }

  private async persistResumeLink(doc: CandidateDocument, file: { _id: any; originalName?: string }) {
    const fileId = file._id as Types.ObjectId;
    const name = file.originalName ? String(file.originalName) : doc.resumeFileName;
    const changed =
      !doc.resumeFileId ||
      String(doc.resumeFileId) !== String(fileId) ||
      (name && doc.resumeFileName !== name);
    if (!changed) return;
    doc.resumeFileId = fileId;
    if (name) doc.resumeFileName = name;
    await doc.save();
    await this.recordPrimaryResume(doc, fileId);
  }

  /** POST /api/v1/candidates/duplicate-check */
  async duplicateCheck(dto: DuplicateCheckDto, currentUser: any) {
    const orgId = requireOrgId(currentUser);

    if (dto.candidateId) {
      const match = await this.candidateModel.findOne({ orgId, candidateId: dto.candidateId, deletedAt: null }).exec();
      if (match) {
        return { isDuplicate: true, duplicateField: 'candidateId', candidate: this.sanitizeCandidate(match) };
      }
    }

    if (dto.email) {
      const cleanEmail = dto.email.trim().toLowerCase();
      const match = await this.candidateModel.findOne({ orgId, email: cleanEmail, deletedAt: null }).exec();
      if (match) {
        return { isDuplicate: true, duplicateField: 'email', candidate: this.sanitizeCandidate(match) };
      }
    }

    if (dto.phone) {
      const cleanPhone = dto.phone.trim();
      const match = await this.candidateModel.findOne({ orgId, phone: cleanPhone, deletedAt: null }).exec();
      if (match) {
        return { isDuplicate: true, duplicateField: 'phone', candidate: this.sanitizeCandidate(match) };
      }
    }

    if (dto.name) {
      const cleanName = dto.name.trim();
      const nameRegex = new RegExp(`^${cleanName}$`, 'i');
      const match = await this.candidateModel.findOne({
        orgId,
        deletedAt: null,
        $or: [{ name: nameRegex }, { fullName: nameRegex }],
      }).exec();
      if (match) {
        return { isDuplicate: true, duplicateField: 'name', candidate: this.sanitizeCandidate(match) };
      }
    }

    return { isDuplicate: false };
  }

  /** Confirm an uploaded resume belongs to this org before linking it. */
  private async resolveResume(currentUser: any, resumeFileId?: string) {
    const raw = resumeFileId?.trim();
    if (!raw) return null;
    try {
      return await this.filesService.findOne(currentUser, raw);
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new BadRequestException('Uploaded resume was not found. Please upload the resume again.');
      }
      throw err;
    }
  }

  /** Keep a primary Resume row in candidate_documents pointing at the stored file. */
  private async recordPrimaryResume(candidate: CandidateDocument, fileId: Types.ObjectId) {
    await this.candidateDocumentModel.updateMany(
      {
        orgId: candidate.orgId,
        candidateId: candidate._id,
        documentType: 'Resume',
        deletedAt: null,
        fileMetadataId: { $ne: fileId },
      },
      { $set: { isPrimaryResume: false } },
    ).exec();

    await this.candidateDocumentModel.findOneAndUpdate(
      {
        orgId: candidate.orgId,
        candidateId: candidate._id,
        fileMetadataId: fileId,
        deletedAt: null,
      },
      {
        $set: {
          documentType: 'Resume',
          isPrimaryResume: true,
          schemaVersion: 1,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  }

  /** POST /api/v1/candidates */
  async create(dto: CreateCandidateDto, currentUser: any) {
    const orgId = requireOrgId(currentUser);
    const resumeFile = await this.resolveResume(currentUser, dto.resumeFileId);

    const performedBy = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : new Types.ObjectId();

    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanPhone = dto.phone.trim();

    // Check duplicate
    const dupCheck = await this.duplicateCheck({ email: cleanEmail, phone: cleanPhone }, currentUser);
    if (dupCheck.isDuplicate) {
      throw new ConflictException(`Candidate with this ${dupCheck.duplicateField} already exists`);
    }

    const candidateId = await this.generateCandidateId(orgId);

    const skillsList = Array.isArray(dto.skills)
      ? dto.skills
      : (typeof dto.skills === 'string' ? dto.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

    const newCandidate = new this.candidateModel({
      orgId,
      candidateId,
      name: dto.name.trim(),
      fullName: dto.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      linkedInUrl: dto.linkedInUrl || null,
      currentCompany: dto.currentCompany || null,
      qualification: dto.qualification || null,
      totalExperienceYears: dto.totalExperienceYears || 0,
      relevantExperienceYears: dto.relevantExperienceYears || 0,
      currentCtc: dto.currentCtc || 0,
      expectedCtc: dto.expectedCtc || 0,
      noticePeriodDays: dto.noticePeriodDays || 30,
      currentLocation: dto.currentLocation || null,
      preferredLocation: dto.preferredLocation || null,
      offerInHand: dto.offerInHand || 'No',
      interviewAvailability: dto.interviewAvailability || null,
      reasonForChange: dto.reasonForChange || null,
      notes: dto.notes || null,
      skills: skillsList,
      primarySkills: skillsList,
      resumeFileId: resumeFile?._id || null,
      resumeFileName: resumeFile?.originalName || null,
      sourcedByRecruiterId: performedBy,
      status: dto.status || 'New',
    });

    const saved = await newCandidate.save();
    await this.withSourcedRecruiter(saved);

    if (resumeFile) {
      await this.recordPrimaryResume(saved, resumeFile._id as Types.ObjectId).catch((err) => {
        console.error('Candidate resume document link failed:', err);
      });
    }

    if (this.notificationsService) {
      try {
        await this.notificationsService.createNotification({
          orgId,
          userId: performedBy,
          type: 'candidate_placed',
          title: 'Candidate Profile Created',
          message: `Candidate ${saved.name} (${saved.candidateId}) profile was created successfully`,
          entityId: new Types.ObjectId(saved._id.toString()),
          entityType: 'candidate',
        });
      } catch (e) {
        console.error('Candidate notification error:', e);
      }
    }

    return this.sanitizeCandidate(saved, currentUser?.name);
  }

  /** PUT /api/v1/candidates/:id */
  async update(id: string, dto: UpdateCandidateDto, currentUser: any) {
    const doc = await this.loadCandidateForUser(id, currentUser);

    if (dto.name !== undefined) {
      doc.name = dto.name.trim();
      (doc as any).fullName = dto.name.trim();
    }

    if (dto.email !== undefined && dto.email.trim().toLowerCase() !== doc.email) {
      const cleanEmail = dto.email.trim().toLowerCase();
      const existing = await this.candidateModel.findOne({
        orgId: doc.orgId,
        email: cleanEmail,
        _id: { $ne: doc._id },
        deletedAt: null,
      }).exec();
      if (existing) {
        throw new ConflictException(`Another candidate with email '${cleanEmail}' already exists`);
      }
      doc.email = cleanEmail;
    }

    if (dto.phone !== undefined && dto.phone.trim() !== doc.phone) {
      const cleanPhone = dto.phone.trim();
      const existingPhone = await this.candidateModel.findOne({
        orgId: doc.orgId,
        phone: cleanPhone,
        _id: { $ne: doc._id },
        deletedAt: null,
      }).exec();
      if (existingPhone) {
        throw new ConflictException(
          `Another candidate with phone '${cleanPhone}' already exists`,
        );
      }
      doc.phone = cleanPhone;
    }
    if (dto.linkedInUrl !== undefined) doc.linkedInUrl = dto.linkedInUrl;
    if (dto.currentCompany !== undefined) doc.currentCompany = dto.currentCompany;
    if (dto.qualification !== undefined) doc.qualification = dto.qualification;
    if (dto.totalExperienceYears !== undefined) doc.totalExperienceYears = dto.totalExperienceYears;
    if (dto.relevantExperienceYears !== undefined) doc.relevantExperienceYears = dto.relevantExperienceYears;
    if (dto.currentCtc !== undefined) doc.currentCtc = dto.currentCtc;
    if (dto.expectedCtc !== undefined) doc.expectedCtc = dto.expectedCtc;
    if (dto.noticePeriodDays !== undefined) doc.noticePeriodDays = dto.noticePeriodDays;
    if (dto.currentLocation !== undefined) doc.currentLocation = dto.currentLocation;
    if (dto.preferredLocation !== undefined) doc.preferredLocation = dto.preferredLocation;
    if (dto.offerInHand !== undefined) doc.offerInHand = dto.offerInHand;
    if (dto.interviewAvailability !== undefined) doc.interviewAvailability = dto.interviewAvailability;
    if (dto.reasonForChange !== undefined) doc.reasonForChange = dto.reasonForChange;
    if (dto.notes !== undefined) doc.notes = dto.notes;
    if (dto.status !== undefined) doc.status = dto.status;

    if (dto.skills !== undefined) {
      const skillsList = Array.isArray(dto.skills)
        ? dto.skills
        : (typeof dto.skills === 'string' ? dto.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
      doc.skills = skillsList;
      (doc as any).primarySkills = skillsList;
    }

    let linkedResumeId: Types.ObjectId | null = null;
    if (dto.resumeFileId?.trim()) {
      const resumeFile = await this.resolveResume(currentUser, dto.resumeFileId);
      if (resumeFile) {
        doc.resumeFileId = resumeFile._id as Types.ObjectId;
        doc.resumeFileName = resumeFile.originalName;
        linkedResumeId = resumeFile._id as Types.ObjectId;
      }
    }

    const updated = await doc.save();

    if (linkedResumeId) {
      await this.recordPrimaryResume(updated, linkedResumeId).catch((err) => {
        console.error('Candidate resume document link failed:', err);
      });
    }

    const performedBy = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : new Types.ObjectId();

    if (this.notificationsService) {
      try {
        await this.notificationsService.createNotification({
          orgId: new Types.ObjectId(updated.orgId.toString()),
          userId: performedBy,
          type: 'candidate_placed',
          title: 'Candidate Profile Updated',
          message: `Candidate ${updated.name} (${updated.candidateId}) profile was updated`,
          entityId: new Types.ObjectId(updated._id.toString()),
          entityType: 'candidate',
        });
      } catch (e) {}
    }

    await this.withSourcedRecruiter(updated);
    return this.sanitizeCandidate(updated, currentUser?.name);
  }

  /** POST /api/v1/candidates/bulk-upload */
  async bulkUpload(payload: any, currentUser: any) {
    const candidateList = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload?.candidates) ? payload.candidates : []);

    if (!Array.isArray(candidateList) || candidateList.length === 0) {
      throw new BadRequestException('Payload must contain an array of candidates');
    }

    let createdCount = 0;
    let skippedCount = 0;
    const items = [];
    const errors = [];

    for (const item of candidateList) {
      try {
        const created = await this.create(item, currentUser);
        items.push(created);
        createdCount++;
      } catch (e: any) {
        skippedCount++;
        errors.push(`Skipped '${item.name || item.email}': ${e.message}`);
      }
    }

    await this.auditService
      .recordSecurityAlert({
        type: 'bulk_import',
        action: 'Bulk candidate upload',
        currentUser,
        orgId: currentUser?.orgId,
        targetEntity: 'Candidate',
        details: {
          total: candidateList.length,
          createdCount,
          skippedCount,
        },
      })
      .catch(() => {});

    return {
      total: candidateList.length,
      createdCount,
      skippedCount,
      errors,
      items,
    };
  }

  /** DELETE /api/v1/candidates/:id */
  async softDelete(id: string, currentUser: any) {
    const doc = await this.loadCandidateForUser(id, currentUser);
    const targetId = doc._id.toString();
    const deleted = await this.candidateRepository.softDelete(targetId, currentUser);
    return { message: `Candidate '${deleted.candidateId || targetId}' soft-deleted successfully` };
  }
}
