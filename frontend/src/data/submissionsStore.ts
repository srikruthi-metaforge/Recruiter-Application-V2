import { Submission } from '../types'

let memory: Submission[] = []

export function getSubmissionsStore(): Submission[] {
  return memory
}

export function saveSubmissionsStore(submissions: Submission[]): void {
  memory = submissions
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('submissions_updated'))
  }
}

export function addSubmissionToStore(sub: Submission): Submission[] {
  const current = getSubmissionsStore()
  const existsIndex = current.findIndex(s => s.id === sub.id)
  let updated: Submission[]
  if (existsIndex >= 0) {
    updated = [...current]
    updated[existsIndex] = sub
  } else {
    updated = [sub, ...current]
  }
  saveSubmissionsStore(updated)
  return updated
}

export interface DuplicateCheckCandidate {
  email?: string | null
  phone?: string | null
  candidateId?: string | null
  name?: string | null
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingSubmission?: Submission
  matchReason?: string
}

function normalizePhone(phone?: string | null): string {
  if (!phone) return ''
  let cleaned = phone.replace(/[^\d]/g, '')
  if (cleaned.length > 10) cleaned = cleaned.slice(-10)
  return cleaned
}

function normalizeEmail(email?: string | null): string {
  if (!email) return ''
  return email.trim().toLowerCase()
}

function normalizeName(name?: string | null): string {
  if (!name) return ''
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function checkDuplicateSubmission(
  reqId?: string | null,
  candidate?: DuplicateCheckCandidate | null,
): DuplicateCheckResult {
  if (!reqId || !candidate) return { isDuplicate: false }

  const submissions = getSubmissionsStore()
  const normEmail = normalizeEmail(candidate.email)
  const normPhone = normalizePhone(candidate.phone)
  const normName = normalizeName(candidate.name)
  const candidateId = candidate.candidateId?.trim().toLowerCase()
  const targetReqId = reqId.trim().toLowerCase()

  for (const sub of submissions) {
    const subReqId = (sub.req || '').trim().toLowerCase()
    const isReqMatch = subReqId === targetReqId || subReqId.endsWith(targetReqId.slice(-3))
    if (!isReqMatch) continue

    if (normEmail && sub.email && normalizeEmail(sub.email) === normEmail) {
      return { isDuplicate: true, existingSubmission: sub, matchReason: `Matching email address (${candidate.email})` }
    }
    if (normPhone && normPhone.length >= 7 && sub.phone && normalizePhone(sub.phone) === normPhone) {
      return { isDuplicate: true, existingSubmission: sub, matchReason: `Matching phone number (${candidate.phone})` }
    }
    if (normName && sub.candidate) {
      const subNameNorm = normalizeName(sub.candidate)
      if (subNameNorm && (subNameNorm === normName) && normName.length > 3) {
        return { isDuplicate: true, existingSubmission: sub, matchReason: `Matching candidate name (${sub.candidate})` }
      }
    }
    if (candidateId && sub.id && sub.id.toLowerCase() === candidateId) {
      return { isDuplicate: true, existingSubmission: sub, matchReason: `Matching Candidate ID (${sub.id})` }
    }
  }
  return { isDuplicate: false }
}
