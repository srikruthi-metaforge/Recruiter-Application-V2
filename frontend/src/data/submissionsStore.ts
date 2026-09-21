import { Submission } from '../types'
import { INITIAL_SUBMISSIONS } from './mockData'
import { DEFAULT_EXTRA_SUBMISSIONS } from './extraSubmissions.data'

const STORAGE_KEY = 'metaforge_candidate_submissions_v1'

export function getSubmissionsStore(): Submission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to parse submissionsStore from localStorage', e)
  }

  // Combine initial mock data
  const combined = [...INITIAL_SUBMISSIONS]
  for (const extra of DEFAULT_EXTRA_SUBMISSIONS) {
    if (!combined.some(s => s.id === extra.id)) {
      combined.push(extra)
    }
  }
  return combined
}

export function saveSubmissionsStore(submissions: Submission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
    window.dispatchEvent(new Event('submissions_updated'))
  } catch (e) {
    console.error('Failed to save submissionsStore to localStorage', e)
  }
}

export function addSubmissionToStore(sub: Submission): Submission[] {
  const current = getSubmissionsStore()
  // Check if ID exists, replace or prepend
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

/**
 * Normalizes phone strings for comparison (removes spaces, dashes, country code prefix).
 */
function normalizePhone(phone?: string | null): string {
  if (!phone) return ''
  let cleaned = phone.replace(/[^\d]/g, '')
  if (cleaned.length > 10) {
    cleaned = cleaned.slice(-10)
  }
  return cleaned
}

/**
 * Normalizes email strings for comparison (lowercase, trimmed).
 */
function normalizeEmail(email?: string | null): string {
  if (!email) return ''
  return email.trim().toLowerCase()
}

/**
 * Normalizes name strings for comparison.
 */
function normalizeName(name?: string | null): string {
  if (!name) return ''
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Checks if a candidate is already submitted for a specific requirement ID.
 * Returns { isDuplicate: true, existingSubmission, matchReason } if a match is found.
 */
export function checkDuplicateSubmission(
  reqId?: string | null,
  candidate?: DuplicateCheckCandidate | null
): DuplicateCheckResult {
  if (!reqId || !candidate) {
    return { isDuplicate: false }
  }

  const submissions = getSubmissionsStore()
  const normEmail = normalizeEmail(candidate.email)
  const normPhone = normalizePhone(candidate.phone)
  const normName = normalizeName(candidate.name)
  const candidateId = candidate.candidateId?.trim().toLowerCase()

  const targetReqId = reqId.trim().toLowerCase()

  for (const sub of submissions) {
    const subReqId = (sub.req || '').trim().toLowerCase()
    
    // Check exact or requirement code match
    const isReqMatch =
      subReqId === targetReqId ||
      (targetReqId === 'req-001' && subReqId.endsWith('001')) ||
      (subReqId === 'req-001' && targetReqId.endsWith('001')) ||
      (targetReqId === 'req-002' && subReqId.endsWith('002')) ||
      (subReqId === 'req-002' && targetReqId.endsWith('002')) ||
      (targetReqId === 'req-003' && subReqId.endsWith('003')) ||
      (subReqId === 'req-003' && targetReqId.endsWith('003')) ||
      (targetReqId === 'req-004' && subReqId.endsWith('004')) ||
      (subReqId === 'req-004' && targetReqId.endsWith('004')) ||
      (targetReqId === 'req-005' && subReqId.endsWith('005')) ||
      (subReqId === 'req-005' && targetReqId.endsWith('005')) ||
      (targetReqId === 'req-006' && subReqId.endsWith('006')) ||
      (subReqId === 'req-006' && targetReqId.endsWith('006'))

    if (!isReqMatch) continue

    // 1. Email Match
    if (normEmail && sub.email) {
      if (normalizeEmail(sub.email) === normEmail) {
        return {
          isDuplicate: true,
          existingSubmission: sub,
          matchReason: `Matching email address (${candidate.email})`,
        }
      }
    }

    // 2. Phone Match
    if (normPhone && normPhone.length >= 7 && sub.phone) {
      const subPhoneNorm = normalizePhone(sub.phone)
      if (subPhoneNorm && subPhoneNorm === normPhone) {
        return {
          isDuplicate: true,
          existingSubmission: sub,
          matchReason: `Matching phone number (${candidate.phone})`,
        }
      }
    }

    // 3. Name Match
    if (normName && sub.candidate) {
      const subNameNorm = normalizeName(sub.candidate)
      if (subNameNorm && (subNameNorm === normName || subNameNorm.includes(normName) || normName.includes(subNameNorm))) {
        if (normName.length > 3) {
          return {
            isDuplicate: true,
            existingSubmission: sub,
            matchReason: `Matching candidate name (${sub.candidate})`,
          }
        }
      }
    }

    // 4. Candidate ID Match
    if (candidateId && sub.id) {
      if (sub.id.toLowerCase() === candidateId) {
        return {
          isDuplicate: true,
          existingSubmission: sub,
          matchReason: `Matching Candidate ID (${sub.id})`,
        }
      }
    }
  }

  return { isDuplicate: false }
}
