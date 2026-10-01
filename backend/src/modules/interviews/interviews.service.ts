import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interview, InterviewDocument } from './schemas/interview.schema';
import {
  InterviewFeedback,
  InterviewFeedbackDocument,
} from './schemas/interview-feedback.schema';
import { InterviewRepository } from './repositories/interview.repository';
import { Submission, SubmissionDocument } from '../submissions/schemas/submission.schema';
import { Candidate, CandidateDocument } from '../candidates/schemas/candidate.schema';
import { Requirement, RequirementDocument } from '../requirements/schemas/requirement.schema';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { RescheduleInterviewDto } from './dto/reschedule-interview.dto';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { CancelInterviewDto } from './dto/cancel-interview.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(InterviewFeedback.name)
    private readonly feedbackModel: Model<InterviewFeedbackDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Requirement.name)
    private readonly requirementModel: Model<RequirementDocument>,
    private readonly interviewRepository: InterviewRepository,
    @Optional()
    private readonly notificationsService?: NotificationsService,
  ) {}

  /** Format document for API output */
  private sanitizeInterview(doc: any) {
    const obj = doc.toObject ? doc.toObject() : doc;

    const candidateObj = obj.candidateId && typeof obj.candidateId === 'object' ? obj.candidateId : null;
    const reqObj = obj.requirementId && typeof obj.requirementId === 'object' ? obj.requirementId : null;
    const subObj = obj.submissionId && typeof obj.submissionId === 'object' ? obj.submissionId : null;

    const candidateName = candidateObj?.name || candidateObj?.fullName || 'N/A';
    const requirementTitle = reqObj?.title || reqObj?.reqCode || 'N/A';
    const clientName = reqObj?.clientName || 'N/A';

    return {
      ...obj,
      id: obj._id ? obj._id.toString() : obj.id,
      interviewId: obj.interviewId || `int-${obj._id ? obj._id.toString().substring(18) : '000'}`,
      submissionId: subObj ? subObj._id.toString() : (obj.submissionId?.toString() || obj.submissionId),
      candidateId: candidateObj ? candidateObj._id.toString() : (obj.candidateId?.toString() || obj.candidateId),
      requirementId: reqObj ? reqObj._id.toString() : (obj.requirementId?.toString() || obj.requirementId),

      // UI Helper properties
      candidate: candidateName,
      position: requirementTitle,
      client: clientName,
      stage: obj.round || 'L1 Technical',
      round: obj.round || 'L1 Technical',
      date: obj.dateTime ? new Date(obj.dateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      recruiter: obj.interviewerName || 'Technical Interviewer',
      candidateName,
      requirementTitle,
      clientName,
      status: obj.status || 'Scheduled',
    };
  }

  /** Generate int-XXX sequence code */
  async generateInterviewId(orgId: Types.ObjectId): Promise<string> {
    const regex = /^int-(\d+)$/i;
    const latest = await this.interviewModel
      .find({ orgId, interviewId: regex })
      .sort({ interviewId: -1 })
      .limit(1)
      .exec();

    let seq = 1;
    if (latest && latest.length > 0) {
      const parts = latest[0].interviewId.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    } else {
      const count = await this.interviewModel.countDocuments({ orgId }).exec();
      seq = count + 1;
    }

    return `int-${String(seq).padStart(3, '0')}`;
  }

  /** GET /api/v1/interviews */
  async findAll(
    currentUser: any,
    query?: {
      candidateId?: string;
      submissionId?: string;
      requirementId?: string;
      status?: string;
      round?: string;
      search?: string;
    },
  ) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    const filter: Record<string, any> = { orgId, deletedAt: null };

    if (query?.candidateId && Types.ObjectId.isValid(query.candidateId)) {
      filter.candidateId = new Types.ObjectId(query.candidateId);
    }

    if (query?.submissionId && Types.ObjectId.isValid(query.submissionId)) {
      filter.submissionId = new Types.ObjectId(query.submissionId);
    }

    if (query?.requirementId && Types.ObjectId.isValid(query.requirementId)) {
      filter.requirementId = new Types.ObjectId(query.requirementId);
    }

    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.round) {
      filter.round = query.round;
    }

    if (query?.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { interviewId: regex },
        { interviewerName: regex },
        { round: regex },
      ];
    }

    const items = await this.interviewModel
      .find(filter)
      .populate('candidateId', 'name fullName email phone')
      .populate('requirementId', 'title reqCode clientName')
      .populate('submissionId', 'submissionId stage')
      .sort({ dateTime: -1 })
      .exec();

    return items.map((item) => this.sanitizeInterview(item));
  }

  /** GET /api/v1/interviews/:id */
  async findById(id: string, currentUser: any) {
    let doc: InterviewDocument | null = null;

    if (Types.ObjectId.isValid(id)) {
      doc = await this.interviewModel
        .findOne({ _id: id, deletedAt: null })
        .populate('candidateId', 'name fullName email phone')
        .populate('requirementId', 'title reqCode clientName')
        .populate('submissionId', 'submissionId stage')
        .exec();
    }

    if (!doc) {
      doc = await this.interviewModel
        .findOne({ interviewId: id, deletedAt: null })
        .populate('candidateId', 'name fullName email phone')
        .populate('requirementId', 'title reqCode clientName')
        .populate('submissionId', 'submissionId stage')
        .exec();
    }

    if (!doc) {
      throw new NotFoundException(`Interview '${id}' not found`);
    }

    const sanitized = this.sanitizeInterview(doc);

    // Fetch associated feedback records
    const feedbacks = await this.feedbackModel
      .find({ interviewId: doc._id })
      .sort({ createdAt: -1 })
      .exec();

    return {
      ...sanitized,
      feedbacks,
    };
  }

  /** POST /api/v1/interviews */
  async create(dto: CreateInterviewDto, currentUser: any) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');

    if (!Types.ObjectId.isValid(dto.submissionId)) {
      throw new BadRequestException('Invalid submissionId ObjectId');
    }

    const submissionObjectId = new Types.ObjectId(dto.submissionId);
    const subDoc = await this.submissionModel.findById(submissionObjectId).exec();

    if (!subDoc) {
      throw new NotFoundException(`Submission '${dto.submissionId}' not found`);
    }

    const candidateId = dto.candidateId && Types.ObjectId.isValid(dto.candidateId)
      ? new Types.ObjectId(dto.candidateId)
      : new Types.ObjectId(subDoc.candidateId.toString());

    const requirementId = dto.requirementId && Types.ObjectId.isValid(dto.requirementId)
      ? new Types.ObjectId(dto.requirementId)
      : new Types.ObjectId(subDoc.requirementId.toString());

    const interviewDate = new Date(dto.dateTime);
    if (isNaN(interviewDate.getTime())) {
      throw new BadRequestException('Invalid dateTime');
    }

    const durationMinutes = dto.durationMinutes || 60;
    const interviewerEmail = (dto.interviewerEmail || 'interviewer@metaforgeit.com').trim().toLowerCase();

    // Conflict detection guard query
    const conflict = await this.interviewModel.findOne({
      orgId,
      interviewerEmail,
      status: 'Scheduled',
      dateTime: {
        $gte: new Date(interviewDate.getTime() - durationMinutes * 60000),
        $lte: new Date(interviewDate.getTime() + durationMinutes * 60000),
      },
      deletedAt: null,
    }).exec();

    if (conflict) {
      throw new ConflictException('Interviewer has a conflicting schedule at this time');
    }

    const interviewId = await this.generateInterviewId(orgId);

    const newInterview = new this.interviewModel({
      orgId,
      interviewId,
      submissionId: submissionObjectId,
      candidateId,
      requirementId,
      round: dto.round || 'L1 Technical',
      dateTime: interviewDate,
      durationMinutes,
      mode: dto.mode || 'Online',
      meetingUrl: dto.meetingUrl || null,
      interviewerName: dto.interviewerName || 'Technical Interviewer',
      interviewerEmail,
      status: 'Scheduled',
    });

    const saved = await newInterview.save();

    // Update submission stage if needed
    if (subDoc.stage !== 'Interview Scheduled' && subDoc.stage !== 'Placed') {
      subDoc.stage = 'Interview Scheduled';
      await subDoc.save();
    }

    // Trigger notification if notifications service available
    if (this.notificationsService && subDoc.recruiterId) {
      try {
        await this.notificationsService.createNotification({
          orgId,
          userId: new Types.ObjectId(subDoc.recruiterId.toString()),
          type: 'interview_scheduled',
          title: 'Interview Scheduled',
          message: `${saved.round} interview scheduled for candidate on ${saved.dateTime.toISOString()}`,
          entityId: new Types.ObjectId(saved._id.toString()),
          entityType: 'interview',
        });
      } catch (e) {}
    }

    return this.findById(saved._id.toString(), currentUser);
  }

  /** PUT /api/v1/interviews/:id/reschedule */
  async reschedule(id: string, dto: RescheduleInterviewDto, currentUser: any) {
    let doc: InterviewDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.interviewModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.interviewModel.findOne({ interviewId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Interview '${id}' not found`);
    }

    const newDate = new Date(dto.dateTime);
    if (isNaN(newDate.getTime())) {
      throw new BadRequestException('Invalid dateTime');
    }

    doc.dateTime = newDate;
    if (dto.durationMinutes) {
      doc.durationMinutes = dto.durationMinutes;
    }

    doc.status = 'Rescheduled';

    const updated = await doc.save();
    return this.findById(updated._id.toString(), currentUser);
  }

  /** PUT /api/v1/interviews/:id/feedback */
  async submitFeedback(id: string, dto: SubmitFeedbackDto, currentUser: any) {
    let doc: InterviewDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.interviewModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.interviewModel.findOne({ interviewId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Interview '${id}' not found`);
    }

    const evaluatorName = dto.evaluatorName || currentUser?.name || doc.interviewerName;
    const evaluatorEmail = (dto.evaluatorEmail || currentUser?.email || doc.interviewerEmail).toLowerCase();

    // Create feedback record
    const feedback = new this.feedbackModel({
      orgId: doc.orgId,
      interviewId: doc._id,
      evaluatorName,
      evaluatorEmail,
      technicalScore: dto.technicalScore || 0,
      feedbackNotes: dto.feedbackNotes || dto.notes || '',
      recommendation: dto.recommendation,
      rejectionReason: dto.rejectionReason || null,
    });

    await feedback.save();

    // Update interview status
    doc.status = dto.recommendation === 'Passed' ? 'Passed' : (dto.recommendation === 'Rejected' ? 'Rejected' : 'Completed');
    await doc.save();

    return this.findById(doc._id.toString(), currentUser);
  }

  /** POST /api/v1/interviews/:id/cancel */
  async cancel(id: string, dto: CancelInterviewDto, currentUser: any) {
    let doc: InterviewDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      doc = await this.interviewModel.findOne({ _id: id, deletedAt: null }).exec();
    }
    if (!doc) {
      doc = await this.interviewModel.findOne({ interviewId: id, deletedAt: null }).exec();
    }

    if (!doc) {
      throw new NotFoundException(`Interview '${id}' not found`);
    }

    doc.status = 'Cancelled';
    const updated = await doc.save();
    return this.findById(updated._id.toString(), currentUser);
  }

  /** DELETE /api/v1/interviews/:id */
  async softDelete(id: string, currentUser: any) {
    let targetId: string = id;
    if (!Types.ObjectId.isValid(id)) {
      const doc = await this.interviewModel.findOne({ interviewId: id, deletedAt: null }).exec();
      if (!doc) throw new NotFoundException(`Interview '${id}' not found`);
      targetId = doc._id.toString();
    }

    const deleted = await this.interviewRepository.softDelete(targetId, currentUser);
    return { message: `Interview '${deleted.interviewId || targetId}' soft-deleted successfully` };
  }
}
