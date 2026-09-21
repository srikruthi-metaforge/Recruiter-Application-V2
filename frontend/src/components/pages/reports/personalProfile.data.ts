import { RecruiterDetailData } from '../RecruiterDetailAnalyticsPage'
import { Role } from '../../../types'

export function getInitialPersonalProfile(role: Role): RecruiterDetailData {
  if (role === 'lead') {
    return {
        id: 'rec-lead-0',
        name: 'Harish Gadipally',
        role: 'Team Lead',
        team: 'Engineering Pod',
        avatar: 'H',
        requirementsCount: 45,
        workedReqs: 38,
        nonWorkedReqs: 7,
        submissionsCount: 142,
        shortlistedCount: 48,
        noSubmissionsCount: 12,
        interviewsCount: 36,
        hiresCount: 11,
        conversionRate: '22.9%',
        dailyTaskStatus: 'Done (5/5)',
        weeklyProgress: '22 / 25',
        weeklyProgressPct: 88,
        status: 'On Track',
        requirementsList: [
          { id: 'REQ-2026-08-12-001', title: 'TPC - Requirement - C# Automation - Embedded', client: 'LTTS / L&T', status: 'Worked', submissions: 14, interviews: 4, positions: 5 },
          { id: 'REQ-2026-08-12-003', title: 'Senior React / Fullstack Architect', client: 'Accenture Enterprise', status: 'Worked', submissions: 18, interviews: 5, positions: 4 },
          { id: 'REQ-701', title: 'Lead Java Full Stack Developer', client: 'Accenture', status: 'Worked', submissions: 42, interviews: 12, positions: 10 },
          { id: 'REQ-702', title: 'Senior React Native Mobile Dev', client: 'LTTS Automotive', status: 'Worked', submissions: 36, interviews: 10, positions: 8 },
          { id: 'REQ-703', title: 'Cloud Solutions Architect', client: 'Infosys', status: 'Worked', submissions: 28, interviews: 8, positions: 6 },
          { id: 'REQ-704', title: 'Cyber Security Analyst', client: 'HCL Technologies', status: 'Non-Worked', submissions: 0, interviews: 0, positions: 3, reasonNote: 'Low CTC budget approval from client' },
          { id: 'REQ-705', title: 'Lead Data Platform Architect', client: 'Tesla Mobility', status: 'Non-Worked', submissions: 0, interviews: 0, positions: 4, reasonNote: 'Priority shifted to urgent LTTS REQ' },
        ],
      }
    }
  return {
      id: 'rec-m1',
      name: 'Marcus Chen',
      role: 'Senior Technical Recruiter',
      team: 'Engineering Pod',
      avatar: 'M',
      requirementsCount: 14,
      workedReqs: 12,
      nonWorkedReqs: 2,
      submissionsCount: 48,
      shortlistedCount: 18,
      noSubmissionsCount: 3,
      interviewsCount: 12,
      hiresCount: 4,
      conversionRate: '25.0%',
      dailyTaskStatus: 'Done (5/5)',
      weeklyProgress: '20 / 25',
      weeklyProgressPct: 80,
      status: 'On Track',
      requirementsList: [
        { id: 'REQ-701', title: 'Lead Java Full Stack Developer', client: 'Accenture', status: 'Worked', submissions: 24, interviews: 8, positions: 8 },
        { id: 'REQ-702', title: 'Senior React Native Mobile Dev', client: 'Accenture', status: 'Worked', submissions: 24, interviews: 4, positions: 6 },
        { id: 'REQ-704', title: 'AI Data Engineer', client: 'Metaforge IT', status: 'Non-Worked', submissions: 0, interviews: 0, positions: 4, reasonNote: 'Awaiting client technical specification updates' },
      ],
    }
}
