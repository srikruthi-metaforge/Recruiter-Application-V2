import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import {
  SubmissionHistory,
  SubmissionHistoryDocument,
} from './schemas/submission-history.schema';
import { SubmissionRepository } from './repositories/submission.repository';
import { Requirement, RequirementDocument } from '../requirements/schemas/requirement.schema';
import { Candidate, CandidateDocument } from '../candidates/schemas/candidate.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { LeadApprovalDto } from './dto/lead-approval.dto';
import { ForwardClientDto } from './dto/forward-client.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel(SubmissionHistory.name)
    private readonly historyModel: Model<SubmissionHistoryDocument>,
    @InjectModel(Requirement.name)
    private readonly requirementModel: Model<RequirementDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly submissionRepository: SubmissionRepository,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  /** Format document for API output */
  private sanitizeSubmission(doc: any) {
    const obj = doc.toObject ? doc.toObject() : doc;

    const candidateObj = obj.candidateId && typeof obj.candidateId === 'object' ? obj.candidateId : null;
    const reqObj = obj.requirementId && typeof obj.requirementId === 'object' ? obj.requirementId : null;
    const clientObj = obj.clientId && typeof obj.clientId === 'object' ? obj.clientId : null;
    const recruiterObj = obj.recruiterId && typeof obj.recruiterId === 'object' ? obj.recruiterId : null;
    const leadObj = obj.leadId && typeof obj.leadId === 'object' ? obj.leadId : null;

    return {
      ...obj,
      id: obj._id ? obj._id.toString() : obj.id,
      candidateId: candidateObj ? candidateObj._id.toString() : (obj.candidateId?.toString() || obj.candidateId),
      requirementId: reqObj ? reqObj._id.toString() : (obj.requirementId?.toString() || obj.requirementId),
      clientId: clientObj ? clientObj._id.toString() : (obj.clientId?.toString() || obj.clientId),
      recruiterId: recruiterObj ? recruiterObj._id.toString() : (obj.recruiterId?.toString() || obj.recruiterId),
      leadId: leadObj ? leadObj._id.toString() : (obj.leadId?.toString() || null),
      // Computed helper fields expected by frontend UI
      candidateName: candidateObj?.name || 'N/A',
      requirementTitle: reqObj?.title || 'N/A',
      clientName: clientObj?.clientName || reqObj?.clientName || 'N/A',
      recruiterName: recruiterObj?.name || 'N/A',
      leadName: leadObj?.name || 'N/A',
      candidate: candidateObj?.name || candidateObj?._id?.toString() || obj.candidateId?.toString() || 'N/A',
      req: reqObj?.title || reqObj?.reqCode || reqObj?._id?.toString() || obj.requirementId?.toString() || 'N/A',
      client: clientObj?.clientName || reqObj?.clientName || obj.clientId?.toString() || 'N/A',
      recruiter: recruiterObj?.name || recruiterObj?._id?.toString() || obj.recruiterId?.toString() || 'N/A',
      date: obj.submittedAt ? new Date(obj.submittedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      match: obj.matchScore ? `${Math.round(obj.matchScore <= 1 ? obj.matchScore * 100 : obj.matchScore)}%` : '85%',
    };
  }

  /** Generate SUB-XXX sequence code */
  async generateSubmissionId(orgId: Types.ObjectId): Promise<string> {
    const regex = /^SUB-(\d+)$/;
    const latest = await this.submissionModel
      .find({ orgId, submissionId: regex })
      .sort({ submissionId: -1 })
      .limit(1)
      .exec();

    let seq = 1;
    if (latest && latest.length > 0) {
      const parts = latest[0].submissionId.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    } else {
      const count = await this.submissionModel.countDocuments({ orgId }).exec();
      seq = count + 1;
    }

    return `SUB-${String(seq).padStart(3, '0')}`;
  }

  /** Write history log record */
  private async logHistory(
    orgId: Types.ObjectId,
    submissionId: Types.ObjectId,
    previousStage: string,
    newStage: string,
    performedBy: Types.ObjectId,
    notes: string = '',
  ) {
    try {
      const history = new this.historyModel({
        orgId,
        submissionId,
        previousStage,
        newStage,
        performedBy,
        notes,
      });
      await history.save();
    } catch (e) {
      // Ignore non-fatal audit log failures
    }
  }

  /** GET /api/v1/submissions */
  async findAll(
    currentUser: any,
    query?: {
      stage?: string;
      recruiterId?: string;
      leadId?: string;
      clientId?: string;
      requirementId?: string;
      candidateId?: string;
      search?: string;
    },
  ) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
    const role = (currentUser?.role || 'recruiter').toLowerCase();
    const userObjectId = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : null;

    const filter: Record<string, any> = { orgId, deletedAt: null };

    // Role-based access control: Recruiters see assigned/submitted records. Leads, managers, admins & superadmins see org submissions.
    if (role === 'recruiter' && userObjectId) {
      filter.$or = [{ recruiterId: userObjectId }, { leadId: userObjectId }];
    }

    if (query?.stage) {
      filter.stage = query.stage;
    }

    if (query?.recruiterId && Types.ObjectId.isValid(query.recruiterId)) {
      filter.recruiterId = new Types.ObjectId(query.recruiterId);
    }

    if (query?.leadId && Types.ObjectId.isValid(query.leadId)) {
      filter.leadId = new Types.ObjectId(query.leadId);
    }

    if (query?.clientId && Types.ObjectId.isValid(query.clientId)) {
      filter.clientId = new Types.ObjectId(query.clientId);
    }

    if (query?.requirementId && Types.ObjectId.isValid(query.requirementId)) {
      filter.requirementId = new Types.ObjectId(query.requirementId);
    }

    if (query?.candidateId && Types.ObjectId.isValid(query.candidateId)) {
      filter.candidateId = new Types.ObjectId(query.candidateId);
    }

    if (query?.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.submissionId = regex;
    }

    const items = await this.submissionModel
      .find(filter)
      .populate('candidateId', 'name email phone skills totalExperienceYears')
      .populate('requirementId', 'title reqCode clientName status')
      .populate('clientId', 'clientName domain')
      .populate('recruiterId', 'name email')
      .populate('leadId', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    return items.map((item) => this.sanitizeSubmission(item));
  }

  /** GET /api/v1/submissions/:id */
  async findById(id: string, currentUser: any) {
    let doc: SubmissionDocument | null = null;

    if (Types.ObjectId.isValid(id)) {
      doc = await this.submissionModel
        .findOne({ _id: id, deletedAt: null })
        .populate('candidateId', 'name email phone skills totalExperienceYears')
        .populate('requirementId', 'title reqCode clientName status')
        .populate('clientId', 'clientName domain')
        .populate('recruiterId', 'name email')
        .populate('leadId', 'name email')
        .exec();
    }

    if (!doc) {
      doc = await this.submissionModel
        .findOne({ submissionId: id, deletedAt: null })
        .populate('candidateId', 'name email phone skills totalExperienceYears')
        .populate('requirementId', 'title reqCode clientName status')
        .populate('clientId', 'clientName domain')
        .populate('recruiterId', 'name email')
        .populate('leadId', 'name email')
        .exec();
    }

    if (!doc) {
      throw new NotFoundException(`Submission '${id}' not found`);
    }

    const sanitized = this.sanitizeSubmission(doc);

    // Fetch history records
    const historyLogs = await this.historyModel
      .find({ submissionId: doc._id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    return {
      ...sanitized,
      history: historyLogs,
    };
  }

  /** POST /api/v1/submissions */
  async create(dto: CreateSubmissionDto, currentUser: any) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
    const performedBy = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : new Types.ObjectId();

    let candidateId = dto.candidateId;
    let requirementId = dto.requirementId;

    if ((!candidateId || !Types.ObjectId.isValid(candidateId)) && (dto.email || dto.candidate)) {
      const candFilter: Record<string, any> = { orgId, deletedAt: null };
      if (dto.email) candFilter.email = dto.email.trim().toLowerCase();
      else candFilter.name = dto.candidate;
      let cand = await this.candidateModel.findOne(candFilter).exec();
      if (!cand && dto.email && dto.candidate) {
        cand = await this.candidateModel.create({
          orgId,
          candidateId: `CAND-${Date.now()}`,
          name: dto.candidate,
          email: dto.email.trim().toLowerCase(),
          phone: dto.phone || `pending-${Date.now()}`,
          sourcedByRecruiterId: performedBy,
          status: 'Submitted',
          schemaVersion: 1,
        });
      }
      if (cand) candidateId = cand._id.toString();
    }

    if ((!requirementId || !Types.ObjectId.isValid(requirementId)) && dto.req) {
      const reqDoc = await this.requirementModel.findOne({ orgId, reqCode: dto.req, deletedAt: null }).exec();
      if (reqDoc) requirementId = reqDoc._id.toString();
    }

    if (!candidateId || !Types.ObjectId.isValid(candidateId)) {
      throw new BadRequestException('Invalid candidateId ObjectId');
    }
    if (!requirementId || !Types.ObjectId.isValid(requirementId)) {
      throw new BadRequestException('Invalid requirementId ObjectId');
    }

    const candidateObjectId = new Types.ObjectId(candidateId);
    const requirementObjectId = new Types.ObjectId(requirementId);

    // Check existing active submission for candidate + requirement
    const existing = await this.submissionModel
      .findOne({
        orgId,
        candidateId: candidateObjectId,
        requirementId: requirementObjectId,
        deletedAt: null,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        `Candidate is already submitted to this requirement (Submission ${existing.submissionId})`,
      );
    }

    // Lookup Requirement to resolve clientId & leadId if not provided
    const reqDoc = await this.requirementModel.findById(requirementObjectId).exec();
    const clientId = dto.clientId && Types.ObjectId.isValid(dto.clientId)
      ? new Types.ObjectId(dto.clientId)
      : (reqDoc?.clientId ? new Types.ObjectId(reqDoc.clientId.toString()) : new Types.ObjectId());

    const leadId = dto.leadId && Types.ObjectId.isValid(dto.leadId)
      ? new Types.ObjectId(dto.leadId)
      : (reqDoc?.assignedLeadId ? new Types.ObjectId(reqDoc.assignedLeadId.toString()) : null);

    let recruiterId = dto.recruiterId && Types.ObjectId.isValid(dto.recruiterId)
      ? new Types.ObjectId(dto.recruiterId)
      : performedBy;
    if ((!dto.recruiterId || !Types.ObjectId.isValid(dto.recruiterId)) && dto.recruiter) {
      const rec = await this.userModel.findOne({ orgId, name: dto.recruiter, deletedAt: null }).exec();
      if (rec) recruiterId = rec._id as Types.ObjectId;
    }

    let matchScore = dto.matchScore;
    if (matchScore == null && dto.match) {
      const parsed = parseFloat(String(dto.match).replace('%', ''));
      if (!Number.isNaN(parsed)) matchScore = parsed;
    }

    const submissionId = await this.generateSubmissionId(orgId);
    const initialStage = dto.stage || 'Submitted';
    const initialApproval = initialStage === 'Submitted to Lead' ? 'Pending' : 'Pending';

    const newSubmission = new this.submissionModel({
      orgId,
      submissionId,
      candidateId: candidateObjectId,
      requirementId: requirementObjectId,
      clientId,
      recruiterId,
      leadId,
      stage: initialStage,
      leadApprovalStatus: initialApproval,
      matchScore: matchScore ?? 85.0,
      submittedAt: new Date(),
    });

    const saved = await newSubmission.save();

    await this.logHistory(
      orgId,
      new Types.ObjectId(saved._id.toString()),
      'None',
      saved.stage,
      performedBy,
      'Submission created',
    );

    // Trigger notification if leadId exists
    if (this.notificationsService && leadId) {
      try {
        await this.notificationsService.createNotification({
          orgId,
          userId: leadId,
          type: 'lead_approval_requested',
          title: 'Lead Approval Requested',
          message: `Candidate submission ${saved.submissionId} requires your review`,
          entityId: new Types.ObjectId(saved._id.toString()),
          entityType: 'submission',
        });
      } catch (e) {
        // Non-fatal
      }
    }

    return this.findById(saved._id.toString(), currentUser);
  }

  /** PUT /api/v1/submissions/:id/stage */
  async updateStage(id: string, dto: UpdateStageDto, currentUser: any) {
    let doc: SubmissionDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.submissionModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.submissionModel.findOne({ submissionId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Submission '${id}' not found`);
    }

    const previousStage = doc.stage;
    const performedBy = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : new Types.ObjectId();

    doc.stage = dto.stage;

    if (dto.stage === 'Submitted to Lead') {
      doc.leadApprovalStatus = 'Pending';
      if (this.notificationsService && doc.leadId) {
        try {
          await this.notificationsService.createNotification({
            orgId: new Types.ObjectId(doc.orgId.toString()),
            userId: new Types.ObjectId(doc.leadId.toString()),
            type: 'lead_approval_requested',
            title: 'Lead Approval Requested',
            message: `Candidate submission ${doc.submissionId} requires your review`,
            entityId: new Types.ObjectId(doc._id.toString()),
            entityType: 'submission',
          });
        } catch (e) {}
      }
    } else if (dto.stage === 'Submitted to Client') {
      doc.leadApprovalStatus = 'Approved';
      doc.leadApprovedAt = doc.leadApprovedAt || new Date();
      doc.clientForwardedAt = new Date();
    } else if (dto.stage === 'Approved') {
      doc.leadApprovalStatus = 'Approved';
      doc.leadApprovedAt = new Date();
    }

    const updated = await doc.save();

    await this.logHistory(
      new Types.ObjectId(doc.orgId.toString()),
      new Types.ObjectId(doc._id.toString()),
      previousStage,
      updated.stage,
      performedBy,
      dto.notes || `Stage updated to ${updated.stage}`,
    );

    return this.findById(updated._id.toString(), currentUser);
  }

  /** POST /api/v1/submissions/:id/lead-approval */
  async leadApproval(id: string, dto: LeadApprovalDto, currentUser: any) {
    let doc: SubmissionDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.submissionModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.submissionModel.findOne({ submissionId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Submission '${id}' not found`);
    }

    const previousStage = doc.stage;
    const performedBy = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : new Types.ObjectId();

    const approvalStatus = dto.status
      ? dto.status
      : dto.approved === true
      ? 'Approved'
      : dto.approved === false
      ? 'Rejected'
      : 'Approved';

    doc.leadApprovalStatus = approvalStatus;

    if (approvalStatus === 'Approved' || approvalStatus === 'Forwarded') {
      doc.leadApprovedAt = new Date();
      if (doc.stage === 'Submitted' || doc.stage === 'Submitted to Lead') {
        doc.stage = 'Submitted to Client';
        doc.clientForwardedAt = new Date();
      }
    } else if (approvalStatus === 'Rejected') {
      doc.stage = 'Rejected';
      doc.rejectionReason = dto.reason || dto.notes || 'Rejected by Team Lead';
    }

    const updated = await doc.save();

    await this.logHistory(
      new Types.ObjectId(doc.orgId.toString()),
      new Types.ObjectId(doc._id.toString()),
      previousStage,
      updated.stage,
      performedBy,
      dto.notes || `Lead approval set to ${approvalStatus}`,
    );

    // Notify recruiter
    if (this.notificationsService && doc.recruiterId) {
      try {
        await this.notificationsService.createNotification({
          orgId: new Types.ObjectId(doc.orgId.toString()),
          userId: new Types.ObjectId(doc.recruiterId.toString()),
          type: approvalStatus === 'Approved' ? 'submission_approved' : 'submission_rejected',
          title: `Submission ${approvalStatus}`,
          message: `Submission ${doc.submissionId} was ${approvalStatus.toLowerCase()} by Team Lead`,
          entityId: new Types.ObjectId(doc._id.toString()),
          entityType: 'submission',
        });
      } catch (e) {}
    }

    return this.findById(updated._id.toString(), currentUser);
  }

  /** POST /api/v1/submissions/:id/forward-client */
  async forwardClient(id: string, dto: ForwardClientDto, currentUser: any) {
    let doc: SubmissionDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.submissionModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.submissionModel.findOne({ submissionId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Submission '${id}' not found`);
    }

    const previousStage = doc.stage;
    const performedBy = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : new Types.ObjectId();

    doc.stage = 'Submitted to Client';
    doc.leadApprovalStatus = 'Forwarded';
    doc.clientForwardedAt = new Date();

    const updated = await doc.save();

    await this.logHistory(
      new Types.ObjectId(doc.orgId.toString()),
      new Types.ObjectId(doc._id.toString()),
      previousStage,
      updated.stage,
      performedBy,
      dto.notes || 'Forwarded to Client',
    );

    return this.findById(updated._id.toString(), currentUser);
  }

  /** DELETE /api/v1/submissions/:id */
  async softDelete(id: string, currentUser: any) {
    let targetId: string = id;
    if (!Types.ObjectId.isValid(id)) {
      const doc = await this.submissionModel.findOne({ submissionId: id, deletedAt: null }).exec();
      if (!doc) throw new NotFoundException(`Submission '${id}' not found`);
      targetId = doc._id.toString();
    }

    const deleted = await this.submissionRepository.softDelete(targetId, currentUser);
    const performedBy = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : new Types.ObjectId();

    await this.logHistory(
      new Types.ObjectId(deleted.orgId.toString()),
      new Types.ObjectId(deleted._id.toString()),
      deleted.stage,
      'Deleted',
      performedBy,
      'Submission soft deleted',
    );

    return { message: `Submission '${deleted.submissionId}' soft-deleted successfully` };
  }
}