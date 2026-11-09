import { api, type ApiRequestInit } from '../lib/api'
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

export interface OriginalRequirementEmail {
  requirementId: string
  subject: string | null
  from: string | null
  fromName: string | null
  to: string[]
  cc: string[]
  receivedAt: string | null
  bodyText: string | null
  bodyHtml: string | null
  hasOriginal: boolean
  fallbackDescription: string | null
}

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
  /** Intentionally empty for large orgs — use candidatesService.listPage. */
  candidates: Candidate[]
  clients: unknown[]
  teams: unknown[]
  users: WorkspaceUser[]
  user?: { id: string; email: string; name: string; role: string }
  stats?: {
    totalRequirements?: number
    activeRequirements?: number
    totalOpenings?: number
    totalPlaced?: number
    totalCandidates?: number
    myCandidatesCount?: number
  }
}

export const workspaceService = {
  load: (init?: ApiRequestInit) => api.get<WorkspacePayload>('/workspace', init),
  createRequirement: (body: Requirement) => {
    const incomingStatus = String(body.status || '')
    const status =
      incomingStatus === 'Closed'
        ? 'Closed'
        : incomingStatus === 'Active' || !incomingStatus
          ? 'Open'
          : incomingStatus === 'In Progress' || incomingStatus === 'Assigned' || incomingStatus === 'On Hold' || incomingStatus === 'Hold'
            ? incomingStatus
            : 'Open'
    return api.post('/requirements', {
      title: body.title,
      client: body.client,
      clientName: (body as any).clientName || body.client,
      clientId: (body as any).clientId,
      priority: body.priority,
      openings: body.openings,
      skillsRequired: body.skills || (body as any).skillsRequired,
      mandatorySkills: body.mandatorySkills || (body as any).mandatorySkills,
      description: body.description || (body as any).description,
      rolesAndResponsibilities: body.rolesAndResponsibilities || (body as any).rolesAndResponsibilities,
      location: body.location,
      // Portal "Active" maps to backend Open so new demands get a real reqCode and appear in the shared list.
      status,
      clientEmail: body.clientEmail,
      toEmails: (body as any).toEmails,
      ccEmails: (body as any).ccEmails,
      assignedLeadId: (body as any).assignedLeadId,
      assignedRecruiterIds: (body as any).assignedRecruiterIds,
      // Persist YEARLY BUDGET from Create Job Demand form.
      budget: body.budget,
      budgetText: body.budget || (body as any).budgetText,
      budgetRange: (body as any).budgetRange,
    })
  },
  updateRequirements: (body: Requirement[]) => api.put('/requirements/bulk', body),
  updateRequirement: (id: string, body: Partial<Requirement> & Record<string, any>) => {
    const payload = {
      ...body,
      clientName: body.clientName || body.client,
      skillsRequired: body.skillsRequired || body.skills,
      status: body.status === 'Active' ? 'In Progress' : body.status,
    }
    return api.put<any>(`/requirements/${encodeURIComponent(id)}`, payload)
  },
  assignRequirement: (id: string, body: { recruiterIds?: string[]; leadId?: string }) =>
    api.post(`/requirements/${encodeURIComponent(id)}/assign`, body),
  revokeRequirement: (id: string, body: { reason: string }) =>
    api.post(`/requirements/${encodeURIComponent(id)}/revoke`, body),
  getOriginalEmail: (id: string) =>
    api.get<OriginalRequirementEmail>(`/requirements/${encodeURIComponent(id)}/original-email`),
  assignmentTimes: () =>
    api.get<{ items: { requirementId: string; assignedOn: string }[] }>('/requirements/assignment-times'),
  createSubmission: (body: Submission & Record<string, any>) => {
    const rawReq = String(body.reqCode || body.req || '').trim()
    const reqCode = rawReq.replace(/\s*\([^()]*\)\s*$/, '').trim() || rawReq
    const asObjectId = (v: unknown) =>
      v && /^[a-f\d]{24}$/i.test(String(v)) ? String(v) : undefined
    // Prefer Mongo _id; also accept requirementMongoId aliases from UI payloads.
    const requirementId =
      asObjectId(body.requirementId) ||
      asObjectId(body.requirementMongoId) ||
      asObjectId((body as any)._requirementId)
    return api.post('/submissions', {
      candidateId: asObjectId(body.candidateId) || asObjectId(body.candidateMongoId),
      requirementId,
      req: reqCode || undefined,
      candidate: body.candidate,
      email: body.email,
      phone: body.phone,
      experience: body.experience,
      client: body.client,
      recruiter: body.recruiter,
      match: body.match,
      stage: body.stage,
      leadId: asObjectId(body.leadId),
      clientEmails: body.clientEmails,
      leadEmail: body.leadEmail,
      leadEmails: body.leadEmails,
      candidateIds: body.candidateIds,
      ccEmails: body.ccEmails,
      emailSubject: body.emailSubject,
      trackerColumns: body.trackerColumns,
      trackerRows: body.trackerRows,
      trackerHeaderColor: body.trackerHeaderColor,
      emailGreeting: body.emailGreeting,
      emailIntroduction: body.emailIntroduction,
      recruiterName: body.recruiterName,
      recruiterEmail: body.recruiterEmail,
    })
  },
  saveInterviewFeedback: (id: string, status: string, notes: string) =>
    api.post(`/interviews/${encodeURIComponent(id)}/feedback`, {
      recommendation: status === 'Passed' || status === 'Confirmed' || status === 'Completed' ? 'Passed' : status === 'Rejected' || status === 'Cancelled' ? 'Rejected' : 'Hold',
      notes,
      feedbackNotes: notes,
    }),
  addActivityLog: (body: ActivityLogItem) => api.post('/audit/logs', body),
  syncRequirementsFromEmail: (limit = 25) =>
    api.post<{ status: string; message: string }>('/requirements/sync-emails', { limit }),
  getRequirementsSyncStatus: () =>
    api.get<{
      status: 'idle' | 'running' | 'completed' | 'failed'
      lastSyncedAt?: string
      totalProcessed: number
      totalSynced: number
      totalDeduped: number
      message: string
      error?: string | null
    }>('/requirements/sync-status'),
}

