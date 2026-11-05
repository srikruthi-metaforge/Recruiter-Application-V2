/** Shared routing for clickable in-app notifications / analytics KPI deep-links. */

export type InterviewStatusToggle = 'upcoming' | 'completed' | 'rejections' | 'all' | 'onboarding'

export type NotificationNavTarget = {
  navKey: string
  reportsTab?: 'submissions' | 'interviews' | 'reports'
  openRequirementId?: string
  openCandidateId?: string
  openSubmissionId?: string
  openInterviewId?: string
  /** Interview Tracking pill (Workspace/Analytics KPI deep-link). */
  interviewStatusToggle?: InterviewStatusToggle
  /** Total Submissions status filter (e.g. Selected for Onboarding KPI). */
  submissionsStatus?: string
  /** Total Submissions recruiter name filter. */
  submissionsRecruiter?: string
  /** Candidate Repository: load only this recruiter's sourced profiles (listSourcedBy). */
  sourcedByUserId?: string
  /** ISO bounds for sourced-by createdAt (analytics period). Omit for all time. */
  sourcedFrom?: string
  sourcedTo?: string
  /** Requirements page: limit to this assignee and received-date window. */
  requirementsAssigneeIds?: string
  requirementsAssigneeName?: string
  requirementsFrom?: string
  requirementsTo?: string
  /** After KPI drill-down, destination pages can offer “Back to Reports & Analytics”. */
  returnToReportsAnalytics?: boolean
}

const RETURN_TO_REPORTS_KEY = 'return_to_reports_analytics'

/** Fired after a direct sidebar click so pages can drop drill-down back buttons. */
export const SIDEBAR_NAV_EVENT = 'sidebar_nav'

export function markSidebarNavigation(): void {
  clearReturnToReportsAnalytics()
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(SIDEBAR_NAV_EVENT))
}

export function markReturnToReportsAnalytics(): void {
  try {
    sessionStorage.setItem(RETURN_TO_REPORTS_KEY, '1')
  } catch {
    // ignore
  }
}

export function hasReturnToReportsAnalytics(): boolean {
  try {
    return sessionStorage.getItem(RETURN_TO_REPORTS_KEY) === '1'
  } catch {
    return false
  }
}

export function clearReturnToReportsAnalytics(): void {
  try {
    sessionStorage.removeItem(RETURN_TO_REPORTS_KEY)
  } catch {
    // ignore
  }
}

/** Navigate back to Reports → Reports & Analytics (Individual Performance). */
export function navigateBackToReportsAnalytics(): void {
  clearReturnToReportsAnalytics()
  dispatchNotificationNavigate({ navKey: 'Reports', reportsTab: 'reports' })
}

export type NotificationNavSource = {
  type?: string
  entityType?: string | null
  entityId?: string | null
}

export function resolveNotificationNavigation(n: NotificationNavSource): NotificationNavTarget {
  const type = String(n.type || '').toLowerCase()
  const entityType = String(n.entityType || '').toLowerCase()
  const entityId = n.entityId ? String(n.entityId) : ''

  if (
    type.includes('attendance') ||
    type.includes('missing_login') ||
    entityType === 'attendance' ||
    entityType === 'user'
  ) {
    return { navKey: 'Audit Logs' }
  }

  if (entityType === 'requirement' || type.includes('requirement')) {
    return {
      navKey: 'Requirements',
      openRequirementId: entityId || undefined,
    }
  }

  if (
    entityType === 'submission' ||
    type.includes('submission') ||
    type.includes('lead_approval')
  ) {
    return {
      navKey: 'Reports',
      reportsTab: 'submissions',
      openSubmissionId: entityId || undefined,
    }
  }

  if (entityType === 'interview' || type.includes('interview')) {
    return {
      navKey: 'Reports',
      reportsTab: 'interviews',
      openInterviewId: entityId || undefined,
    }
  }

  if (
    entityType === 'offer' ||
    type.includes('offer') ||
    type.includes('placed') ||
    type.includes('placement')
  ) {
    return { navKey: 'Reports', reportsTab: 'reports' }
  }

  if (entityType === 'candidate' || type.includes('candidate')) {
    return {
      navKey: 'Candidates',
      openCandidateId: entityId || undefined,
    }
  }

  return { navKey: 'Notifications' }
}

export function dispatchNotificationNavigate(target: NotificationNavTarget): void {
  if (typeof window === 'undefined') return
  try {
    if (target.openRequirementId) {
      sessionStorage.setItem('pending_open_requirement', target.openRequirementId)
    }
    if (target.openCandidateId) {
      sessionStorage.setItem('pending_open_candidate', target.openCandidateId)
    }
    if (target.openSubmissionId) {
      sessionStorage.setItem('pending_open_submission', target.openSubmissionId)
    }
    if (target.openInterviewId) {
      sessionStorage.setItem('pending_open_interview', target.openInterviewId)
    }
    if (target.reportsTab) {
      sessionStorage.setItem('pending_reports_tab', target.reportsTab)
    }
    if (target.interviewStatusToggle) {
      sessionStorage.setItem('pending_interview_status_toggle', target.interviewStatusToggle)
    }
    if (target.submissionsStatus) {
      sessionStorage.setItem('pending_submissions_status', target.submissionsStatus)
    }
    if (target.submissionsRecruiter) {
      sessionStorage.setItem('pending_submissions_recruiter', target.submissionsRecruiter)
    }
    if (target.sourcedByUserId) {
      sessionStorage.setItem('pending_repo_created_by', target.sourcedByUserId)
      sessionStorage.setItem('mrap_candidate_view_mode_v1', 'repository')
      sessionStorage.setItem('pending_open_candidate_repository', '1')
      if (target.sourcedFrom) sessionStorage.setItem('pending_repo_from', target.sourcedFrom)
      else sessionStorage.removeItem('pending_repo_from')
      if (target.sourcedTo) sessionStorage.setItem('pending_repo_to', target.sourcedTo)
      else sessionStorage.removeItem('pending_repo_to')
    }
    if (target.requirementsAssigneeIds || target.requirementsFrom || target.requirementsTo) {
      if (target.requirementsAssigneeIds) {
        sessionStorage.setItem('pending_requirements_assignee_ids', target.requirementsAssigneeIds)
      } else {
        sessionStorage.removeItem('pending_requirements_assignee_ids')
      }
      if (target.requirementsAssigneeName) {
        sessionStorage.setItem('pending_requirements_assignee_name', target.requirementsAssigneeName)
      } else {
        sessionStorage.removeItem('pending_requirements_assignee_name')
      }
      if (target.requirementsFrom) sessionStorage.setItem('pending_requirements_from', target.requirementsFrom)
      else sessionStorage.removeItem('pending_requirements_from')
      if (target.requirementsTo) sessionStorage.setItem('pending_requirements_to', target.requirementsTo)
      else sessionStorage.removeItem('pending_requirements_to')
    }
    if (target.returnToReportsAnalytics) {
      sessionStorage.setItem(RETURN_TO_REPORTS_KEY, '1')
    }
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent('notification_navigate', { detail: target }))
}
