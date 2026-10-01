import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Requirement, RequirementDocument } from './schemas/requirement.schema';
import { RequirementHistory, RequirementHistoryDocument } from './schemas/requirement-history.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { RequirementRepository } from './repositories/requirement.repository';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { AssignRequirementDto } from './dto/assign-requirement.dto';
import { RevokeRequirementDto } from './dto/revoke-requirement.dto';

@Injectable()
export class RequirementsService {
  constructor(
    @InjectModel(Requirement.name)
    private readonly requirementModel: Model<RequirementDocument>,
    @InjectModel(RequirementHistory.name)
    private readonly historyModel: Model<RequirementHistoryDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    private readonly requirementRepository: RequirementRepository,
  ) {}

  /** Format document for API output */
  private sanitizeRequirement(doc: RequirementDocument) {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      ...obj,
      id: doc._id.toString(),
    };
  }

  /** Generate REQ-YYYY-MM-DD-XXX sequence code */
  async generateReqCode(orgId: Types.ObjectId): Promise<string> {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const prefix = `REQ-${yyyy}-${mm}-${dd}-`;

    const regex = new RegExp(`^${prefix}`);
    const latest = await this.requirementModel
      .find({ orgId, reqCode: regex })
      .sort({ reqCode: -1 })
      .limit(1)
      .exec();

    let seq = 1;
    if (latest && latest.length > 0) {
      const parts = latest[0].reqCode.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  /** Write history log record */
  private async logHistory(
    orgId: Types.ObjectId,
    requirementId: Types.ObjectId,
    action: string,
    performedBy: Types.ObjectId,
    previousValue: Record<string, any> = {},
    newValue: Record<string, any> = {},
    reason: string = '',
  ) {
    try {
      const history = new this.historyModel({
        orgId,
        requirementId,
        action,
        performedBy,
        previousValue,
        newValue,
        reason,
      });
      await history.save();
    } catch (e) {
      // Ignore non-fatal audit log failures
    }
  }

  /** GET /api/v1/requirements */
  async findAll(currentUser: any, query?: { status?: string; priority?: string; clientId?: string; search?: string }) {
    const orgId = currentUser.orgId ? new Types.ObjectId(currentUser.orgId) : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
    const role = (currentUser.role || 'recruiter').toLowerCase();
    const userObjectId = currentUser.id || currentUser.userId ? new Types.ObjectId(currentUser.id || currentUser.userId) : null;

    const filter: Record<string, any> = { orgId, deletedAt: null };

    // Role-based scoping
    if (role === 'recruiter' && userObjectId) {
      filter.$or = [
        { assignedRecruiterIds: userObjectId },
        { assignedLeadId: userObjectId },
      ];
    } else if (role === 'client' && currentUser.clientId) {
      filter.clientId = new Types.ObjectId(currentUser.clientId);
    }

    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.priority) {
      filter.priority = query.priority;
    }

    if (query?.clientId && Types.ObjectId.isValid(query.clientId)) {
      filter.clientId = new Types.ObjectId(query.clientId);
    }

    if (query?.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { reqCode: regex },
        { clientName: regex },
        { skillsRequired: regex },
      ];
    }

    const items = await this.requirementModel.find(filter).sort({ createdAt: -1 }).exec();
    return items.map(item => this.sanitizeRequirement(item));
  }

  /** GET /api/v1/requirements/:id */
  async findById(id: string, currentUser: any) {
    let doc: RequirementDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.requirementModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.requirementModel.findOne({ reqCode: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Requirement '${id}' not found`);
    }

    return this.sanitizeRequirement(doc);
  }

  /** POST /api/v1/requirements */
  async create(dto: CreateRequirementDto, currentUser: any) {
    const orgId = currentUser.orgId ? new Types.ObjectId(currentUser.orgId) : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
    const performedBy = currentUser.id || currentUser.userId ? new Types.ObjectId(currentUser.id || currentUser.userId) : new Types.ObjectId();

    const reqCode = await this.generateReqCode(orgId);
    const clientName = (dto.clientName || dto.client || '').trim();
    let clientId: Types.ObjectId | null = dto.clientId && Types.ObjectId.isValid(dto.clientId)
      ? new Types.ObjectId(dto.clientId)
      : null;
    if (!clientId && clientName) {
      const found = await this.clientModel.findOne({ orgId, clientName, deletedAt: null }).exec();
      if (found) clientId = found._id as Types.ObjectId;
    }
    if (!clientId) {
      throw new BadRequestException('A valid clientId or client name is required');
    }
    const resolvedClient = await this.clientModel.findById(clientId).exec();
    const resolvedName = resolvedClient?.clientName || clientName || 'Client';

    const assignedLeadId = dto.assignedLeadId && Types.ObjectId.isValid(dto.assignedLeadId)
      ? new Types.ObjectId(dto.assignedLeadId)
      : null;

    const assignedRecruiterIds = (dto.assignedRecruiterIds || [])
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));

    const newReq = new this.requirementModel({
      orgId,
      reqCode,
      title: dto.title.trim(),
      clientId,
      clientName: resolvedName,
      priority: dto.priority || 'Medium',
      status: dto.status || 'Open',
      assignmentStatus: assignedRecruiterIds.length > 0 ? 'Assigned' : 'Unassigned',
      openings: dto.openings || 1,
      budgetRange: dto.budgetRange || { min: 0, max: 0, currency: 'INR' },
      assignedLeadId,
      assignedRecruiterIds,
      skillsRequired: dto.skillsRequired || dto.skills || [],
      experienceRange: dto.experienceRange || { min: 0, max: 0 },
      location: dto.location || 'Hybrid',
      emailArrivedTime: new Date(),
    });

    const saved = await newReq.save();

    await this.logHistory(
      orgId,
      saved._id as Types.ObjectId,
      'CREATE',
      performedBy,
      {},
      saved.toObject(),
      'Requirement created',
    );

    return this.sanitizeRequirement(saved);
  }

  /** PUT /api/v1/requirements/:id */
  async update(id: string, dto: UpdateRequirementDto, currentUser: any) {
    let doc: RequirementDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.requirementModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.requirementModel.findOne({ reqCode: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Requirement '${id}' not found`);
    }

    const previousValue = doc.toObject();
    const performedBy = currentUser.id || currentUser.userId ? new Types.ObjectId(currentUser.id || currentUser.userId) : new Types.ObjectId();

    if (dto.title !== undefined) doc.title = dto.title.trim();
    if (dto.clientName !== undefined) doc.clientName = dto.clientName.trim();
    if (dto.clientId !== undefined && Types.ObjectId.isValid(dto.clientId)) {
      doc.clientId = new Types.ObjectId(dto.clientId);
    }
    if (dto.priority !== undefined) doc.priority = dto.priority;
    if (dto.status !== undefined) doc.status = dto.status;
    if (dto.assignmentStatus !== undefined) doc.assignmentStatus = dto.assignmentStatus;
    if (dto.openings !== undefined) doc.openings = dto.openings;
    if (dto.placedCount !== undefined) doc.placedCount = dto.placedCount;
    if (dto.budgetRange !== undefined) doc.budgetRange = dto.budgetRange;
    if (dto.skillsRequired !== undefined) doc.skillsRequired = dto.skillsRequired;
    if (dto.experienceRange !== undefined) doc.experienceRange = dto.experienceRange;
    if (dto.location !== undefined) doc.location = dto.location;

    if (dto.assignedLeadId !== undefined) {
      doc.assignedLeadId = dto.assignedLeadId && Types.ObjectId.isValid(dto.assignedLeadId)
        ? new Types.ObjectId(dto.assignedLeadId)
        : null;
    }

    if (dto.assignedRecruiterIds !== undefined) {
      doc.assignedRecruiterIds = (dto.assignedRecruiterIds || [])
        .filter(recId => Types.ObjectId.isValid(recId))
        .map(recId => new Types.ObjectId(recId));
      doc.assignmentStatus = doc.assignedRecruiterIds.length > 0 ? 'Assigned' : 'Unassigned';
    }

    const updated = await doc.save();

    await this.logHistory(
      doc.orgId,
      doc._id as Types.ObjectId,
      'UPDATE',
      performedBy,
      previousValue,
      updated.toObject(),
      'Requirement updated',
    );

    return this.sanitizeRequirement(updated);
  }

  /** PUT /api/v1/requirements/bulk */
  async bulkUpdate(items: any[], currentUser: any) {
    if (!Array.isArray(items)) {
      throw new BadRequestException('Payload must be an array of requirements');
    }

    const updatedItems = [];
    for (const item of items) {
      const id = item.id || item._id || item.reqCode;
      if (id) {
        try {
          const mapped: any = {
            ...item,
            clientName: item.clientName || item.client,
            skillsRequired: item.skillsRequired || item.skills,
            status: item.status === 'Active' ? 'In Progress' : item.status,
            placedCount: item.placedCount ?? item.placed,
          };
          const updated = await this.update(id, mapped, currentUser);
          updatedItems.push(updated);
        } catch {
          // ignore single item bulk failure
        }
      }
    }
    return updatedItems;
  }

  /** POST /api/v1/requirements/:id/assign */
  async assign(id: string, dto: AssignRequirementDto, currentUser: any) {
    let doc: RequirementDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.requirementModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.requirementModel.findOne({ reqCode: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Requirement '${id}' not found`);
    }

    const previousValue = doc.toObject();
    const performedBy = currentUser.id || currentUser.userId ? new Types.ObjectId(currentUser.id || currentUser.userId) : new Types.ObjectId();

    if (dto.leadId !== undefined) {
      doc.assignedLeadId = dto.leadId && Types.ObjectId.isValid(dto.leadId) ? new Types.ObjectId(dto.leadId) : null;
    }

    if (dto.recruiterIds !== undefined) {
      doc.assignedRecruiterIds = (dto.recruiterIds || [])
        .filter(recId => Types.ObjectId.isValid(recId))
        .map(recId => new Types.ObjectId(recId));
    }

    doc.assignmentStatus = doc.assignedRecruiterIds.length > 0 || doc.assignedLeadId ? 'Assigned' : 'Unassigned';
    if (doc.status === 'Open' && doc.assignmentStatus === 'Assigned') {
      doc.status = 'In Progress';
    }

    const updated = await doc.save();

    await this.logHistory(
      doc.orgId,
      doc._id as Types.ObjectId,
      'ASSIGN',
      performedBy,
      previousValue,
      updated.toObject(),
      'Recruiters/Lead assigned to requirement',
    );

    return this.sanitizeRequirement(updated);
  }

  /** POST /api/v1/requirements/:id/revoke */
  async revoke(id: string, dto: RevokeRequirementDto, currentUser: any) {
    let doc: RequirementDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.requirementModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.requirementModel.findOne({ reqCode: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Requirement '${id}' not found`);
    }

    const previousValue = doc.toObject();
    const performedBy = currentUser.id || currentUser.userId ? new Types.ObjectId(currentUser.id || currentUser.userId) : new Types.ObjectId();

    doc.revokeRequested = true;
    doc.revokeReason = dto.reason;
    doc.status = 'On Hold';

    const updated = await doc.save();

    await this.logHistory(
      doc.orgId,
      doc._id as Types.ObjectId,
      'REVOKE',
      performedBy,
      previousValue,
      updated.toObject(),
      `Revoke requested: ${dto.reason}`,
    );

    return this.sanitizeRequirement(updated);
  }

  /** DELETE /api/v1/requirements/:id */
  async softDelete(id: string, currentUser: any) {
    let targetId: string = id;
    if (!Types.ObjectId.isValid(id)) {
      const doc = await this.requirementModel.findOne({ reqCode: id, deletedAt: null }).exec();
      if (!doc) throw new NotFoundException(`Requirement '${id}' not found`);
      targetId = doc._id.toString();
    }

    const deleted = await this.requirementRepository.softDelete(targetId, currentUser);
    const performedBy = currentUser.id || currentUser.userId ? new Types.ObjectId(currentUser.id || currentUser.userId) : new Types.ObjectId();

    await this.logHistory(
      deleted.orgId,
      deleted._id as Types.ObjectId,
      'DELETE',
      performedBy,
      deleted.toObject(),
      {},
      'Requirement soft deleted',
    );

    return { message: `Requirement '${deleted.reqCode}' soft-deleted successfully` };
  }

  /** GET /api/v1/workspace */
  async getWorkspacePayload(currentUser: any) {
    const requirements = await this.findAll(currentUser);

    const mappedRequirements = requirements.map((r: any) => ({
      id: r.reqCode || r.id,
      title: r.title,
      client: r.clientName || r.client || '',
      priority: r.priority || 'Medium',
      status: r.status === 'In Progress' || r.status === 'Assigned' ? 'Active' : r.status,
      submissions: r.submissionsCount || 0,
      interviews: r.interviewsCount || 0,
      placed: r.placedCount || 0,
      dueDate: r.dueDate || '',
      openings: r.openings || 1,
      budget: r.budgetRange ? `${r.budgetRange.currency || 'INR'} ${r.budgetRange.min}-${r.budgetRange.max}` : undefined,
      skills: r.skillsRequired || r.skills || [],
      location: r.location,
      assignmentStatus: r.assignmentStatus,
      revokeRequested: r.revokeRequested,
      revokeReason: r.revokeReason,
      emailArrivedTime: r.emailArrivedTime,
    }));

    const totalOpenings = mappedRequirements.reduce((acc, curr) => acc + (curr.openings || 1), 0);
    const totalPlaced = mappedRequirements.reduce((acc, curr) => acc + (curr.placed || 0), 0);
    const activeReqs = mappedRequirements.filter((r) => r.status === 'Open' || r.status === 'Active').length;

    return {
      user: {
        id: currentUser.id || currentUser.userId,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        orgId: currentUser.orgId,
      },
      requirements: mappedRequirements,
      submissions: [],
      interviews: [],
      recruiters: [],
      activityLogs: [],
      stats: {
        totalRequirements: mappedRequirements.length,
        activeRequirements: activeReqs,
        totalOpenings,
        totalPlaced,
      },
    };
  }
}