export const usersService = {
  list: (query = '') => api.get<any[]>(`/users${query}`),
  me: () => api.get('/users/me'),
  updateMe: (body: unknown) => api.put('/users/me', body),
  create: (body: unknown) => api.post('/users', body),
  update: (id: string, body: unknown) => api.put(`/users/${encodeURIComponent(id)}`, body),
  remove: (id: string) => api.delete(`/users/${encodeURIComponent(id)}`),
  restore: (id: string) => api.post(`/users/restore/${encodeURIComponent(id)}`),
  screenTime: (body: unknown) => api.post('/users/screen-time', body),
}

export const rolesService = {
  permissions: () => api.get<any>('/roles/permissions'),
  updatePermissions: (body: unknown) => api.put('/roles/permissions', body),
  remove: (roleCode: string) =>
    api.delete(`/roles/permissions/${encodeURIComponent(roleCode)}`),
}

export const clientsService = {
  list: () => api.get<any[]>('/clients'),
  create: (body: unknown) => api.post('/clients', body),
  update: (id: string, body: unknown) => api.put(`/clients/${id}`, body),
  remove: (id: string) => api.delete(`/clients/${id}`),
}

export const candidatesService = {
  /**
   * One page of candidates (server-side pagination).
   * Never walk page=1..N — that caused 429s and froze the candidate repository.
   */
  listPage: async (opts?: { page?: number; limit?: number; search?: string; createdBy?: string; signal?: AbortSignal }) => {
    const page = Math.max(1, Number(opts?.page || 1))
    const limit = Math.max(1, Math.min(100, Number(opts?.limit || 25)))
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    const search = String(opts?.search || '').trim()
    if (search) params.set('search', search)
    const createdBy = String(opts?.createdBy || '').trim()
    if (createdBy) params.set('createdBy', createdBy)
    const res = await api.get<any>(`/candidates?${params.toString()}`, { signal: opts?.signal })
    if (Array.isArray(res)) {
      return { items: res, total: res.length, page, limit, totalPages: 1 }
    }
    const items = Array.isArray(res?.items) ? res.items : []
    const total = Number(res?.total ?? items.length)
    return {
      items,
      total,
      page: Number(res?.page || page),
      limit: Number(res?.limit || limit),
      totalPages: Number(res?.totalPages || Math.max(1, Math.ceil(total / limit))),
    }
  },
  /** @deprecated Prefer listPage — full dump is too heavy after V1 import. */
  list: async () => {
    const first = await candidatesService.listPage({ page: 1, limit: 100 })
    return first.items
  },
  getById: (id: string) => api.get<any>(`/candidates/${encodeURIComponent(id)}`),
  /**
   * Resolve the candidate's stored resume (file id, document link, or filename match)
   * and start the browser download.
   */
  downloadResume: async (id: string) => {
    const signed = await api.get<{ url: string; expiresAt?: string; fileId?: string; resumeFileName?: string | null }>(
      `/candidates/${encodeURIComponent(id)}/resume`,
    )
    if (typeof window !== 'undefined' && signed?.url) {
      window.location.assign(signed.url)
    }
    return signed
  },
  /**
   * Daily sourced-profile counts for the chart window.
   * Omit recruiterId to count every recruiter in the organization.
   */
  sourcedTrend: async (opts?: {
    from?: string
    to?: string
    recruiterId?: string
    timezone?: string
    signal?: AbortSignal
  }) => {
    const params = new URLSearchParams()
    const from = String(opts?.from || '').trim()
    const to = String(opts?.to || '').trim()
    const recruiterId = String(opts?.recruiterId || '').trim()
    const timezone = String(opts?.timezone || '').trim()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (recruiterId) params.set('recruiterId', recruiterId)
    if (timezone) params.set('timezone', timezone)
    const res = await api.get<{ days?: { date: string; count: number }[] }>(
      `/candidates/sourced-trend?${params.toString()}`,
      { signal: opts?.signal },
    )
    return Array.isArray(res?.days) ? res.days : []
  },
  /** Active Candidate Repository counts keyed by sourcedByRecruiterId (user Mongo id). */
  sourcedCounts: async () => {
    const res = await api.get<{ counts?: Record<string, number>; total?: number } | Record<string, number>>(
      '/candidates/sourced-counts',
    )
    if (res && typeof res === 'object' && res.counts && typeof res.counts === 'object') {
      return { counts: res.counts as Record<string, number>, total: Number(res.total || 0) }
    }
    return { counts: (res as Record<string, number>) || {}, total: 0 }
  },
  /** Paged Candidate Repository rows for one sourcer (always server-filtered). */
  listSourcedBy: async (
    recruiterId: string,
    opts?: { page?: number; limit?: number; from?: string; to?: string; signal?: AbortSignal },
  ) => {
    const id = String(recruiterId || '').trim()
    const page = Math.max(1, Number(opts?.page || 1))
    const limit = Math.max(1, Math.min(100, Number(opts?.limit || 10)))
    if (!id) return { items: [] as any[], total: 0, page, limit, totalPages: 0 }
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    const from = String(opts?.from || '').trim()
    const to = String(opts?.to || '').trim()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const res = await api.get<any>(`/candidates/sourced-by/${encodeURIComponent(id)}?${params.toString()}`, {
      signal: opts?.signal,
    })
    const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []
    const total = Number(res?.total ?? items.length)
    return {
      items,
      total,
      page: Number(res?.page || page),
      limit: Number(res?.limit || limit),
      totalPages: Number(res?.totalPages || Math.max(1, Math.ceil(total / limit))),
    }
  },
  create: (body: unknown) => api.post('/candidates', body),
  update: (id: string, body: unknown) => api.put(`/candidates/${encodeURIComponent(id)}`, body),
  duplicateCheck: (body: unknown) =>
    api.post<{ isDuplicate: boolean; duplicateField?: string; candidate?: any }>('/candidates/duplicate-check', body),
}

