import { Interview, Role } from '../../../types'

export interface ScheduleRowItem {
  id: string
  candidateName: string
  position: string
  company: string
  round: string // 'L1' | 'Final'
  dateTime: string
  mode: string // 'Online' | 'In-Person'
  status: 'Upcoming' | 'Completed' | 'Scheduled'
  requirementId?: string
  teamLead?: string
  submittedBy?: string
}

export interface FinalDecisionRowItem {
  id: string
  candidateName: string
  requirementId: string
  requirement: string
  decision: 'Selected for Interview' | 'Rejected in Interview' | 'Pending'
  rejectionReason: string
  offerLetter: string
  client?: string
  teamLead?: string
  submittedBy?: string
}

export type RejectionStageType = 'Screening' | 'L1 Technical' | 'L2 Technical' | 'L3 / Manager' | 'Final HR Round'

export interface RejectedCandidateRowItem {
  id: string
  candidateName: string
  position: string
  company: string
  rejectedStage: RejectionStageType
  rejectionReason: string
  evaluatorNotes: string
  evaluatedBy: string
  submittedBy?: string
  teamLead?: string
  rejectionDate: string
  requirementId: string
  candidateId?: string
}

export interface OfferLetterRowItem {
  id: string
  candidateName: string
  position: string
  client: string
  requirementId: string
  offerDate: string
  offeredCTC: string
  joiningDate?: string
  status: 'Offer Released' | 'Accepted' | 'Joined' | 'Not Joined' | 'Declined'
  declineReason?: string
  notJoinedReason?: string
  notJoinedNote?: string
  notJoinedDate?: string
  submittedBy?: string
}

export type InterviewStatusToggle = 'upcoming' | 'completed' | 'rejections' | 'all' | 'onboarding'
export type InterviewScopeTab = 'my_interviews' | 'team_members' | 'all'
export type OfferOutcomeFilter = 'all' | 'joined' | 'not_joined' | 'pending'
export type CalendarStateFilter = 'all' | 'Upcoming' | 'Completed'

export interface InterviewTrackingPageProps {
  role?: Role
  interviews?: Interview[]
  onOpenFeedbackModal?: (iv: Interview) => void
}
