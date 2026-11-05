'use client'

import dynamic from 'next/dynamic'
import { PageLoading } from '../common/PageLoading'

const loading = () => <PageLoading />

export const RequirementsPage = dynamic(
  () => import('./RequirementsPage').then(m => m.RequirementsPage),
  { loading },
)
export const AddCandidatePage = dynamic(
  () => import('./AddCandidatePage').then(m => m.AddCandidatePage),
  { loading },
)
export const CandidateRepositoryPage = dynamic(
  () => import('./CandidateRepositoryPage').then(m => m.CandidateRepositoryPage),
  { loading },
)
export const SubmissionsPage = dynamic(
  () => import('./SubmissionsPage').then(m => m.SubmissionsPage),
  { loading },
)
export const InterviewTrackingPage = dynamic(
  () => import('./InterviewTrackingPage').then(m => m.InterviewTrackingPage),
  { loading },
)
export const ReportsPage = dynamic(
  () => import('./ReportsPage').then(m => m.ReportsPage),
  { loading },
)
export const ClientsPage = dynamic(
  () => import('./ClientsPage').then(m => m.ClientsPage),
  { loading },
)
export const UserManagementPage = dynamic(
  () => import('./UserManagementPage').then(m => m.UserManagementPage),
  { loading },
)
export const ActivityLogsPage = dynamic(
  () => import('./ActivityLogsPage').then(m => m.ActivityLogsPage),
  { loading },
)
export const MyTeamPage = dynamic(
  () => import('./MyTeamPage').then(m => m.MyTeamPage),
  { loading },
)
export const TeamsRecruitersPage = dynamic(
  () => import('./TeamsRecruitersPage').then(m => m.TeamsRecruitersPage),
  { loading },
)
export const NotificationsPage = dynamic(
  () => import('./NotificationsPage').then(m => m.NotificationsPage),
  { loading },
)
export const AnalyticsDashboardPage = dynamic(
  () => import('./analytics/AnalyticsDashboardPage').then(m => m.AnalyticsDashboardPage),
  { loading },
)
export const MyProfilePage = dynamic(
  () => import('./MyProfilePage').then(m => m.MyProfilePage),
  { loading },
)
export const RequirementDetailOverview = dynamic(
  () => import('./RequirementDetailOverview').then(m => m.RequirementDetailOverview),
  { loading },
)
