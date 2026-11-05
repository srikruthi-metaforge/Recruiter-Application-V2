/**
 * Canonical interview outcome helpers — single field: `interview.status`.
 * Matches Interview Tracking / workspace mapper (Cancelled → Rejected).
 */

export type InterviewOutcome = 'Selected' | 'Rejected' | 'Pending'

export function normalizeInterviewStatus(status?: string | null): string {
  return String(status || '')
    .toLowerCase()
    .trim()
}

/** Workspace Rejections Track: Rejected or Cancelled. */
export function isInterviewRejectedStatus(status?: string | null): boolean {
  const s = normalizeInterviewStatus(status)
  return s === 'rejected' || s === 'cancelled' || s.includes('reject')
}

/** Passed / Selected (not merely Completed/Scheduled). */
export function isInterviewSelectedStatus(status?: string | null): boolean {
  const s = normalizeInterviewStatus(status)
  if (!s || isInterviewRejectedStatus(s)) return false
  return (
    s === 'passed' ||
    s === 'selected' ||
    s.includes('pass') ||
    (s.includes('select') && !s.includes('unselect'))
  )
}

export function interviewOutcomeFromStatus(status?: string | null): InterviewOutcome {
  if (isInterviewRejectedStatus(status)) return 'Rejected'
  if (isInterviewSelectedStatus(status)) return 'Selected'
  return 'Pending'
}
