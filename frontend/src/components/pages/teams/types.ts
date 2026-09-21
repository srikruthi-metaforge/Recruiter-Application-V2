export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  avatar: string
  requirementsCount: number
  submissionsCount: number
  primaryClient: string
}

export interface TeamLeadGroup {
  id: string
  leadName: string
  leadRole: string
  leadEmail: string
  leadAvatar: string
  primaryClient: string
  teamName: string
  leadRequirementsCount: number
  leadSubmissionsCount: number
  membersCount: number
  members: TeamMember[]
}
