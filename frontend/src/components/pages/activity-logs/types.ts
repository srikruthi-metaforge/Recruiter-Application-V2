import { Role, ActivityLogItem } from '../../../types'

export type { ActivityLogItem }

export interface RecruiterLoginRecord {
  id: string
  userName: string
  userEmail: string
  userRole: Role
  userAvatar: string
  firstEverLoginTimestamp: string
  logDate: string
  loginTime: string
  logoutTime: string
  sessionDuration: string
  activeScreenTime: string
  ipAddress: string
  deviceInfo: string
  status: 'Active Now' | 'Logged Out' | 'Timed Out'
  actionsLoggedCount: number
}

export interface ActivityLogsPageProps {
  role?: Role
  logs?: ActivityLogItem[]
}
