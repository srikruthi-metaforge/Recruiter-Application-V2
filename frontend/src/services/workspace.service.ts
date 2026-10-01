import { api } from '../lib/api'
import type {
  ActivityLogItem,
  Admin,
  Candidate,
  Interview,
  Lead,
  Recruiter,
  Requirement,
  Submission,
} from '../types'

export interface WorkspaceUser {
  id: string
  _id?: string
  name: string
  email: string
  phone?: string
  employeeId?: string
  role: string
  roleCode?: string
  team?: string
  supervisor?: string
  status?: string
  lastLogin?: string
}

export interface WorkspacePayload {
  requirements: Requirement[]
  submissions: Submission[]
  interviews: Interview[]
  recruiters: Recruiter[]
  leads: Lead[]
  admins: Admin[]
  activityLogs: ActivityLogItem[]
  candidates: Candidate[]
  clients: unknown[]
  teams: unknown[]
  users: WorkspaceUser[]
  user?: { id: string; email: string; name: string; role: string }
}

export const workspaceService = {
  load: () => api.get<WorkspacePayload>('/workspace'),
  createRequirement: (body: Requirement) =>
    api.post('/requirements', {
      title: body.title,
      client: body.client,
      clientName: body.client,
      priority: body.priority,
      openings: body.openings,
      skillsRequired: body.skills,
      location: body.location,
      status: body.status === 'Active' ? 'In Progress' : body.status,
    }),
  updateRequirements: (body: Requirement[]) => api.put('/requirements/bulk', body),
  createSubmission: (body: Submission) => api.post('/submissions', body),
  saveInterviewFeedback: (id: string, status: string, notes: string) =>
    api.post(`/interviews/${encodeURIComponent(id)}/feedback`, {
      recommendation: status === 'Passed' || status === 'Confirmed' || status === 'Completed' ? 'Passed' : status === 'Rejected' || status === 'Cancelled' ? 'Rejected' : 'Hold',
      notes,
      feedbackNotes: notes,
    }),
  addActivityLog: (body: ActivityLogItem) => api.post('/audit/logs', body),
}

export const usersService = {
  list: (query = '') => api.get<any[]>(`/users${query}`),
  me: () => api.get('/users/me'),
  updateMe: (body: unknown) => api.put('/users/me', body),
  create: (body: unknown) => api.post('/users', body),
  update: (id: string, body: unknown) => api.put(`/users/${encodeURIComponent(id)}`, body),
  remove: (id: string) => api.delete(`/users/${encodeURIComponent(id)}`),
  screenTime: (body: unknown) => api.post('/users/screen-time', body),
}

export const rolesService = {
  permissions: () => api.get<any[]>('/roles/permissions'),
  updatePermissions: (body: unknown) => api.put('/roles/permissions', body),
}

export const clientsService = {
  list: () => api.get<any[]>('/clients'),
  create: (body: unknown) => api.post('/clients', body),
  update: (id: string, body: unknown) => api.put(`/clients/${id}`, body),
  remove: (id: string) => api.delete(`/clients/${id}`),
}

export const candidatesService = {
  list: () => api.get<any>('/candidates'),
  create: (body: unknown) => api.post('/candidates', body),
  update: (id: string, body: unknown) => api.put(`/candidates/${encodeURIComponent(id)}`, body),
  duplicateCheck: (body: unknown) => api.post('/candidates/duplicate-check', body),
}

export const teamsService = {
  list: () => api.get<any[]>('/teams'),
}

export const submissionsService = {
  list: (query = '') => api.get<any[]>(`/submissions${query}`),
  getById: (id: string) => api.get<any>(`/submissions/${encodeURIComponent(id)}`),
  create: (body: unknown) => api.post('/submissions', body),
  updateStage: (id: string, body: { stage: string; notes?: string }) =>
    api.put(`/submissions/${encodeURIComponent(id)}/stage`, body),
  leadApproval: (id: string, body: { approved?: boolean; status?: string; reason?: string; notes?: string }) =>
    api.post(`/submissions/${encodeURIComponent(id)}/lead-approval`, body),
  forwardClient: (id: string, body?: { notes?: string }) =>
    api.post(`/submissions/${encodeURIComponent(id)}/forward-client`, body || {}),
}

