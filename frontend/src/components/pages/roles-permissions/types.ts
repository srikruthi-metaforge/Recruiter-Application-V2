export interface RecruiterUserPermissionData {
  id: string
  name: string
  email: string
  roleName: string
  roleCode: string
  team: string
  avatar: string
  status: 'Active' | 'Inactive'
  permissions: {
    addCandidates: boolean
    submitToClients: boolean
    scheduleInterviews: boolean
    exportReportsCsv: boolean
    viewTeamAnalytics: boolean
    deleteRecords: boolean
    reassignRequirements: boolean
  }
}

export interface PermissionGroup {
  module: string
  permissions: {
    key: string
    label: string
    enabled: boolean
  }[]
}

export interface EnterpriseRoleData {
  id: string
  name: string
  code: string
  description: string
  userCount: number
  isSystem: boolean
  lastUpdated: string
  permissions: Record<string, boolean>
}
