export interface ForwardRequest {
  id: string
  reqId: string
  reqTitle: string
  clientName: string
  recruiterName: string
  recruiterEmail: string
  candidateNames: string[]
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
  toRecipients: string[]
  ccRecipients: string[]
  bccRecipients: string[]
  reviewedBy?: string
  reviewedAt?: string
}

const STORAGE_KEY = 'metaforge_forward_requests_v1'

const INITIAL_FORWARD_REQUESTS: ForwardRequest[] = [
  {
    id: 'FREQ-101',
    reqId: 'REQ-2026-08-12-001',
    reqTitle: 'TPC - Requirement - C# Automation - Bangalore /Mysore - Embedded',
    clientName: 'LTTS / L&T',
    recruiterName: 'Harish Gadipally',
    recruiterEmail: 'harish.g@metaforgeit.com',
    candidateNames: ['Priyanka Sharma'],
    requestedAt: '10 mins ago',
    status: 'pending',
    toRecipients: [
      'Nikitha.S@Ltts.com',
      'Deepashree.Bc_ext@Ltts.com',
      'Bowya.Bowya_ext@Ltts.com',
    ],
    ccRecipients: [
      'Ashwini.Kudi@Ltts.com',
      'Kallol.Chakraborty@Ltts.com',
    ],
    bccRecipients: [],
  },
]

export function getForwardRequests(): ForwardRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FORWARD_REQUESTS))
      return INITIAL_FORWARD_REQUESTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_FORWARD_REQUESTS
  }
}

export function getForwardRequestByReq(reqId: string): ForwardRequest | undefined {
  const requests = getForwardRequests()
  return requests.find(r => r.reqId === reqId)
}

export function createOrUpdateForwardRequest(
  reqId: string,
  reqTitle: string,
  clientName: string,
  recruiterName: string,
  recruiterEmail: string,
  candidateNames: string[],
  toRecipients: string[] = ['Nikitha.S@Ltts.com', 'Deepashree.Bc_ext@Ltts.com', 'Bowya.Bowya_ext@Ltts.com'],
  ccRecipients: string[] = ['Ashwini.Kudi@Ltts.com', 'Kallol.Chakraborty@Ltts.com'],
  bccRecipients: string[] = []
): ForwardRequest {
  const requests = getForwardRequests()
  const existing = requests.find(r => r.reqId === reqId)

  if (existing) {
    if (existing.status === 'approved') {
      return existing
    }
    const updated = requests.map(r =>
      r.reqId === reqId
        ? {
            ...r,
            status: 'pending' as const,
            requestedAt: 'Just now',
            candidateNames: candidateNames.length > 0 ? candidateNames : r.candidateNames,
          }
        : r
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('forward_requests_updated'))
    return updated.find(r => r.reqId === reqId)!
  }

  const newReq: ForwardRequest = {
    id: `FREQ-${Date.now().toString().slice(-4)}`,
    reqId,
    reqTitle,
    clientName,
    recruiterName,
    recruiterEmail,
    candidateNames,
    requestedAt: 'Just now',
    status: 'pending',
    toRecipients,
    ccRecipients,
    bccRecipients,
  }

  const nextList = [newReq, ...requests]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList))
  window.dispatchEvent(new CustomEvent('forward_requests_updated'))
  return newReq
}

export function approveForwardRequest(requestId: string, reviewerName = 'Team Lead'): ForwardRequest | null {
  const requests = getForwardRequests()
  let updatedReq: ForwardRequest | null = null

  const nextList = requests.map(r => {
    if (r.id === requestId || r.reqId === requestId) {
      updatedReq = {
        ...r,
        status: 'approved' as const,
        reviewedBy: reviewerName,
        reviewedAt: 'Just now',
      }
      return updatedReq
    }
    return r
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList))
  window.dispatchEvent(new CustomEvent('forward_requests_updated'))
  return updatedReq
}

export function rejectForwardRequest(requestId: string, reviewerName = 'Team Lead'): ForwardRequest | null {
  const requests = getForwardRequests()
  let updatedReq: ForwardRequest | null = null

  const nextList = requests.map(r => {
    if (r.id === requestId || r.reqId === requestId) {
      updatedReq = {
        ...r,
        status: 'rejected' as const,
        reviewedBy: reviewerName,
        reviewedAt: 'Just now',
      }
      return updatedReq
    }
    return r
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList))
  window.dispatchEvent(new CustomEvent('forward_requests_updated'))
  return updatedReq
}
