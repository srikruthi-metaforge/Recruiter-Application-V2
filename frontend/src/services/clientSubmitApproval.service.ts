import { api } from '../lib/api'

export interface ClientSubmitApprovalDto {
  id: string
  requirementId?: string | null
  reqId: string
  reqCode?: string
  reqTitle: string
  clientName: string
  recruiterId?: string | null
  recruiterName: string
  recruiterEmail: string
  candidateNames: string[]
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string | null
  reviewedById?: string | null
  reviewedAt?: string | null
  requestedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

function formatStamp(value?: string | null): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

/** Normalize API row into the shape used by Submit-to-Lead / Requirements UI. */
export function toForwardRequestShape(row: ClientSubmitApprovalDto) {
  return {
    id: row.id,
    reqId: row.reqId || row.reqCode || row.requirementId || '',
    reqTitle: row.reqTitle || '',
    clientName: row.clientName || '',
    recruiterName: row.recruiterName || '',
    recruiterEmail: row.recruiterEmail || '',
    candidateNames: Array.isArray(row.candidateNames) ? row.candidateNames : [],
    requestedAt: formatStamp(row.requestedAt) || formatStamp(row.createdAt) || '',
    status: row.status,
    toRecipients: [] as string[],
    ccRecipients: [] as string[],
    bccRecipients: [] as string[],
    reviewedBy: row.reviewedBy || undefined,
    reviewedAt: formatStamp(row.reviewedAt) || undefined,
  }
}

export const clientSubmitApprovalService = {
  list: (params?: { status?: string; requirementId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.requirementId) qs.set('requirementId', params.requirementId)
    const q = qs.toString()
    return api.get<ClientSubmitApprovalDto[]>(
      `/requirements/client-submit-approvals${q ? `?${q}` : ''}`,
    )
  },

  request: (requirementId: string, body?: { candidateNames?: string[] }) =>
    api.post<ClientSubmitApprovalDto>(
      `/requirements/${encodeURIComponent(requirementId)}/request-client-submit`,
      body || {},
    ),

  approve: (approvalId: string) =>
    api.post<ClientSubmitApprovalDto>(
      `/requirements/client-submit-approvals/${encodeURIComponent(approvalId)}/approve`,
    ),

  reject: (approvalId: string) =>
    api.post<ClientSubmitApprovalDto>(
      `/requirements/client-submit-approvals/${encodeURIComponent(approvalId)}/reject`,
    ),
}
