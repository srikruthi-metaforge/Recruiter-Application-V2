export interface RecruiterOverviewItem {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  teamLead: string
  clientNames: string[]
  totalRequirements: number
  totalSubmissions: number
  tatDays: number // e.g. 1.8 Days
  totalInterviews: number
  performanceStatus: 'Top Performer' | 'On Track' | 'Needs Attention'
}
