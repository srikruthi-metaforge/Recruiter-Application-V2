/** Shared routing for clickable in-app notifications. */

export type NotificationNavTarget = {
  navKey: string
  reportsTab?: 'submissions' | 'interviews' | 'reports'
  openRequirementId?: string
  openCandidateId?: string
  openSubmissionId?: string
  openInterviewId?: string
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
  } catch {
    // ignore storage errors
  }
  window.dispatchEvent(new CustomEvent('notification_navigate', { detail: target }))
}
