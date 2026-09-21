import { Submission, Requirement, Role } from '../../../types'

export interface SubmissionsPageProps {
  role?: Role
  submissions?: Submission[]
  requirements?: Requirement[]
  onOpenSubmitCandidate?: (reqId?: string) => void
  onUpdateRequirements?: (updated: Requirement[]) => void
}

export interface ScreenshotSubmission {
  id: string
  candidateName: string
  requirement: string
  reqId?: string
  clientName?: string
  experience: string
  currentCompany: string
  submittedBy: string
  submittedOn: string
  status: string
  rejectionReason?: string
}
