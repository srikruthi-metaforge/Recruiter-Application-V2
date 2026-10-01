import { Interview } from '../../../types'
import {
  CalendarStateFilter,
  FinalDecisionRowItem,
  InterviewScopeTab,
  InterviewStatusToggle,
  OfferLetterRowItem,
  OfferOutcomeFilter,
  RejectedCandidateRowItem,
  RejectionStageType,
  ScheduleRowItem,
} from './types'

export function mapInterviewsToScheduleRows(interviews?: Interview[]): ScheduleRowItem[] {
  if (interviews && interviews.length > 0) {
    return interviews.map((iv, idx) => {
      const sStr = (iv.status as string) || ''
      const isUpcoming = sStr === 'Confirmed' || sStr === 'Scheduled' || sStr === 'In Progress' || sStr === 'Pending'
      const isCompleted = sStr === 'Passed' || sStr === 'Completed' || sStr === 'Rejected'

      const mappedStatus: 'Upcoming' | 'Completed' = isCompleted
        ? 'Completed'
        : 'Upcoming'

      return {
        id: iv.id || `prop-iv-${idx}`,
        candidateName: iv.candidate,
        position: iv.position,
        company: iv.client,
        round: iv.stage || 'L1',
        dateTime: iv.date || 'Aug 06, 10:00 AM',
        mode: 'Online',
        status: mappedStatus,
        requirementId: `REQ-2026-0${idx + 1}`,
      }
    })
  }
  return []
}

export function combineScheduleLists(scheduleList: ScheduleRowItem[], mapped: ScheduleRowItem[]): ScheduleRowItem[] {
  const existingIds = new Set(scheduleList.map(s => s.id))
  const extras = mapped.filter(m => !existingIds.has(m.id))
  return [...scheduleList, ...extras]
}

export function scopeByRole<T extends { submittedBy?: string }>(
  list: T[],
  isLead: boolean,
  isRecruiter: boolean,
  scopeTab: InterviewScopeTab,
): T[] {
  if (isLead) {
    return list.filter(s => {
      const by = (s.submittedBy || '').toLowerCase()
      const isLeadSub = by.includes('harish') || by.includes('lead')
      if (scopeTab === 'my_interviews') return isLeadSub
      if (scopeTab === 'team_members') return !isLeadSub
      return true
    })
  }
  if (isRecruiter) {
    return list.filter(s => {
      const by = (s.submittedBy || '').toLowerCase()
      return by.includes('marcus') || by.includes('recruiter') || by === ''
    })
  }
  return list
}

export function evaluateScheduleList(scopeScheduleList: ScheduleRowItem[]): ScheduleRowItem[] {
  return scopeScheduleList.map(row => {
    const roundLower = (row.round || '').toLowerCase()

    const isCompletedAllRounds =
      roundLower.includes('l3') ||
      roundLower.includes('final') ||
      roundLower.includes('offer released') ||
      roundLower.includes('completed all')

    if (isCompletedAllRounds || row.status === 'Completed') {
      return { ...row, status: 'Completed' as const }
    }

    return { ...row, status: 'Upcoming' as const }
  })
}

export function filterScheduleList(
  evaluatedScheduleList: ScheduleRowItem[],
  searchQuery: string,
  statusToggle: InterviewStatusToggle,
  clientFilter: string,
  roundFilter: string,
): ScheduleRowItem[] {
  return evaluatedScheduleList.filter(row => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = row.candidateName.toLowerCase().includes(q)
      const matchPos = row.position.toLowerCase().includes(q)
      const matchComp = row.company.toLowerCase().includes(q)
      const matchRound = row.round.toLowerCase().includes(q)
      if (!matchName && !matchPos && !matchComp && !matchRound) return false
    }

    if (clientFilter !== 'All Clients' && row.company !== clientFilter) {
      return false
    }

    if (roundFilter !== 'All Rounds' && !row.round.toLowerCase().includes(roundFilter.toLowerCase())) {
      return false
    }

    if (statusToggle === 'upcoming') {
      return (row.status as string) === 'Upcoming' || (row.status as string) === 'Scheduled'
    }
    if (statusToggle === 'completed') {
      return row.status === 'Completed'
    }
    return true
  })
}

