/**
 * Shared submission-stage filter matching for Submissions / Lead Portal / dashboards.
 *
 * V1→V2 note: V1 status SELECTED was migrated as stage "Offered" (not "Selected" or "Placed").
 * Interview Handling "final" candidates are typically Offered and/or Placed — "Selected in Interview"
 * must include both, or the list splits across filters and looks undercounted.
 *
 * "Interview Scheduled" / went-for-interview: many V1 rows kept "Submitted to Client" after
 * scheduling, so match on linked interview records as well as stage text.
 */

export function normalizeStage(stage?: string | null): string {
  return String(stage || '')
    .toLowerCase()
    .trim()
}

/**
 * Canonical onboarding / final pipeline stages — single field: `submission.stage`.
 * Used by My Work → Onboarding KPI and Reports Individual Analytics.
 * (V1 SELECTED migrated as Offered; also Offered / Placed / Selected / Joined.)
 */
export function isOnboardingStage(stage?: string | null): boolean {
  const s = normalizeStage(stage)
  if (!s) return false
  return (
    s.includes('offer') ||
    s.includes('placed') ||
    s.includes('onboard') ||
    s.includes('joined') ||
    /\bselected\b/.test(s)
  )
}

/** Alias kept for submissions status filters (same canonical `submission.stage` rules). */
export function isFinalOrSelectedStage(stage?: string | null): boolean {
  return isOnboardingStage(stage)
}

export function isRejectedSubmissionStage(stage?: string | null): boolean {
  return normalizeStage(stage).includes('reject')
}

export function isOfferedStage(stage?: string | null): boolean {
  const s = normalizeStage(stage)
  return s.includes('offer')
}

export function isPlacedStage(stage?: string | null): boolean {
  const s = normalizeStage(stage)
  return (
    s.includes('placed') ||
    s.includes('joined') ||
    s === 'onboarded' ||
    s.includes('onboarding')
  )
}

/**
 * @param stage - submission.stage / row.status
 * @param filterVal - dropdown value (e.g. "Selected", "Placed", "Interview Scheduled")
 * @param opts.hasInterview - true if this submission has at least one interview record
 * @param opts.hasOffer - true if this submission has at least one offer letter
 */
export function matchesSubmissionStatusFilter(
  stage: string | null | undefined,
  filterVal: string | null | undefined,
  opts?: { hasInterview?: boolean; hasOffer?: boolean },
): boolean {
  const itemStatus = normalizeStage(stage)
  const filter = normalizeStage(filterVal)
  if (!filter || filter === 'all' || filter === 'all candidate statuses') return true

  if (filter === 'submitted') {
    return itemStatus === 'submitted'
  }
  if (filter === 'submitted to lead') {
    return itemStatus === 'submitted to lead' || (itemStatus.includes('submitted') && itemStatus.includes('lead'))
  }
  if (filter === 'submitted to client') {
    return (
      itemStatus === 'submitted to client' ||
      itemStatus === 'client review' ||
      (itemStatus.includes('submitted') && itemStatus.includes('client'))
    )
  }
  if (
    filter === 'interview scheduled' ||
    filter === 'went for interview' ||
    filter === 'selected to interview'
  ) {
    // Stage flag OR any linked interview (many V1 rows kept "Submitted to Client" after scheduling).
    if (itemStatus.includes('interview')) return true
    return Boolean(opts?.hasInterview)
  }
  if (
    filter === 'selected' ||
    filter === 'selected in interview' ||
    filter === 'selected / final'
  ) {
    // Interview Handling "final" = Offered and/or Placed (V1 SELECTED → Offered).
    if (isFinalOrSelectedStage(itemStatus)) return true
    return Boolean(opts?.hasOffer)
  }
  if (filter === 'offered') {
    if (isOfferedStage(itemStatus)) return true
    // Offer letter exists but stage not yet Placed.
    return Boolean(opts?.hasOffer) && !isPlacedStage(itemStatus)
  }
  if (filter === 'placed') {
    // Strict placement / join — do not treat Offered as Placed.
    return isPlacedStage(itemStatus)
  }
  if (filter === 'rejected') {
    return itemStatus.includes('reject')
  }

  return itemStatus === filter || itemStatus.includes(filter)
}

/** Dropdown options shared by submissions status filters (no layout — values only). */
export const SUBMISSION_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All Candidate Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Submitted to Lead', label: 'Submitted to Lead' },
  { value: 'Submitted to Client', label: 'Submitted to Client' },
  { value: 'Interview Scheduled', label: 'Went for Interview' },
  { value: 'Selected', label: 'Selected / Final' },
  { value: 'Offered', label: 'Offered' },
  { value: 'Placed', label: 'Placed / Joined' },
  { value: 'Rejected', label: 'Rejected' },
]
