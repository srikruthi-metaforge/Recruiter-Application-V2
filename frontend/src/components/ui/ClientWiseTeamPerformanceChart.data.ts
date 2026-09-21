export interface ClientTeamPerformanceData {
  clientName: string
  engineeringPodSubs: number
  enterprisePodSubs: number
  cloudErpPodSubs: number
  totalRequirements: number
  interviewsScheduled: number
  hiresCount: number
  avgTatDays: number
  conversionRate: string
  activeRecruiters: number
}

export const CLIENT_TEAM_PERFORMANCE_LIST: ClientTeamPerformanceData[] = [
  {
    clientName: 'Accenture',
    engineeringPodSubs: 142,
    enterprisePodSubs: 38,
    cloudErpPodSubs: 24,
    totalRequirements: 45,
    interviewsScheduled: 36,
    hiresCount: 11,
    avgTatDays: 1.8,
    conversionRate: '22.9%',
    activeRecruiters: 6,
  },
  {
    clientName: 'Goldman Sachs',
    engineeringPodSubs: 28,
    enterprisePodSubs: 194,
    cloudErpPodSubs: 12,
    totalRequirements: 72,
    interviewsScheduled: 24,
    hiresCount: 12,
    avgTatDays: 2.1,
    conversionRate: '26.2%',
    activeRecruiters: 5,
  },
  {
    clientName: 'LTTS Automotive',
    engineeringPodSubs: 86,
    enterprisePodSubs: 14,
    cloudErpPodSubs: 18,
    totalRequirements: 32,
    interviewsScheduled: 18,
    hiresCount: 6,
    avgTatDays: 2.4,
    conversionRate: '20.5%',
    activeRecruiters: 4,
  },
  {
    clientName: 'JPMorgan Chase',
    engineeringPodSubs: 18,
    enterprisePodSubs: 112,
    cloudErpPodSubs: 16,
    totalRequirements: 38,
    interviewsScheduled: 22,
    hiresCount: 8,
    avgTatDays: 2.0,
    conversionRate: '24.8%',
    activeRecruiters: 4,
  },
  {
    clientName: 'Infosys',
    engineeringPodSubs: 64,
    enterprisePodSubs: 22,
    cloudErpPodSubs: 28,
    totalRequirements: 28,
    interviewsScheduled: 16,
    hiresCount: 5,
    avgTatDays: 1.9,
    conversionRate: '21.4%',
    activeRecruiters: 3,
  },
  {
    clientName: 'Morgan Stanley',
    engineeringPodSubs: 12,
    enterprisePodSubs: 42,
    cloudErpPodSubs: 110,
    totalRequirements: 38,
    interviewsScheduled: 18,
    hiresCount: 7,
    avgTatDays: 2.3,
    conversionRate: '24.1%',
    activeRecruiters: 3,
  },
  {
    clientName: 'HCL Technologies',
    engineeringPodSubs: 38,
    enterprisePodSubs: 16,
    cloudErpPodSubs: 22,
    totalRequirements: 18,
    interviewsScheduled: 12,
    hiresCount: 4,
    avgTatDays: 2.2,
    conversionRate: '19.8%',
    activeRecruiters: 3,
  },
  {
    clientName: 'Wipro',
    engineeringPodSubs: 24,
    enterprisePodSubs: 10,
    cloudErpPodSubs: 14,
    totalRequirements: 12,
    interviewsScheduled: 8,
    hiresCount: 2,
    avgTatDays: 2.5,
    conversionRate: '16.7%',
    activeRecruiters: 2,
  },
]
