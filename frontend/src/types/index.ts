export type Role = 'superadmin' | 'admin' | 'lead' | 'recruiter' | 'devteam' | 'client'

export type AuthScreen =
  | 'landing'
  | 'signin'
  | 'signup'
  | 'password-recovery'
  | 'role-select'
  | 'role-login'
  | 'forgot'
  | 'app'

export type Priority = 'High' | 'Medium' | 'Low'
export type ReqStatus = 'Active' | 'On Hold' | 'Closed'

export interface Requirement {
  id: string
  title: string
  client: string
  priority: Priority
  status: ReqStatus
  submissions: number
  interviews: number
  placed: number
  dueDate: string
  openings: number
  budget?: string
  assignedLead?: string
  skills?: string[]
  clientEmail?: string
  clientPhone?: string
  location?: string
  owner?: string
  emailArrivedTime?: string
  openDays?: number
  assignmentStatus?: 'Unassigned' | 'Assigned' | 'In Progress' | 'Closed'
  selections?: number
  rejections?: number
  revokeRequested?: boolean
  revokeReason?: string
  revokeRequestedBy?: string
  revokeRequestedAt?: string
  sla?: string
}

export interface ActivityLogItem {
  id: string
  timestamp: string
  userName: string
  userEmail: string
  userRole: Role
  userAvatar: string
  action: string
  category: 'Submissions' | 'Requirements' | 'User Management' | 'Client Management' | 'Interviews' | 'System & Access' | 'Candidate Sourcing'
  targetEntity: string
  targetId?: string
  clientName?: string
  ipAddress: string
  status: 'Success' | 'Warning' | 'Security Alert'
  details?: string
}

export interface Recruiter {
  id: string
  name: string
  lead: string
  admin: string
  submissions: number
  interviews: number
  placements: number
  target: number
  active: boolean
  today: number
  email?: string
  avatar?: string
  // Enhanced Recruiter Performance Analytics Fields
  requirementsCount: number
  l1Interviews: number
  l2Interviews: number
  customInterviews: number
  finalInterviews: number
  weeklyProgress: number
  weeklyTarget: number
  taskStatus: 'POSITIVE' | 'CRITICAL'
  submissionType: 'Direct Sourcing' | 'LinkedIn Recruiter' | 'Agency Portal' | 'Referral' | 'Internal DB'
  primaryClient: string
  tat?: string // Turn Around Time
}

export interface Lead {
  id: string
  name: string
  admin: string
  recruiters: number
  submissions: number
  interviews: number
  placements: number
  email?: string
  clientAccount?: string
  clientAccounts?: string[]
}

export interface Admin {
  id: string
  name: string
  leads: number
  recruiters: number
  requirements: number
  submissions: number
  interviews: number
  placements: number
  revenue: string
  email?: string
}

export type InterviewStage = 'Screening' | 'Technical Round 1' | 'Technical Round 2' | 'HR Round' | 'Manager Round' | 'Final Round'
export type InterviewStatus = 'Scheduled' | 'Confirmed' | 'Pending' | 'Passed' | 'Rejected'

export interface Interview {
  id: string
  candidate: string
  position: string
  client: string
  stage: InterviewStage
  date: string
  recruiter: string
  status: InterviewStatus
  notes?: string
}

export type SubmissionStage = 'Submitted' | 'Submitted to Client' | 'Submitted to Lead' | 'Client Review' | 'Interview Scheduled' | 'Offered' | 'Placed' | 'Rejected'

export interface Submission {
  id: string
  candidate: string
  req: string
  client: string
  date: string
  stage: SubmissionStage
  match: string
  recruiter: string
  resumeUrl?: string
  email?: string
  phone?: string
  experience?: string
}

export interface Candidate {
  id: string
  submissionDate?: string
  name: string
  company?: string
  phone?: string
  email?: string
  linkedIn?: string
  qualification?: string
  skills?: string
  technologies?: string
  totalExperience?: string
  relevantExperience?: string
  currentCtc?: string
  expectedCtc?: string
  noticePeriod?: string
  currentLocation?: string
  preferredLocation?: string
  interviewAvailability?: string
  offerInHand?: 'Select' | 'Yes' | 'No' | 'In Pipeline'
  reasonForChange?: string
  notes?: string
  resumeName?: string
  matchScore?: string
  status?: 'New' | 'Parsed' | 'Submitted' | 'In Review' | 'Placed'
}
