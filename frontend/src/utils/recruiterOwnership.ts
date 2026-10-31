/** Shared ownership matching for recruiter-scoped KPIs (id → email → name). */

export function normIdentity(value?: string | null): string {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function nameMatches(a?: string | null, b?: string | null): boolean {
  const left = normIdentity(a)
  const right = normIdentity(b)
  if (!left || !right) return false
  if (left === right) return true
  if (left.includes(right) || right.includes(left)) return true
  const leftTokens = left.split(/\s+/).filter(t => t.length >= 3)
  const rightTokens = right.split(/\s+/).filter(t => t.length >= 3)
  return leftTokens.some(t => rightTokens.includes(t))
}

export type OwnershipIdentity = {
  id?: string | null
  email?: string | null
  name?: string | null
}

export function ownsByRecruiter(
  owner: { id?: string | null; email?: string | null; name?: string | null },
  me: OwnershipIdentity,
): boolean {
  const myId = String(me.id || '').trim()
  const ownerId = String(owner.id || '').trim()
  if (myId && ownerId && myId === ownerId) return true

  const myEmail = normIdentity(me.email)
  const ownerEmail = normIdentity(owner.email)
  if (myEmail && ownerEmail && myEmail === ownerEmail) return true

  return nameMatches(owner.name, me.name)
}

/** Stages counted on My Work → Onboarding KPI (live submission stages). */
export function isOnboardingStage(stage?: string | null): boolean {
  const s = String(stage || '').toLowerCase().trim()
  if (!s) return false
  // Explicit pipeline outcomes — not "Submitted to Lead/Client" or interview scheduling alone.
  return (
    s.includes('offer') ||
    s.includes('placed') ||
    s.includes('onboard') ||
    s.includes('joined') ||
    /\bselected\b/.test(s)
  )
}

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
  if (myId && ids.some(id => id === myId)) return true

  const names = String(req.assignedRecruiterNames || req.owner || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)
  if (names.some(n => n === 'Unassigned')) return false
  return names.some(n => nameMatches(n, me.name))
}
