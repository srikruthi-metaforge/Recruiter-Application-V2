/** Shared ownership matching for recruiter-scoped KPIs (id → email → name). */

/** Role / title noise that must never be used as identity tokens. */
const IDENTITY_STOPWORDS = new Set([
  'recruiter',
  'recruiters',
  'lead',
  'leads',
  'team',
  'admin',
  'user',
  'users',
  'super',
  'superadmin',
  'devteam',
  'client',
  'the',
  'and',
  'for',
  'of',
])

export function normIdentity(value?: string | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

/** Personal-name tokens only (drop role words like "Recruiter", "Lead"). */
export function identityTokens(value?: string | null): string[] {
  return normIdentity(value)
    .replace(/[._,|/\\-]+/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length >= 3 && !IDENTITY_STOPWORDS.has(t))
}

/**
 * Strict name equality for ownership.
 * - Exact full-string match, or
 * - Same personal tokens (role suffixes ignored), or
 * - One side's personal tokens are a non-empty subset of the other (e.g. "Nithya" vs "Nithya Maripelly")
 * Never matches solely on shared role words like "Recruiter".
 */
export function nameMatches(a?: string | null, b?: string | null): boolean {
  const left = normIdentity(a)
  const right = normIdentity(b)
  if (!left || !right) return false
  if (left === right) return true

  const leftTokens = identityTokens(left)
  const rightTokens = identityTokens(right)
  if (leftTokens.length === 0 || rightTokens.length === 0) return false

  // Same personal token set (order-independent)
  if (
    leftTokens.length === rightTokens.length &&
    leftTokens.every(t => rightTokens.includes(t))
  ) {
    return true
  }

  // Allow short vs full name only when the shorter side has ≥1 personal token
  // and every one of those tokens appears in the longer side.
  const [shorter, longer] =
    leftTokens.length <= rightTokens.length ? [leftTokens, rightTokens] : [rightTokens, leftTokens]
  if (shorter.length >= 1 && shorter.every(t => longer.includes(t))) {
    // Require at least one strong token (4+ chars) to avoid "sai" style collisions.
    return shorter.some(t => t.length >= 4)
  }

  return false
}

export type OwnershipIdentity = {
  id?: string | null
  email?: string | null
  name?: string | null
}

/**
 * Does `owner` belong to `me`?
 * When both sides have an id, id equality is authoritative (no fuzzy name fallback).
 * Email is next. Name is last-resort only when id is missing on either side.
 */
export function ownsByRecruiter(
  owner: { id?: string | null; email?: string | null; name?: string | null },
  me: OwnershipIdentity,
): boolean {
  const myId = String(me.id || '').trim()
  const ownerId = String(owner.id || '').trim()
  if (myId && ownerId) {
    return myId === ownerId
  }

  const myEmail = normIdentity(me.email)
  const ownerEmail = normIdentity(owner.email)
  if (myEmail && ownerEmail) {
    return myEmail === ownerEmail
  }

  // Fallback only when ids/emails cannot decide (legacy/incomplete rows).
  return nameMatches(owner.name, me.name)
}

/** Re-export canonical stage helper — single field: `submission.stage`. */
export { isOnboardingStage } from './submissionStatusFilter'

export function requirementAssignedToRecruiter(
  req: {
    assignmentStatus?: string
    owner?: string
    assignedRecruiterIds?: string[]
    assignedRecruiterNames?: string
  },
  me: OwnershipIdentity,
): boolean {
  if (req.assignmentStatus === 'Unassigned') return false
  const ids = Array.isArray(req.assignedRecruiterIds)
    ? req.assignedRecruiterIds.map(id => String(id))
    : []
  const myId = String(me.id || '').trim()
  if (myId && ids.length > 0) {
    return ids.some(id => id === myId)
  }

  const names = String(req.assignedRecruiterNames || req.owner || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)
  if (names.some(n => n === 'Unassigned')) return false
  return names.some(n => nameMatches(n, me.name))
}

/**
 * Can this user mutate a requirement (add candidates, edit JD, submit)?
 * Admins / leads / superadmin / devteam: always.
 * Recruiters: only when personally assigned (shared assignees each can work).
 * Everyone else can still view via the detail page (view-only UI).
 */
export function canWorkOnRequirement(
  req: {
    assignmentStatus?: string
    owner?: string
    assignedRecruiterIds?: string[]
    assignedRecruiterNames?: string
    assignedLeadId?: string
  } | null | undefined,
  me: OwnershipIdentity,
  role?: string | null,
): boolean {
  if (!req) return false
  const r = String(role || '').toLowerCase()
  if (
    r === 'superadmin' ||
    r === 'admin' ||
    r === 'devteam' ||
    r === 'lead' ||
    r === 'team lead' ||
    r === 'team_lead'
  ) {
    return true
  }
  if (r && r !== 'recruiter') return true
  return requirementAssignedToRecruiter(req, me)
}
