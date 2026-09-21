import { api } from '../lib/api'
import type { ActivityLogItem, Interview, Recruiter, Requirement, Submission } from '../types'

export interface WorkspacePayload {
  requirements: Requirement[]
  submissions: Submission[]
  interviews: Interview[]
  recruiters: Recruiter[]
  leads: unknown[]
  admins: unknown[]
  activityLogs: ActivityLogItem[]
}

export const workspaceService = {
  load: () => api.get<WorkspacePayload>('/workspace'),
  createRequirement: (body: Requirement) => api.post<Requirement>('/requirements', body),
  updateRequirements: (body: Requirement[]) => api.put<Requirement[]>('/requirements/bulk', body),
  createSubmission: (body: Submission) => api.post<Submission>('/submissions', body),
  saveInterviewFeedback: (id: string, status: string, notes: string) =>
    api.post(`/interviews/${id}/feedback`, { status, notes }),
  addActivityLog: (body: ActivityLogItem) => api.post<ActivityLogItem>('/audit/logs', body),
}
