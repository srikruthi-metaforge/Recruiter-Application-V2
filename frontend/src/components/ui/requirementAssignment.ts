import { Requirement, Submission, Interview } from '../../types'

/** Stable keys used to match a requirement to submissions / interviews. */
export function requirementMatchKeys(r: Requirement): string[] {
  return [r._id, r.reqCode, r.id]
    .filter(Boolean)
    .map(v => String(v).trim())
    .filter(Boolean)
}

export function isRequirementUnassigned(r: Requirement): boolean {
  const assigneeLabel = String(
    (r as any).assignedRecruiterNames || r.owner || '',
  ).trim()
  const hasRecruiterIds =
    Array.isArray(r.assignedRecruiterIds) && r.assignedRecruiterIds.length > 0
  const hasLead = Boolean(r.assignedLeadId || r.assignedLead)
  if (r.assignmentStatus === 'Unassigned') return true
  if (r.assignmentStatus === 'Assigned' || r.assignmentStatus === 'In Progress') {
    return false
  }
  return (
    (!assigneeLabel || assigneeLabel === 'Unassigned') &&
    !hasRecruiterIds &&
    !hasLead
  )
}

export function isRequirementAssigned(r: Requirement): boolean {
  return !isRequirementUnassigned(r) && r.status !== 'Closed' && r.assignmentStatus !== 'Closed'
}

/** Assigned requirements with active pipeline work (submissions / interviews / Active). */
export function isRequirementInProgress(r: Requirement): boolean {
  if (r.status === 'Closed' || r.assignmentStatus === 'Closed') return false
  if (r.status === 'Hold' || r.status === 'On Hold') return false
  if (isRequirementUnassigned(r)) return false
  if (r.assignmentStatus === 'In Progress' || r.status === 'Active') return true
  return (r.submissions || 0) > 0 || (r.interviews || 0) > 0
}

export function requirementHasSelections(r: Requirement): boolean {
  return (r.placed || r.selections || 0) > 0
}

function entityMatchesRequirement(
  entityReqId: string | undefined | null,
  r: Requirement,
): boolean {
  const key = String(entityReqId || '').trim()
  if (!key) return false
  const keys = requirementMatchKeys(r)
  if (keys.includes(key)) return true
  // Display ids sometimes include a client JD suffix — compare bare reqCode too
  return keys.some(k => key.includes(k) || k.includes(key))
}

export function requirementHasRejection(
  r: Requirement,
  interviews: Interview[] = [],
  submissions: Submission[] = [],
): boolean {
  if ((r.rejections || 0) > 0) return true
  const rejectedIv = interviews.some(iv => {
    const status = String(iv.status || '')
    if (status !== 'Rejected' && status !== 'Cancelled') return false
    return entityMatchesRequirement(
      (iv as any).requirementId || (iv as any).reqCode || (iv as any).req,
      r,
    )
  })
  if (rejectedIv) return true
  return submissions.some(s => {
    if (String(s.stage || '') !== 'Rejected') return false
    return entityMatchesRequirement(
      (s as any).requirementId || s.reqCode || s.req,
      r,
    )
  })
}

export function countRejectedEvents(
  interviews: Interview[] = [],
  submissions: Submission[] = [],
): number {
  const rejectedInterviews = interviews.filter(iv => {
    const status = String(iv.status || '')
    return status === 'Rejected' || status === 'Cancelled'
  }).length
  const rejectedSubs = submissions.filter(s => String(s.stage || '') === 'Rejected').length
  // Prefer interview rejections when present; otherwise fall back to rejected submissions
  return rejectedInterviews > 0 ? rejectedInterviews : rejectedSubs
}