export function filterOfferLetters(
  scopeOfferLetters: OfferLetterRowItem[],
  searchQuery: string,
  clientFilter: string,
  offerOutcomeFilter: OfferOutcomeFilter,
): OfferLetterRowItem[] {
  return scopeOfferLetters.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = item.candidateName.toLowerCase().includes(q)
      const matchPos = item.position.toLowerCase().includes(q)
      const matchComp = item.client.toLowerCase().includes(q)
      const matchNote = (item.notJoinedNote || '').toLowerCase().includes(q)
      const matchReason = (item.notJoinedReason || item.declineReason || '').toLowerCase().includes(q)
      if (!matchName && !matchPos && !matchComp && !matchNote && !matchReason) return false
    }

    if (clientFilter !== 'All Clients' && item.client !== clientFilter) {
      return false
    }

    if (offerOutcomeFilter === 'joined') {
      return item.status === 'Joined'
    }
    if (offerOutcomeFilter === 'not_joined') {
      return item.status === 'Not Joined' || item.status === 'Declined'
    }
    if (offerOutcomeFilter === 'pending') {
      return item.status === 'Offer Released' || item.status === 'Accepted'
    }

    return true
  })
}

export function filterRejectedList(
  scopeRejectedList: RejectedCandidateRowItem[],
  searchQuery: string,
  clientFilter: string,
  rejectionStageFilter: string,
): RejectedCandidateRowItem[] {
  return scopeRejectedList.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = item.candidateName.toLowerCase().includes(q)
      const matchPos = item.position.toLowerCase().includes(q)
      const matchComp = item.company.toLowerCase().includes(q)
      const matchStage = item.rejectedStage.toLowerCase().includes(q)
      const matchReason = item.rejectionReason.toLowerCase().includes(q)
      if (!matchName && !matchPos && !matchComp && !matchStage && !matchReason) return false
    }

    if (clientFilter !== 'All Clients' && item.company !== clientFilter) {
      return false
    }

    if (rejectionStageFilter !== 'All Stages' && item.rejectedStage !== rejectionStageFilter) {
      return false
    }

    return true
  })
}

export function getRoundBadgeStyle(round: string) {
  const r = round.toLowerCase()
  if (r.includes('l1') || r.includes('screening') || r.includes('l2') || r.includes('technical')) {
    return 'bg-purple-100 text-purple-800 border-purple-200'
  }
  return 'bg-slate-100 text-slate-800 border-slate-200'
}

export function getRejectionStageBadgeStyle(stage: RejectionStageType) {
  switch (stage) {
    case 'L1 Technical':
    case 'L2 Technical':
    case 'Final HR Round':
      return 'bg-purple-100 text-purple-900 border-purple-200 font-bold'
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200 font-bold'
  }
}

export function paginate<T>(list: T[], currentPage: number, pageSize: number): T[] {
  const start = (currentPage - 1) * pageSize
  return list.slice(start, start + pageSize)
}

export function filterCalendarDayInterviews(
  combinedScheduleList: ScheduleRowItem[],
  calendarStateFilter: CalendarStateFilter,
  day: number,
): ScheduleRowItem[] {
  const dayStr = day < 10 ? `0${day}` : `${day}`
  return combinedScheduleList.filter(s => {
    if (calendarStateFilter !== 'all' && s.status !== calendarStateFilter) return false
    return s.dateTime.includes(`Aug ${dayStr}`) || s.dateTime.includes(`2026-08-${dayStr}`) || (day === 17 && s.dateTime.includes('Today'))
  })
}

export type { FinalDecisionRowItem }
