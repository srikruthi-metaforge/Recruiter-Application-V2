import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Requirement, RequirementDocument } from '../requirements/schemas/requirement.schema';
import { Submission, SubmissionDocument } from '../submissions/schemas/submission.schema';
import { Interview, InterviewDocument } from '../interviews/schemas/interview.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Candidate, CandidateDocument } from '../candidates/schemas/candidate.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';
import { ActivityLog, ActivityLogDocument } from '../audit/schemas/activity-log.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';
import {
  mapActivityLog,
  mapCandidate,
  mapClient,
  mapInterview,
  mapRequirement,
  mapSubmission,
} from './workspace.mapper';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Requirement.name) private readonly requirementModel: Model<RequirementDocument>,
    @InjectModel(Submission.name) private readonly submissionModel: Model<SubmissionDocument>,
    @InjectModel(Interview.name) private readonly interviewModel: Model<InterviewDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Candidate.name) private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
    @InjectModel(ActivityLog.name) private readonly activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
  ) {}

  private orgFilter(currentUser: any) {
    const orgId = currentUser?.orgId
      ? new Types.ObjectId(currentUser.orgId.toString())
      : null;
    return orgId ? { orgId, deletedAt: null } : { deletedAt: null };
  }

  async getWorkspacePayload(currentUser: any) {
    const base = this.orgFilter(currentUser);
    const role = String(currentUser?.role || '').toLowerCase();
    const userObjectId = currentUser?.id || currentUser?.userId
      ? new Types.ObjectId((currentUser.id || currentUser.userId).toString())
      : null;

    const reqFilter: Record<string, any> = { ...base };
    if (role === 'recruiter' && userObjectId) {
      reqFilter.$or = [{ assignedRecruiterIds: userObjectId }, { assignedLeadId: userObjectId }];
    } else if (role === 'client' && currentUser.clientId) {
      reqFilter.clientId = new Types.ObjectId(currentUser.clientId);
    }

    const [
      requirements,
      submissions,
      interviews,
      users,
      candidates,
      clients,
      activityLogs,
      teams,
    ] = await Promise.all([
      this.requirementModel.find(reqFilter).sort({ createdAt: -1 }).lean().exec(),
      this.submissionModel
        .find(role === 'recruiter' && userObjectId
          ? { ...base, $or: [{ recruiterId: userObjectId }, { leadId: userObjectId }] }
          : base)
        .populate('candidateId', 'name email phone totalExperienceYears')
        .populate('requirementId', 'title reqCode clientName')
        .populate('clientId', 'clientName')
        .populate('recruiterId', 'name email')
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.interviewModel
        .find(base)
        .populate('candidateId', 'name')
        .populate('requirementId', 'title clientName')
        .sort({ dateTime: 1 })
        .lean()
        .exec(),
      this.userModel.find({ ...base }).lean().exec(),
      this.candidateModel.find(base).sort({ createdAt: -1 }).lean().exec(),
      this.clientModel.find(base).sort({ clientName: 1 }).lean().exec(),
      this.activityLogModel.find({ orgId: base.orgId }).sort({ createdAt: -1 }).limit(200).lean().exec(),
      this.teamModel.find(base).populate('leadId', 'name email').populate('recruiterIds', 'name email').lean().exec(),
    ]);

    const usersById = new Map(users.map((u: any) => [String(u._id), u]));
    const subCounts = new Map<string, number>();
    const intCounts = new Map<string, number>();
    const placedCounts = new Map<string, number>();

    for (const s of submissions as any[]) {
      const recId = s.recruiterId?._id ? String(s.recruiterId._id) : String(s.recruiterId || '');
      subCounts.set(recId, (subCounts.get(recId) || 0) + 1);
      if (s.stage === 'Placed') placedCounts.set(recId, (placedCounts.get(recId) || 0) + 1);
    }
    for (const iv of interviews as any[]) {
      const req = iv.requirementId;
      const recIds = req?.assignedRecruiterIds || [];
      for (const rid of recIds) {
        const key = String(rid);
        intCounts.set(key, (intCounts.get(key) || 0) + 1);
      }
    }

    const recruiters = users
      .filter((u: any) => u.role === 'recruiter')
      .map((u: any) => {
        const key = String(u._id);
        const lead = u.teamId
          ? users.find((x: any) => x.role === 'lead' && String(x.teamId) === String(u.teamId))
          : users.find((x: any) => x.role === 'lead');
        const admin = users.find((x: any) => x.role === 'admin');
        return {
          id: u.userId || key,
          name: u.name,
          lead: lead?.name || '',
          admin: admin?.name || '',
          submissions: subCounts.get(key) || 0,
          interviews: intCounts.get(key) || 0,
          placements: placedCounts.get(key) || 0,
          target: 40,
          active: u.active !== false,
          today: 0,
          email: u.email,
          requirementsCount: requirements.filter((r: any) =>
            (r.assignedRecruiterIds || []).some((id: any) => String(id) === key),
          ).length,
          l1Interviews: 0,
          l2Interviews: 0,
          customInterviews: 0,
          finalInterviews: 0,
          weeklyProgress: 80,
          weeklyTarget: 10,
          taskStatus: 'POSITIVE',
          submissionType: 'Direct Sourcing',
          primaryClient: (requirements[0] as any)?.clientName || '',
          tat: '2.0 Days',
        };
      });

    const leads = users
      .filter((u: any) => u.role === 'lead')
      .map((u: any) => {
        const teamRecruiters = recruiters.filter((r) => r.lead === u.name);
        const admin = users.find((x: any) => x.role === 'admin');
        return {
          id: u.userId || String(u._id),
          name: u.name,
          admin: admin?.name || '',
          recruiters: teamRecruiters.length,
          submissions: teamRecruiters.reduce((a, r) => a + r.submissions, 0),
          interviews: teamRecruiters.reduce((a, r) => a + r.interviews, 0),
          placements: teamRecruiters.reduce((a, r) => a + r.placements, 0),
          email: u.email,
          clientAccount: (requirements[0] as any)?.clientName || '',
          clientAccounts: [...new Set(requirements.map((r: any) => r.clientName).filter(Boolean))],
        };
      });

    const admins = users
      .filter((u: any) => u.role === 'admin' || u.role === 'superadmin')
      .map((u: any) => ({
        id: u.userId || String(u._id),
        name: u.name,
        leads: leads.length,
        recruiters: recruiters.length,
        requirements: requirements.length,
        submissions: submissions.length,
        interviews: interviews.length,
        placements: placedCounts.size,
        revenue: '$0',
        email: u.email,
      }));

    const mappedReqs = requirements.map((r: any) => {
      const lead = r.assignedLeadId ? usersById.get(String(r.assignedLeadId)) : null;
      return mapRequirement({ ...r, assignedLeadName: lead?.name });
    });

    const mappedInterviews = interviews.map((iv: any) => {
      const recName = recruiters[0]?.name || currentUser?.name || '';
      return mapInterview(iv, {
        candidateName: iv.candidateId?.name,
        title: iv.requirementId?.title,
        clientName: iv.requirementId?.clientName,
        recruiterName: recName,
      });
    });

    const clientStats = new Map<string, { activeReqs: number; submissions: number; placements: number }>();
    for (const r of requirements as any[]) {
      const key = String(r.clientId);
      const cur = clientStats.get(key) || { activeReqs: 0, submissions: 0, placements: 0 };
      if (r.status !== 'Closed') cur.activeReqs += 1;
      clientStats.set(key, cur);
    }

    const mappedTeams = teams.map((t: any) => ({
      id: t.teamId || String(t._id),
      teamName: t.teamName,
      leadName: t.leadId?.name || '',
      leadEmail: t.leadId?.email || '',
      leadRole: 'Team Lead',
      leadAvatar: String(t.leadId?.name || 'L').charAt(0),
      primaryClient: (requirements[0] as any)?.clientName || '',
      membersCount: (t.recruiterIds || []).length,
      members: (t.recruiterIds || []).map((m: any) => ({
        id: String(m._id || m),
        name: m.name || '',
        role: 'Recruiter',
        email: m.email || '',
        avatar: String(m.name || 'R').charAt(0),
        requirementsCount: 0,
        submissionsCount: 0,
        primaryClient: '',
      })),
    }));

    return {
      user: {
        id: currentUser.id || currentUser.userId,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        orgId: currentUser.orgId,
        permissions: currentUser.permissions || [],
      },
      requirements: mappedReqs,
      submissions: submissions.map(mapSubmission),
      interviews: mappedInterviews,
      recruiters,
      leads,
      admins,
      activityLogs: activityLogs.map(mapActivityLog),
      candidates: candidates.map(mapCandidate),
      clients: clients.map((c: any) => mapClient(c, clientStats.get(String(c._id)))),
      teams: mappedTeams,
      users: users.map((u: any) => ({
        id: u.userId || String(u._id),
        _id: String(u._id),
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        employeeId: u.userId,
        role: u.role,
        roleCode: u.role,
        team: '',
        supervisor: '',
        status: u.active === false ? 'Locked' : 'Active',
        twoFactorEnabled: false,
        lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : '',
        lastPasswordChange: '',
      })),
      stats: {
        totalRequirements: mappedReqs.length,
        activeRequirements: mappedReqs.filter((r) => r.status === 'Open' || r.status === 'Active').length,
        totalOpenings: mappedReqs.reduce((a, r) => a + (r.openings || 1), 0),
        totalPlaced: mappedReqs.reduce((a, r) => a + (r.placed || 0), 0),
      },
    };
  }
}