export const teamsService = {
  list: () => api.get<any[]>('/teams'),
}

export const submissionsService = {
  list: (query = '', init?: ApiRequestInit) => api.get<any[]>(`/submissions${query}`, init),
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
    status?: string
    notes?: string
    candidateEmail?: string
    candidatePhone?: string
    sendEmail?: boolean
    sendWhatsApp?: boolean
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
  list: (query = '', init?: ApiRequestInit) => api.get<any>(`/notifications${query}`, init),
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
  trends: (params?: AnalyticsFilterQuery) => api.get<any>(`/analytics/trends${toQueryString(params)}`),
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

export function uploadedFileId(file: { id?: string; _id?: string } | null | undefined): string {
  const id = String(file?.id || file?._id || '').trim()
  if (!id) throw new Error('Resume upload did not return a file id')
  return id
}

export const filesService = {
  list: (query = '') => api.get<FilesListResponse>(`/files${query}`),
  getById: (id: string) => api.get<FileMetadata>(`/files/${encodeURIComponent(id)}`),
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<FileMetadata & { downloadUrl?: string; downloadExpiresAt?: string }>('/files', formData)
  },
  remove: (id: string) => api.delete<{ success: boolean; message: string }>(`/files/${encodeURIComponent(id)}`),
  /** Mint a short-lived HMAC download URL (preferred). */
  createSignedDownload: (id: string, expiresInSeconds = 300) =>
    api.post<{ url: string; expiresAt: string; token: string }>(
      `/files/${encodeURIComponent(id)}/signed-url`,
      { expiresInSeconds },
    ),
  /** @deprecated Prefer createSignedDownload — this path 302s to a signed URL. */
  downloadUrl: (id: string) => `/api/v1/files/${encodeURIComponent(id)}/download`,
  async download(id: string): Promise<void> {
    const signed = await filesService.createSignedDownload(id)
    if (typeof window !== 'undefined') {
      window.location.assign(signed.url)
    }
  },
}

