import { Role } from '../../../types'
import { RecruiterDetailData } from '../RecruiterDetailAnalyticsPage'
import { ClientPerformanceData } from '../ClientDetailAnalyticsPage'

export interface ClientSubmissionInfo {
  client: string
  submissions: number
}

export interface SubmittedClientsPillCellProps {
  clients: string[]
  onSelectClient?: (clientName: string) => void
  activeClient?: string
}

export interface RecruiterReqDashboardItem {
  id: string
  recruiterName: string
  recruiterRole?: string
  teamLead?: string
  reqId: string
  jobTitle: string
  positions: number
  clientName: string
  submissionsCount: number
  timestamp: string
  receivedTime: string
  firstSubmissionTime: string
  tat: string
  status: 'In Progress' | 'Target Achieved' | 'Active Sourcing' | 'Submissions Completed'
}

export interface ReportsPageProps {
  role?: Role
  initialMainTab?: 'performance' | 'history' | 'audit' | 'client_performance'
}

export interface ClientPerformanceTabContentProps {
  clientPerformanceList: ClientPerformanceData[]
  onSelectClient: (client: ClientPerformanceData) => void
}

export interface SubmissionsDashboardConfig {
  type?: 'recruiter_self' | 'lead_self' | 'team_members_only' | 'overall_company'
  title?: string
  subtitle?: string
  leadName?: string
}

export type ReportsMainTab = 'performance' | 'history' | 'audit' | 'client_performance'
export type { RecruiterDetailData, ClientPerformanceData }