export const interviewsService = {
  list: (query = '') => api.get<any[]>(`/interviews${query}`),
  getById: (id: string) => api.get<any>(`/interviews/${encodeURIComponent(id)}`),
  create: (body: {
    submissionId: string
    candidateId?: string
    requirementId?: string
    round?: string
    dateTime: string
    durationMinutes?: number
    mode?: string
    meetingUrl?: string
    interviewerName?: string
    interviewerEmail?: string
  }) => api.post<any>('/interviews', body),
  reschedule: (id: string, body: { dateTime: string; durationMinutes?: number; reason?: string }) =>
    api.put<any>(`/interviews/${encodeURIComponent(id)}/reschedule`, body),
  submitFeedback: (id: string, body: { evaluatorName?: string; evaluatorEmail?: string; technicalScore?: number; feedbackNotes?: string; notes?: string; recommendation: string; rejectionReason?: string }) =>
    api.post<any>(`/interviews/${encodeURIComponent(id)}/feedback`, body),
  cancel: (id: string, body?: { reason?: string }) =>
    api.post<any>(`/interviews/${encodeURIComponent(id)}/cancel`, body || {}),
  remove: (id: string) => api.delete<any>(`/interviews/${encodeURIComponent(id)}`),
}


export const notificationsService = {
  list: (query = '') => api.get<any>(`/notifications${query}`),
  markRead: (id: string) => api.post<any>(`/notifications/${encodeURIComponent(id)}/read`),
  markAllAsRead: () => api.post<any>('/notifications/read-all'),
  remove: (id: string) => api.delete<any>(`/notifications/${encodeURIComponent(id)}`),
}

export const offersService = {
  list: (query = '') => api.get<any[]>(`/offers${query}`),
  getById: (id: string) => api.get<any>(`/offers/${encodeURIComponent(id)}`),
  create: (body: {
    submissionId: string
    candidateId?: string
    requirementId?: string
    offeredCtc: number
    joiningDate: string
    status?: string
    declinedReason?: string
  }) => api.post<any>('/offers', body),
  update: (id: string, body: {
    offeredCtc?: number
    joiningDate?: string
    status?: string
    declinedReason?: string
    notJoinedNote?: string
  }) => api.put<any>(`/offers/${encodeURIComponent(id)}`, body),
  updateStatus: (id: string, body: {
    status: string
    declinedReason?: string
    notJoinedNote?: string
    notes?: string
  }) => api.put<any>(`/offers/${encodeURIComponent(id)}/status`, body),
  remove: (id: string) => api.delete<any>(`/offers/${encodeURIComponent(id)}`),
}

export interface AnalyticsFilterQuery {
  startDate?: string
  endDate?: string
  recruiterId?: string
  clientId?: string
  leadId?: string
  status?: string
  priority?: string
  stage?: string
  round?: string
  interviewerEmail?: string
  tier?: string
}

function toQueryString(params?: AnalyticsFilterQuery): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      searchParams.append(k, String(v))
    }
  })
  const str = searchParams.toString()
  return str ? `?${str}` : ''
}

export const analyticsService = {
  dashboard: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/dashboard${toQueryString(params)}`),
  requirements: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/requirements${toQueryString(params)}`),
  candidates: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/candidates${toQueryString(params)}`),
  submissions: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/submissions${toQueryString(params)}`),
  interviews: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/interviews${toQueryString(params)}`),
  offers: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/offers${toQueryString(params)}`),
  clients: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/clients${toQueryString(params)}`),
  recruiters: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/recruiters${toQueryString(params)}`),
}

export interface FileMetadata {
  id?: string
  _id?: string
  fileId: string
  originalName: string
  mimeType: string
  sizeBytes: number
  storageProvider?: string
  storageKey?: string
  checksumSha256?: string
  scanStatus?: string
  uploadedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface FilesListResponse {
  items: FileMetadata[]
  total: number
  page: number
  limit: number
}

export const filesService = {
  list: (query = '') => api.get<FilesListResponse>(`/files${query}`),
  getById: (id: string) => api.get<FileMetadata>(`/files/${encodeURIComponent(id)}`),
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<FileMetadata>('/files', formData)
  },
  remove: (id: string) => api.delete<{ success: boolean; message: string }>(`/files/${encodeURIComponent(id)}`),
  downloadUrl: (id: string) => `/api/v1/files/${encodeURIComponent(id)}/download`,
}

export interface AISearchPayload {
  query?: string
  skills?: string[]
  minExperience?: number
  maxExperience?: number
  limit?: number
}

export const aiService = {
  match: (body: { candidateId: string; requirementId: string }) => api.post<any>('/ai/match', body),
  search: (body: AISearchPayload) => api.post<any>('/ai/search', body),
  parseResume: (body: { resumeText?: string; fileId?: string }) => api.post<any>('/ai/parse-resume', body),
  enrich: (body: { candidateId: string; resumeText?: string }) => api.post<any>('/ai/enrich', body),
  matchScores: (query = '') => api.get<any>(`/ai/match-scores${query}`),
}





