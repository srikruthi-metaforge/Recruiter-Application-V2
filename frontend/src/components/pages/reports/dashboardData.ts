import { RecruiterReqDashboardItem } from './types'
import { RECRUITER_REQ_SUBMISSION_DASHBOARD_DATA_PART1 } from './dashboardData.part1'
import { RECRUITER_REQ_SUBMISSION_DASHBOARD_DATA_PART2 } from './dashboardData.part2'

export const RECRUITER_REQ_SUBMISSION_DASHBOARD_DATA: RecruiterReqDashboardItem[] = [
  ...RECRUITER_REQ_SUBMISSION_DASHBOARD_DATA_PART1,
  ...RECRUITER_REQ_SUBMISSION_DASHBOARD_DATA_PART2,
]
