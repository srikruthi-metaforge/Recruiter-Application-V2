export interface TeamMemberData {
  id: string
  name: string
  role: string
  isLead?: boolean
  email: string
  avatar: string
  assignedClients: {
    clientName: string
    activeReqCount: number
    submissionsCount: number
    status: 'High Priority' | 'Active' | 'On Track'
  }[]
  totalActiveReqs: number
  totalSubmissions: number
  interviewsCount: number
  hiresCount: number
  avgTatDays: number
  status: 'Active' | 'On Leave'
}
