import type { Candidate, Interview, Recruiter, Requirement, Role, Submission } from '../../../types'

export type DatePreset = 'all' | 'today' | '7_days' | '30_days' | 'this_month' | 'custom'

export interface OfferLike {
  id?: string
  _id?: string
  submissionId?: string
  candidateId?: string
  candidateName?: string
  requirementId?: string
  offeredCtc?: number
  offeredCTC?: string
  joiningDate?: string
  status?: string
  declinedReason?: string
  notJoinedNote?: string
  notJoinedReason?: string
  createdAt?: string
}

export interface RecruiterIndividualAnalyticsProps {
  role?: Role
  requirements?: Requirement[]
  submissions?: Submission[]
  interviews?: Interview[]
  recruiters?: Recruiter[]
  candidates?: Candidate[]
  currentUserName?: string
  currentUserEmail?: string
  currentUserId?: string
  /** Switch Reports top tab without leaving the Reports page. */
  onNavigateReportsTab?: (tab: 'submissions' | 'interviews' | 'reports') => void
}

export interface RecruiterOption {
  id: string
  name: string
  email?: string
  lead?: string
  /** All known user ids (_id and id) so requirement assignment matches either. */
  ids?: string[]
}

export type InterviewBucket = 'L1' | 'L2' | 'Final' | 'Other'

export interface RequirementRow {
  id: string
  title: string
  client: string
  receivedDate: string
  assignmentStatus: 'Assigned' | 'Unassigned'
  assignedToSelected: boolean
  status: string
  submissionsByRecruiter: number
}

export interface SourcedRow {
  id: string
  name: string
  email?: string
  skills?: string
  status?: string
  createdLabel: string
}

export interface SubmittedRow {
  id: string
  candidate: string
  requirement: string
  client: string
  stage: string
  submittedOn: string
  rejectionReason: string
}

export interface NonSubmittedRow {
  id: string
  title: string
  client: string
  receivedDate: string
  remark: string
}

export interface InterviewRow {
  id: string
  candidate: string
  requirement: string
  client: string
  bucket: InterviewBucket
  roundLabel: string
  status: string
  outcome: 'Selected' | 'Rejected' | 'Pending'
  rejectionReason: string
  date: string
}

export interface OnboardingRow {
  id: string
  candidate: string
  requirement: string
  client: string
  offeredCtc: string
  joiningDate: string
  status: string
  notOnboardedReason: string
}

export interface PerformanceKpis {
  totalRequirementsInScope: number
  assignedToRecruiter: number
  unassignedInScope: number
  sourcedProfiles: number
  submittedProfiles: number
  nonSubmittedRequirements: number
  interviewTotal: number
  interviewL1: number
  interviewL2: number
  interviewFinal: number
  interviewSelected: number
  interviewRejected: number
  interviewPending: number
  offeredCount: number
  joinedCount: number
  notJoinedCount: number
}

export interface PerformanceReport {
  recruiter: RecruiterOption | null
  kpis: PerformanceKpis
  requirements: RequirementRow[]
  sourced: SourcedRow[]
  submitted: SubmittedRow[]
  nonSubmitted: NonSubmittedRow[]
  interviews: InterviewRow[]
  onboarding: OnboardingRow[]
  chartFunnel: { name: string; value: number }[]
  chartInterviews: { name: string; selected: number; rejected: number; pending: number }[]
  chartWeekly: { name: string; sourced: number; submitted: number }[]
}
