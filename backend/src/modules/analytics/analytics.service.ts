import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Requirement, RequirementDocument } from '../requirements/schemas/requirement.schema';
import { Candidate, CandidateDocument } from '../candidates/schemas/candidate.schema';
import { Submission, SubmissionDocument } from '../submissions/schemas/submission.schema';
import { Interview, InterviewDocument } from '../interviews/schemas/interview.schema';
import { Offer, OfferDocument } from '../offers/schemas/offer.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RecruiterAnalytics, RecruiterAnalyticsDocument } from './schemas/recruiter-analytics.schema';
import { assertAnalyticsAccess } from './analytics.access';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Requirement.name)
    private readonly requirementModel: Model<RequirementDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(RecruiterAnalytics.name)
    private readonly recruiterAnalyticsModel: Model<RecruiterAnalyticsDocument>,
  ) {}

  private parseDateFilter(startDate?: string, endDate?: string) {
    const filter: Record<string, any> = {};
    if (startDate) {
      const s = new Date(startDate);
      if (!isNaN(s.getTime())) filter.$gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      if (!isNaN(e.getTime())) filter.$lte = e;
    }
    return Object.keys(filter).length > 0 ? filter : null;
  }

  private resolveOrgId(currentUser: any): Types.ObjectId {
    return currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : new Types.ObjectId('6ab4f38ff2e0e1823c038948');
  }

  /** GET /api/v1/analytics/dashboard */
  async getDashboardSummary(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; recruiterId?: string; clientId?: string },
  ) {
    const scope = assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const dateFilter = this.parseDateFilter(query?.startDate, query?.endDate);

    const reqFilter: Record<string, any> = { orgId, deletedAt: null };
    const subFilter: Record<string, any> = { orgId, deletedAt: null };
    const candFilter: Record<string, any> = { orgId, deletedAt: null };
    const intFilter: Record<string, any> = { orgId, deletedAt: null };
    const offerFilter: Record<string, any> = { orgId, deletedAt: null };
    const clientFilter: Record<string, any> = { orgId, deletedAt: null };

    if (dateFilter) {
      reqFilter.createdAt = dateFilter;
      subFilter.createdAt = dateFilter;
      candFilter.createdAt = dateFilter;
      intFilter.createdAt = dateFilter;
      offerFilter.createdAt = dateFilter;
    }

    if (query?.recruiterId && Types.ObjectId.isValid(query.recruiterId)) {
      subFilter.recruiterId = new Types.ObjectId(query.recruiterId);
    }

    if (query?.clientId && Types.ObjectId.isValid(query.clientId)) {
      const cId = new Types.ObjectId(query.clientId);
      reqFilter.clientId = cId;
      subFilter.clientId = cId;
    }

    // Counts
    const totalRequirements = await this.requirementModel.countDocuments(reqFilter).exec();
    const activeRequirements = await this.requirementModel.countDocuments({
      ...reqFilter,
      status: { $in: ['Open', 'In Progress', 'Assigned', 'Active'] },
    }).exec();

    const requirements = await this.requirementModel.find(reqFilter, 'openings placedCount').exec();
    const totalOpenings = requirements.reduce((acc, r) => acc + (r.openings || 1), 0);
    const totalPlaced = requirements.reduce((acc, r) => acc + (r.placedCount || 0), 0);

    const totalCandidates = await this.candidateModel.countDocuments(candFilter).exec();
    const totalSubmissions = await this.submissionModel.countDocuments(subFilter).exec();
    const totalInterviews = await this.interviewModel.countDocuments(intFilter).exec();
    const totalOffers = await this.offerModel.countDocuments(offerFilter).exec();
    const totalClients = await this.clientModel.countDocuments(clientFilter).exec();

    // Submission stage breakdown
    const submissionStages = await this.submissionModel.aggregate([
      { $match: subFilter },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]).exec();

    const submissionsByStage: Record<string, number> = {
      Submitted: 0,
      'Submitted to Lead': 0,
      'Submitted to Client': 0,
      'Client Review': 0,
      'Interview Scheduled': 0,
      Offered: 0,
      Placed: 0,
      Rejected: 0,
    };
    submissionStages.forEach((item) => {
      if (item._id) submissionsByStage[item._id] = item.count;
    });

    // Interview status breakdown
    const interviewStatuses = await this.interviewModel.aggregate([
      { $match: intFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();

    const interviewsByStatus: Record<string, number> = {
      Scheduled: 0,
      Confirmed: 0,
      Completed: 0,
      Passed: 0,
      Rejected: 0,
      Rescheduled: 0,
      Cancelled: 0,
    };
    interviewStatuses.forEach((item) => {
      if (item._id) interviewsByStatus[item._id] = item.count;
    });

    // Offer status breakdown
    const offerStatuses = await this.offerModel.aggregate([
      { $match: offerFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();

    const offersByStatus: Record<string, number> = {
      'Offer Released': 0,
      Accepted: 0,
      Joined: 0,
      Declined: 0,
      'Backed Out': 0,
    };
    offerStatuses.forEach((item) => {
      if (item._id) offersByStatus[item._id] = item.count;
    });

    // Match score average
    const matchScoreAgg = await this.submissionModel.aggregate([
      { $match: { ...subFilter, matchScore: { $gt: 0 } } },
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } },
    ]).exec();

    const avgMatchScore = matchScoreAgg.length > 0 ? Math.round(matchScoreAgg[0].avgScore) : 85;

    return {
      scope,
      kpis: {
        totalRequirements,
        activeRequirements,
        totalOpenings,
        totalPlaced,
        totalCandidates,
        totalSubmissions,
        totalInterviews,
        totalOffers,
        totalClients,
        avgMatchScore,
      },
      submissionsByStage,
      interviewsByStatus,
      offersByStatus,
    };
  }

  /** GET /api/v1/analytics/trends — monthly company-wide volume for charts */
  async getTrends(
    currentUser: any,
    query?: { startDate?: string; endDate?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const end = query?.endDate && !isNaN(new Date(query.endDate).getTime())
      ? new Date(query.endDate)
      : new Date();
    const start = query?.startDate && !isNaN(new Date(query.startDate).getTime())
      ? new Date(query.startDate)
      : new Date(end.getFullYear(), end.getMonth() - 5, 1);

    const baseMatch = {
      orgId,
      deletedAt: null,
      createdAt: { $gte: start, $lte: end },
    };

    const monthGroup = {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      },
      count: { $sum: 1 },
    };

    const [reqTrend, subTrend, intTrend] = await Promise.all([
      this.requirementModel.aggregate([{ $match: baseMatch }, { $group: monthGroup }, { $sort: { '_id.year': 1, '_id.month': 1 } }]).exec(),
      this.submissionModel.aggregate([{ $match: baseMatch }, { $group: monthGroup }, { $sort: { '_id.year': 1, '_id.month': 1 } }]).exec(),
      this.interviewModel.aggregate([{ $match: baseMatch }, { $group: monthGroup }, { $sort: { '_id.year': 1, '_id.month': 1 } }]).exec(),
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const keyOf = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;
    const map: Record<string, { month: string; requirements: number; submissions: number; interviews: number }> = {};

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endCursor = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endCursor) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const key = keyOf(y, m);
      map[key] = { month: `${monthNames[m - 1]} ${y}`, requirements: 0, submissions: 0, interviews: 0 };
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const apply = (rows: any[], field: 'requirements' | 'submissions' | 'interviews') => {
      for (const row of rows) {
        const key = keyOf(row._id.year, row._id.month);
        if (map[key]) map[key][field] = row.count;
      }
    };
    apply(reqTrend, 'requirements');
    apply(subTrend, 'submissions');
    apply(intTrend, 'interviews');

    return { months: Object.values(map) };
  }

  /** GET /api/v1/analytics/requirements */
  async getRequirementStats(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; clientId?: string; status?: string; priority?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const filter: Record<string, any> = { orgId, deletedAt: null };
    const dateFilter = this.parseDateFilter(query?.startDate, query?.endDate);
    if (dateFilter) filter.createdAt = dateFilter;

    if (query?.clientId && Types.ObjectId.isValid(query.clientId)) {
      filter.clientId = new Types.ObjectId(query.clientId);
    }
    if (query?.status) filter.status = query.status;
    if (query?.priority) filter.priority = query.priority;

    const total = await this.requirementModel.countDocuments(filter).exec();

    const byStatusAgg = await this.requirementModel.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();

    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((item) => {
      if (item._id) byStatus[item._id] = item.count;
    });

    const byPriorityAgg = await this.requirementModel.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]).exec();

    const byPriority: Record<string, number> = {};
    byPriorityAgg.forEach((item) => {
      if (item._id) byPriority[item._id] = item.count;
    });

    const byClientAgg = await this.requirementModel.aggregate([
      { $match: filter },
      { $group: { _id: '$clientName', count: { $sum: 1 }, openings: { $sum: '$openings' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).exec();

    return {
      total,
      byStatus,
      byPriority,
      byClient: byClientAgg.map((c) => ({ clientName: c._id || 'N/A', count: c.count, openings: c.openings })),
    };
  }

  /** GET /api/v1/analytics/candidates */
  async getCandidateStats(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; status?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const filter: Record<string, any> = { orgId, deletedAt: null };
    const dateFilter = this.parseDateFilter(query?.startDate, query?.endDate);
    if (dateFilter) filter.createdAt = dateFilter;
    if (query?.status) filter.status = query.status;

    const total = await this.candidateModel.countDocuments(filter).exec();

    const byStatusAgg = await this.candidateModel.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();

    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((item) => {
      if (item._id) byStatus[item._id] = item.count;
    });

    const experienceRanges = await this.candidateModel.aggregate([
      { $match: filter },
      {
        $bucket: {
          groupBy: '$totalExperienceYears',
          boundaries: [0, 3, 6, 9, 20],
          default: '20+',
          output: { count: { $sum: 1 } },
        },
      },
    ]).exec();

    return {
      total,
      byStatus,
      experienceRanges: experienceRanges.map((r) => ({
        range: r._id === 0 ? '0-2 yrs' : r._id === 3 ? '3-5 yrs' : r._id === 6 ? '6-8 yrs' : '9+ yrs',
        count: r.count,
      })),
    };
  }

  /** GET /api/v1/analytics/submissions */
  async getSubmissionStats(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; recruiterId?: string; leadId?: string; clientId?: string; stage?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const filter: Record<string, any> = { orgId, deletedAt: null };
    const dateFilter = this.parseDateFilter(query?.startDate, query?.endDate);
    if (dateFilter) filter.createdAt = dateFilter;

    if (query?.recruiterId && Types.ObjectId.isValid(query.recruiterId)) {
      filter.recruiterId = new Types.ObjectId(query.recruiterId);
    }
    if (query?.leadId && Types.ObjectId.isValid(query.leadId)) {
      filter.leadId = new Types.ObjectId(query.leadId);
    }
    if (query?.clientId && Types.ObjectId.isValid(query.clientId)) {
      filter.clientId = new Types.ObjectId(query.clientId);
    }
    if (query?.stage) filter.stage = query.stage;

    const total = await this.submissionModel.countDocuments(filter).exec();

    const byStageAgg = await this.submissionModel.aggregate([
      { $match: filter },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]).exec();

    const byStage: Record<string, number> = {};
    byStageAgg.forEach((item) => {
      if (item._id) byStage[item._id] = item.count;
    });

    const byLeadApprovalAgg = await this.submissionModel.aggregate([
      { $match: filter },
      { $group: { _id: '$leadApprovalStatus', count: { $sum: 1 } } },
    ]).exec();

    const byLeadApproval: Record<string, number> = {};
    byLeadApprovalAgg.forEach((item) => {
      if (item._id) byLeadApproval[item._id] = item.count;
    });

    return {
      total,
      byStage,
      byLeadApproval,
    };
  }

  /** GET /api/v1/analytics/interviews */
  async getInterviewStats(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; status?: string; round?: string; interviewerEmail?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const filter: Record<string, any> = { orgId, deletedAt: null };
    const dateFilter = this.parseDateFilter(query?.startDate, query?.endDate);
    if (dateFilter) filter.createdAt = dateFilter;

    if (query?.status) filter.status = query.status;
    if (query?.round) filter.round = query.round;
    if (query?.interviewerEmail) filter.interviewerEmail = query.interviewerEmail.toLowerCase().trim();

    const total = await this.interviewModel.countDocuments(filter).exec();

    const byRoundAgg = await this.interviewModel.aggregate([
      { $match: filter },
      { $group: { _id: '$round', count: { $sum: 1 } } },
    ]).exec();

    const byRound: Record<string, number> = {};
    byRoundAgg.forEach((item) => {
      if (item._id) byRound[item._id] = item.count;
    });

    const byStatusAgg = await this.interviewModel.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();

    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((item) => {
      if (item._id) byStatus[item._id] = item.count;
    });

    return {
      total,
      byRound,
      byStatus,
    };
  }

  /** GET /api/v1/analytics/offers */
  async getOfferStats(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; status?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const filter: Record<string, any> = { orgId, deletedAt: null };
    const dateFilter = this.parseDateFilter(query?.startDate, query?.endDate);
    if (dateFilter) filter.createdAt = dateFilter;
    if (query?.status) filter.status = query.status;

    const total = await this.offerModel.countDocuments(filter).exec();

    const byStatusAgg = await this.offerModel.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]).exec();

    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((item) => {
      if (item._id) byStatus[item._id] = item.count;
    });

    const ctcAgg = await this.offerModel.aggregate([
      { $match: filter },
      { $group: { _id: null, totalCtc: { $sum: '$offeredCtc' }, avgCtc: { $avg: '$offeredCtc' } } },
    ]).exec();

    const totalCtc = ctcAgg.length > 0 ? ctcAgg[0].totalCtc : 0;
    const avgCtc = ctcAgg.length > 0 ? Math.round(ctcAgg[0].avgCtc) : 0;

    return {
      total,
      byStatus,
      totalCtc,
      avgCtc,
    };
  }

  /** GET /api/v1/analytics/clients */
  async getClientStats(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; tier?: string; status?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const filter: Record<string, any> = { orgId, deletedAt: null };
    if (query?.tier) filter.tier = query.tier;
    if (query?.status) filter.status = query.status;

    const total = await this.clientModel.countDocuments(filter).exec();

    const byTierAgg = await this.clientModel.aggregate([
      { $match: filter },
      { $group: { _id: '$tier', count: { $sum: 1 } } },
    ]).exec();

    const byTier: Record<string, number> = {};
    byTierAgg.forEach((item) => {
      if (item._id) byTier[item._id] = item.count;
    });

    return {
      total,
      byTier,
    };
  }

  /** GET /api/v1/analytics/recruiters */
  async getRecruiterStats(
    currentUser: any,
    query?: { startDate?: string; endDate?: string; recruiterId?: string },
  ) {
    assertAnalyticsAccess(currentUser);
    const orgId = this.resolveOrgId(currentUser);

    const userFilter: Record<string, any> = {
      orgId,
      deletedAt: null,
      role: { $in: ['recruiter', 'lead'] },
    };
    if (query?.recruiterId && Types.ObjectId.isValid(query.recruiterId)) {
      userFilter._id = new Types.ObjectId(query.recruiterId);
    }

    const dateFilter = this.parseDateFilter(query?.startDate, query?.endDate);
    const recruiters = await this.userModel.find(userFilter, 'name email role').exec();

    const performanceList = [];
    for (const r of recruiters) {
      const rId = r._id as Types.ObjectId;
      const subFilter: Record<string, any> = {
        orgId,
        recruiterId: rId,
        deletedAt: null,
      };
      if (dateFilter) subFilter.createdAt = dateFilter;

      const subCount = await this.submissionModel.countDocuments(subFilter).exec();
      const placedCount = await this.submissionModel.countDocuments({
        ...subFilter,
        stage: 'Placed',
      }).exec();

      performanceList.push({
        recruiterId: rId.toString(),
        name: r.name,
        email: r.email,
        role: r.role,
        submissionsCount: subCount,
        placementsCount: placedCount,
      });
    }

    return performanceList.sort((a, b) => b.submissionsCount - a.submissionsCount);
  }
}
