import { Submission } from '../types'

let memory: Submission[] = []

export function getSubmissionsStore(): Submission[] {
  return memory
}

export function saveSubmissionsStore(
  submissions: Submission[],
  opts?: { silent?: boolean },
): void {
  memory = submissions
  // Workspace loads must stay silent — otherwise applyWorkspace → saveStore →
  // submissions_updated → applyWorkspace loops and burns the API rate limit (429).
  if (!opts?.silent && typeof window !== 'undefined') {
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
  /** Prefer Mongo ObjectId. */
  candidateId?: string | null
  /** Optional business number (e.g. "17388"). */
  businessCandidateId?: string | null
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

function isMongoObjectId(value?: string | null): boolean {
  return !!value && /^[a-f\d]{24}$/i.test(String(value).trim())
}

/** Application req codes look like 2026-10-21-005 — never job titles. */
function looksLikeReqCode(value?: string | null): boolean {
  const v = String(value || '').trim()
  if (!v) return false
  if (isMongoObjectId(v)) return true
  return /^\d{4}-\d{2}-\d{2}-\d+/i.test(v.replace(/\s*\([^()]*\)\s*$/, '').trim())
}

function stripReqDisplay(id: string): string {
  return String(id || '')
    .trim()
    .replace(/\s*\([^()]*\)\s*$/, '')
    .trim()
    .toLowerCase()
}

function normalizeReqHints(reqRef?: string | string | null | Array<string | null | undefined>): string[] {
  const list = Array.isArray(reqRef) ? reqRef : [reqRef]
  const out = new Set<string>()
  for (const raw of list) {
    const v = String(raw || '').trim()
    if (!v) continue
    if (!looksLikeReqCode(v) && !isMongoObjectId(v)) continue // ignore titles / junk
    out.add(v.toLowerCase())
    out.add(stripReqDisplay(v))
  }
  return [...out].filter(Boolean)
}

/**
 * Same requirement only — by Mongo _id or reqCode.
 * Same candidate on a *different* requirement is allowed.
 */
function requirementIdsOverlap(
  reqRef: string | string | null | Array<string | null | undefined>,
  submission: Submission,
): boolean {
  const targets = normalizeReqHints(reqRef)
  if (!targets.length) return false

  const values = [
    submission.requirementId,
    (submission as any).reqCode,
    looksLikeReqCode(submission.req) ? submission.req : '',
  ]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .flatMap(value => [value.trim().toLowerCase(), stripReqDisplay(value)])

  return values.some(v => targets.includes(v))
}

function isUnreliableBusinessId(code?: string | null): boolean {
  const c = String(code || '').trim().toUpperCase()
  if (!c) return true
  if (c === 'CAND-10000' || c === 'CAND-00000' || c === 'CAND-0' || c === '10000') return true
  return false
}

export function submissionForDuplicateCheck(raw: any): Submission {
  const candidate = raw?.candidateId && typeof raw.candidateId === 'object' ? raw.candidateId : null
  const requirement = raw?.requirementId && typeof raw.requirementId === 'object' ? raw.requirementId : null
  const fromReqField = looksLikeReqCode(raw?.req) ? String(raw.req) : ''
  const reqCode = String(raw?.reqCode || requirement?.reqCode || fromReqField || '').trim()
  const mongoCandidateId = String(
    candidate?._id ||
      (typeof raw?.candidateId === 'string' && isMongoObjectId(raw.candidateId) ? raw.candidateId : '') ||
      raw?.candidateMongoId ||
      '',
  )
  const businessCandidateId = String(
    candidate?.candidateId ||
      raw?.businessCandidateId ||
      (typeof raw?.candidateId === 'string' && !isMongoObjectId(raw.candidateId) ? raw.candidateId : '') ||
      '',
  )
  return {
    id: String(raw?.submissionId || raw?.id || raw?._id || ''),
    candidate: String(raw?.candidateName || candidate?.name || raw?.candidate || ''),
    candidateId: mongoCandidateId || businessCandidateId,
    businessCandidateId,
    req: reqCode,
    reqCode,
    requirementId: String(requirement?._id || (typeof raw?.requirementId === 'string' ? raw.requirementId : '') || ''),
    client: String(raw?.clientName || raw?.client || ''),
    date: String(raw?.date || ''),
    stage: raw?.stage || 'Submitted',
    match: String(raw?.match || ''),
    recruiter: String(raw?.recruiterName || raw?.recruiter || ''),
    email: String(raw?.email || candidate?.email || ''),
    phone: String(raw?.phone || candidate?.phone || ''),
  } as Submission
}

/**
 * Duplicate = same candidate already on *this* requirement only.
 * Same person on other requirements is allowed.
 */
export function checkDuplicateSubmission(
  reqId?: string | string | null | Array<string | null | undefined>,
  candidate?: DuplicateCheckCandidate | null,
): DuplicateCheckResult {
  if (!reqId || !candidate) return { isDuplicate: false }
  if (!normalizeReqHints(reqId).length) return { isDuplicate: false }

  const submissions = getSubmissionsStore()
  const normEmail = normalizeEmail(candidate.email)
  const normPhone = normalizePhone(candidate.phone)
  const rawCandId = String(candidate.candidateId || '').trim()
  const businessId = String(candidate.businessCandidateId || (!isMongoObjectId(rawCandId) ? rawCandId : '') || '')
    .trim()
    .toLowerCase()
  const mongoId = isMongoObjectId(rawCandId) ? rawCandId.toLowerCase() : ''

  for (const sub of submissions) {
    if (!requirementIdsOverlap(reqId, sub)) continue

    const subMongo = isMongoObjectId(sub.candidateId)
      ? String(sub.candidateId).toLowerCase()
      : isMongoObjectId((sub as any).candidateMongoId)
        ? String((sub as any).candidateMongoId).toLowerCase()
        : ''
    const subBusiness = String(
      (sub as any).businessCandidateId || (!isMongoObjectId(sub.candidateId) ? sub.candidateId : '') || '',
    )
      .trim()
      .toLowerCase()

    if (mongoId && subMongo && mongoId === subMongo) {
      return { isDuplicate: true, existingSubmission: sub, matchReason: 'Matching candidate on this requirement' }
    }

    if (
      businessId &&
      subBusiness &&
      businessId === subBusiness &&
      !isUnreliableBusinessId(businessId) &&
      !isUnreliableBusinessId(subBusiness)
    ) {
      return { isDuplicate: true, existingSubmission: sub, matchReason: 'Matching candidate id on this requirement' }
    }

    if (normEmail && sub.email && normalizeEmail(sub.email) === normEmail) {
      return { isDuplicate: true, existingSubmission: sub, matchReason: `Matching email address (${candidate.email})` }
    }
    if (normPhone && normPhone.length >= 7 && sub.phone && normalizePhone(sub.phone) === normPhone) {
      return { isDuplicate: true, existingSubmission: sub, matchReason: `Matching phone number (${candidate.phone})` }
    }
  }
  return { isDuplicate: false }
}
