export interface RecruiterDetailData {
  id: string
  name: string
  role: string
  team: string
  avatar: string
  requirementsCount: number
  workedReqs: number
  nonWorkedReqs: number
  submissionsCount: number
  shortlistedCount: number
  noSubmissionsCount: number
  interviewsCount: number
  hiresCount: number
  conversionRate: string
  dailyTaskStatus: string
  weeklyProgress: string
  weeklyProgressPct: number
  status: 'On Track' | 'Warning' | 'Critical'
  requirementsList: {
    id: string
    title: string
    client: string
    status: 'Worked' | 'Non-Worked'
    submissions: number
    interviews: number
  }[]
}
