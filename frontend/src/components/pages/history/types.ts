import { Role } from '../../../types'

export interface SubmittedClientsPillCellProps {
  clients: string[]
  onSelectClient?: (clientName: string) => void
  activeClient?: string
}

export interface RecruiterHistoryItem {
  id: string
  recruiterName: string
  recruiterEmail: string
  recruiterAvatar: string
  roleTitle: string
  userRole: 'recruiter' | 'lead'
  teamLead: string
  clientAccounts: string[]
  assignedRequirementsCount: number
  sourcedProfilesCount: number // Candidate Repository history
  submittedProfilesCount: number // Total Submissions page count
  interviewsCount?: number // Total Interviews count
  workingProfilesCount: number // Active in progress / working candidates
  onHoldProfilesCount: number // On hold candidates
  placedCount: number // Offers accepted / joined
  topSkillsSourced: string[]
  recentSourcedCandidates: {
    id: string
    candidateName: string
    requirementName: string
    clientName: string
    sourcedDate: string
    status: 'Submitted' | 'Working' | 'On Hold' | 'Sourced'
    experience: string
    skills?: string[]
    contactEmail?: string
  }[]
  assignedRequirementsList: {
    id: string
    reqName: string
    clientName: string
    status: 'Open' | 'In Progress' | 'Closed'
    assignedDate: string
    submissionsCount: number
    sourcedCount?: number
    workingCount?: number
  }[]
}

export interface HistoryPageProps {
  role: Role
  currentUserName?: string
  currentUserEmail?: string
}
