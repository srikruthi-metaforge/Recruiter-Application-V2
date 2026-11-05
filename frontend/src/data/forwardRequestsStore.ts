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

const STORAGE_KEY = 'mrap_client_submit_approvals_v1'
const EVENT = 'forward_requests_updated'

let forwardMemory: ForwardRequest[] | null = null

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readFromStorage(): ForwardRequest[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ForwardRequest[]) : []
  } catch {
    return []
  }
}

function writeToStorage(items: ForwardRequest[]) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / private mode
  }
}

function ensureLoaded(): ForwardRequest[] {
  if (!canUseStorage()) return forwardMemory ?? []
  if (forwardMemory === null) {
    forwardMemory = readFromStorage()
  }
  return forwardMemory
}

function commit(next: ForwardRequest[]) {
  forwardMemory = next
  writeToStorage(next)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT))
  }
}

function normalizeReqKey(reqId: string): string {
  return String(reqId || '')
    .replace(/\s*\([^()]*\)\s*$/, '')
    .trim()
    .toLowerCase()
}

function matchesReq(item: ForwardRequest, reqId: string): boolean {
  const a = normalizeReqKey(item.reqId)
  const b = normalizeReqKey(reqId)
  return Boolean(a && b && (a === b || a.includes(b) || b.includes(a)))
}

export function getForwardRequests(): ForwardRequest[] {
  return ensureLoaded()
}

export function getPendingForwardRequests(): ForwardRequest[] {
  return getForwardRequests().filter(r => r.status === 'pending')
}

export function getForwardRequestByReq(reqId: string): ForwardRequest | undefined {
  const key = normalizeReqKey(reqId)
  if (!key) return undefined
  const requests = getForwardRequests()
  return (
    requests.find(r => normalizeReqKey(r.reqId) === key) ||
    requests.find(r => matchesReq(r, reqId))
  )
}

export function createOrUpdateForwardRequest(
  reqId: string,
  reqTitle: string,
  clientName: string,
  recruiterName: string,
  recruiterEmail: string,
  candidateNames: string[] = [],
  toRecipients: string[] = [],
  ccRecipients: string[] = [],
  bccRecipients: string[] = [],
): ForwardRequest {
  const requests = getForwardRequests()
  const existing = requests.find(r => matchesReq(r, reqId))
  const stamp = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (existing) {
    if (existing.status === 'approved') {
      return existing
    }
    const updated: ForwardRequest = {
      ...existing,
      reqId: reqId || existing.reqId,
      reqTitle: reqTitle || existing.reqTitle,
      clientName: clientName || existing.clientName,
      status: 'pending',
      requestedAt: stamp,
      candidateNames: candidateNames.length > 0 ? candidateNames : existing.candidateNames,
      toRecipients: toRecipients.length ? toRecipients : existing.toRecipients,
      ccRecipients: ccRecipients.length ? ccRecipients : existing.ccRecipients,
      bccRecipients: bccRecipients.length ? bccRecipients : existing.bccRecipients,
      reviewedBy: undefined,
      reviewedAt: undefined,
    }
    commit(requests.map(r => (r.id === existing.id ? updated : r)))
    return updated
  }

  const newReq: ForwardRequest = {
    id: `FREQ-${Date.now().toString().slice(-6)}`,
    reqId,
    reqTitle,
    clientName,
    recruiterName,
    recruiterEmail,
    candidateNames,
    requestedAt: stamp,
    status: 'pending',
    toRecipients,
    ccRecipients,
    bccRecipients,
  }
  commit([newReq, ...requests])
  return newReq
}

export function approveForwardRequest(requestId: string, reviewerName = 'Team Lead'): ForwardRequest | null {
  const requests = getForwardRequests()
  let updatedReq: ForwardRequest | null = null
  const stamp = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const nextList = requests.map(r => {
    if (r.id === requestId || matchesReq(r, requestId)) {
      updatedReq = {
        ...r,
        status: 'approved',
        reviewedBy: reviewerName,
        reviewedAt: stamp,
      }
      return updatedReq
    }
    return r
  })

  if (updatedReq) commit(nextList)
  return updatedReq
}

export function rejectForwardRequest(requestId: string, reviewerName = 'Team Lead'): ForwardRequest | null {
  const requests = getForwardRequests()
  let updatedReq: ForwardRequest | null = null
  const stamp = new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const nextList = requests.map(r => {
    if (r.id === requestId || matchesReq(r, requestId)) {
      updatedReq = {
        ...r,
        status: 'rejected',
        reviewedBy: reviewerName,
        reviewedAt: stamp,
      }
      return updatedReq
    }
    return r
  })

  if (updatedReq) commit(nextList)
  return updatedReq
}