export interface AISearchPayload {
  query?: string
  skills?: string[]
  minExperience?: number
  maxExperience?: number
  limit?: number
}

/** Candidate fields extracted from a resume by the integrated resume-parser module. */
export interface ParsedResume {
  candidateName: string | null
  email: string | null
  contactNumber: string | null
  linkedInUrl: string | null
  qualification: string | null
  skills: string | null
  technologies: string | null
  totalExperience: string | null
  relevantExperience: string | null
  currentCompany: string | null
  currentLocation: string | null
  sourceFile: string
  parser: string
}

export interface BulkParseResult {
  sourceFile: string
  status: 'done' | 'error'
  data?: ParsedResume
  error?: string
}

/** Max resumes per bulk request (the backend parses them one by one). */
export const RESUME_BULK_BATCH = 5

export const resumeParserService = {
  health: () => api.get<{ status: string; mode: string; aiParserAvailable?: boolean; aiSuspendedNotice?: string | null }>('/resume-parser/health'),
  parse: (file: File) => {
    const form = new FormData()
    form.append('resume', file)
    return api.upload<{ success: boolean; data: ParsedResume }>('/resume-parser/parse', form)
  },
  parseBulk: (files: File[]) => {
    const form = new FormData()
    files.slice(0, RESUME_BULK_BATCH).forEach((f) => form.append('resumes', f))
    return api.upload<{ success: boolean; results: BulkParseResult[]; notice?: string | null }>('/resume-parser/parse/bulk', form)
  },
}

export const aiService = {
  match: (body: { candidateId: string; requirementId: string }) => api.post<any>('/ai/match', body),
  search: (body: AISearchPayload) => api.post<any>('/ai/search', body),
  parseResume: (body: { resumeText?: string; fileId?: string }) => api.post<any>('/ai/parse-resume', body),
  enrich: (body: { candidateId: string; resumeText?: string }) => api.post<any>('/ai/enrich', body),
  matchScores: (query = '') => api.get<any>(`/ai/match-scores${query}`),
}

export interface UserAuditLogItem {
  id: string
  _id?: string
  userId: string
  userName: string
  userEmail: string
  role: string
  date: string
  firstLoginTime: string | null
  latestLogoutTime: string | null
  firstLoginFormattedIST: string | null
  latestLogoutFormattedIST: string | null
  status: 'Active' | 'Logged Out' | 'Session Expired'
  ipAddress?: string
  userAgent?: string
  loginCount?: number
  lastActiveAt?: string
  createdAt?: string
}

export interface UserAuditLogsResponse {
  success: boolean
  data: UserAuditLogItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const auditService = {
  getUserLogs: (params: {
    date?: string
    startDate?: string
    endDate?: string
    role?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  } = {}) => {
    const searchParams = new URLSearchParams()
    if (params.date) searchParams.set('date', params.date)
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    if (params.role && params.role !== 'All Roles') searchParams.set('role', params.role)
    if (params.status && params.status !== 'All Statuses') searchParams.set('status', params.status)
    if (params.search && params.search.trim()) searchParams.set('search', params.search.trim())
    if (params.page) searchParams.set('page', String(params.page))
    if (params.limit) searchParams.set('limit', String(params.limit))
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return api.get<UserAuditLogsResponse>(`/audit/user-logs${query}`)
  },
  downloadCsv: async (params: {
    date?: string
    startDate?: string
    endDate?: string
    role?: string
    status?: string
    search?: string
  } = {}) => {
    const searchParams = new URLSearchParams()
    if (params.date) searchParams.set('date', params.date)
    if (params.startDate) searchParams.set('startDate', params.startDate)
    if (params.endDate) searchParams.set('endDate', params.endDate)
    if (params.role && params.role !== 'All Roles') searchParams.set('role', params.role)
    if (params.status && params.status !== 'All Statuses') searchParams.set('status', params.status)
    if (params.search && params.search.trim()) searchParams.set('search', params.search.trim())
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''

    const blob = await api.getBlob(`/audit/export-csv${query}`)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${params.date || new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },
}
