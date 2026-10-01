import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { CandidateRepository } from './repositories/candidate.repository';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { DuplicateCheckDto } from './dto/duplicate-check.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    private readonly candidateRepository: CandidateRepository,
  ) {}

  /** Format document for API output */
  private sanitizeCandidate(doc: any) {
    const obj = doc.toObject ? doc.toObject() : doc;

    const skillsList = Array.isArray(obj.skills) && obj.skills.length > 0
      ? obj.skills
      : (Array.isArray(obj.primarySkills) && obj.primarySkills.length > 0
          ? obj.primarySkills
          : (typeof obj.skills === 'string' ? obj.skills.split(',').map((s: string) => s.trim()) : []));

    const nameVal = obj.name || obj.fullName || 'N/A';

    return {
      ...obj,
      id: obj._id ? obj._id.toString() : obj.id,
      candidateId: obj.candidateId || `CAND-${obj._id ? obj._id.toString().substring(18) : '000'}`,
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
      skills: skillsList,
      primarySkills: skillsList,
      resumeUrl: obj.resumeUrl || obj.resumeFileUrl || null,
      status: obj.status || 'New',
      sourcedByRecruiterId: obj.sourcedByRecruiterId ? obj.sourcedByRecruiterId.toString() : null,
      createdAt: obj.createdAt || new Date(),
      updatedAt: obj.updatedAt || new Date(),
    };
  }

  /** Generate CAND-XXXXX sequence code */
  async generateCandidateId(orgId: Types.ObjectId): Promise<string> {
    const regex = /^CAND-(\d+)$/;
    const latest = await this.candidateModel
      .find({ orgId, candidateId: regex })
      .sort({ candidateId: -1 })
      .limit(1)
      .exec();

    let seq = 1;
    if (latest && latest.length > 0) {
      const parts = latest[0].candidateId.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    } else {
      const count = await this.candidateModel.countDocuments({ orgId }).exec();
      seq = count + 1;
    }

    return `CAND-${String(seq).padStart(5, '0')}`;
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
      page?: number;
      limit?: number;
    },
  ) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const filter: Record<string, any> = { orgId, deletedAt: null };

    if (query?.status) {
      filter.status = query.status;
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
    const limit = query?.limit ? Math.max(1, Math.min(200, Number(query.limit))) : 0;

    let items;
    if (limit > 0) {
      items = await this.candidateModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const total = await this.candidateModel.countDocuments(filter).exec();

      return {
        items: items.map((item) => this.sanitizeCandidate(item)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      items = await this.candidateModel.find(filter).sort({ createdAt: -1 }).limit(1000).exec();
      return items.map((item) => this.sanitizeCandidate(item));
    }
  }

  /** GET /api/v1/candidates/:id */
  async findById(id: string, currentUser: any) {
    let doc: CandidateDocument | null = null;

    if (Types.ObjectId.isValid(id)) {
      doc = await this.candidateModel.findOne({ _id: id, deletedAt: null }).exec();
    }

    if (!doc) {
      doc = await this.candidateModel.findOne({ candidateId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Candidate '${id}' not found`);
    }

    return this.sanitizeCandidate(doc);
  }

  /** POST /api/v1/candidates/duplicate-check */
  async duplicateCheck(dto: DuplicateCheckDto, currentUser: any) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

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

  /** POST /api/v1/candidates */
  async create(dto: CreateCandidateDto, currentUser: any) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

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
      skills: skillsList,
      primarySkills: skillsList,
      sourcedByRecruiterId: performedBy,
      status: dto.status || 'New',
    });

    const saved = await newCandidate.save();
    return this.sanitizeCandidate(saved);
  }

  /** PUT /api/v1/candidates/:id */
  async update(id: string, dto: UpdateCandidateDto, currentUser: any) {
    let doc: CandidateDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.candidateModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.candidateModel.findOne({ candidateId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Candidate '${id}' not found`);
    }

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

    if (dto.phone !== undefined) doc.phone = dto.phone.trim();
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
    if (dto.status !== undefined) doc.status = dto.status;

    if (dto.skills !== undefined) {
      const skillsList = Array.isArray(dto.skills)
        ? dto.skills
        : (typeof dto.skills === 'string' ? dto.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
      doc.skills = skillsList;
      (doc as any).primarySkills = skillsList;
    }

    const updated = await doc.save();
    return this.sanitizeCandidate(updated);
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
    let targetId: string = id;
    if (!Types.ObjectId.isValid(id)) {
      const doc = await this.candidateModel.findOne({ candidateId: id, deletedAt: null }).exec();
      if (!doc) throw new NotFoundException(`Candidate '${id}' not found`);
      targetId = doc._id.toString();
    }

    const deleted = await this.candidateRepository.softDelete(targetId, currentUser);
    return { message: `Candidate '${deleted.candidateId || targetId}' soft-deleted successfully` };
  }
}
