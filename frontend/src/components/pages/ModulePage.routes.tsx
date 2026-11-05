import React from 'react'
import { Requirement, Submission, Interview, Recruiter, Candidate, ActivityLogItem, Role } from '../../types'
import { upsertCandidate, UiCandidate } from '../../services/candidatePayload'
import { PAGE_META, getPageTitle } from '../../config/navigation'
import { Panel, QuickActions } from '../wireframe/WireframeKit'
import { PageHeader } from '../layout/PageHeader'
import {
  ActivityLogsPage,
  AddCandidatePage,
  AnalyticsDashboardPage,
  CandidateRepositoryPage,
  ClientsPage,
  MyProfilePage,
  MyTeamPage,
  NotificationsPage,
  ReportsPage,
  RequirementsPage,
  TeamsRecruitersPage,
  UserManagementPage,
} from './lazyPages'
import { navigateBackToReportsAnalytics } from '../../utils/notificationNavigation'

export interface ModulePageRouteProps {
  pageKey: string
  role: Role
  requirements: Requirement[]
  submissions: Submission[]
  interviews: Interview[]
  recruiters: Recruiter[]
  selectedReqId: string | null
  activityLogs: ActivityLogItem[]
  currentUserName?: string
  currentUserEmail?: string
  myCandidatesCount?: number
  candidatesList: Candidate[]
  candidateViewMode: 'add' | 'repository'
  onOpenSubmit?: (reqId?: string) => void
  onOpenFeedback?: (iv: Interview) => void
  onOpenCandidate?: (sub: Submission) => void
  onUpdateRequirements?: (requirements: Requirement[]) => void
  onAddRequirement?: (newReq: Requirement) => void | Promise<void>
  onSelectRequirement?: (reqId: string | null) => void
  onAddActivityLog?: (log: ActivityLogItem) => void
  onNavigateToDashboard?: () => void
  handleCandidateViewModeChange: (mode: 'add' | 'repository') => void
  setCandidatesList: React.Dispatch<React.SetStateAction<Candidate[]>>
  /** True when Add Candidate was opened from Repository (nested), not from sidebar */
  addOpenedFromRepository?: boolean
  /** True only after a reports drill-down, not a direct sidebar visit */
  returnToReports?: boolean
}

export function renderModulePage(props: ModulePageRouteProps) {
  const {
    pageKey,
    role,
    requirements,
    submissions,
    interviews,
    recruiters,
    selectedReqId,
    activityLogs,
    currentUserName,
    currentUserEmail,
    myCandidatesCount,
    candidatesList,
    candidateViewMode,
    onOpenSubmit,
    onOpenFeedback,
    onUpdateRequirements,
    onAddRequirement,
    onSelectRequirement,
    onAddActivityLog,
    onNavigateToDashboard,
    handleCandidateViewModeChange,
    setCandidatesList,
    addOpenedFromRepository = false,
    returnToReports = false,
  } = props

  if (pageKey === 'Notifications') {
    return <NotificationsPage role={role} />
  }

  if (pageKey === 'My Profile' || pageKey === 'Profile') {
    return <MyProfilePage role={role as any} />
  }

  if (pageKey === 'Analytics') {
    return (
      <AnalyticsDashboardPage
        role={role}
        onNavigateAway={onNavigateToDashboard}
      />
    )
  }

  if (pageKey === 'Reports' || pageKey === 'Reports & Analytics') {
    return (
      <ReportsPage
        role={role}
        initialReportsTab="submissions"
        requirements={requirements}
        submissions={submissions}
        interviews={interviews}
        recruiters={recruiters}
        candidates={candidatesList}
        currentUserName={currentUserName}
        currentUserEmail={currentUserEmail}
        myCandidatesCount={myCandidatesCount}
        onOpenSubmit={onOpenSubmit}
        onOpenFeedback={onOpenFeedback}
        onUpdateRequirements={onUpdateRequirements}
      />
    )
  }

  if (pageKey === 'Roles' || pageKey === 'Roles & Permissions') {
    return <UserManagementPage role={role} initialTab="role_definitions" />
  }

  if (pageKey === 'Clients' || pageKey === 'Client Management') {
    return <ClientsPage role={role} requirements={requirements} />
  }

  if (pageKey === 'Users' || pageKey === 'User Management') {
    return <UserManagementPage role={role} initialTab="users" />
  }

  if (pageKey === 'Recruiters' || pageKey === 'Teams' || pageKey === 'Teams & Recruiters') {
    return <TeamsRecruitersPage role={role} recruiters={recruiters} />
  }

  if (pageKey === 'Activity Logs' || pageKey === 'Audit Logs') {
    return <ActivityLogsPage role={role} logs={activityLogs} />
  }

  // Legacy History nav → Individual Performance Analytics (History UI removed).
  if (pageKey === 'History' || pageKey === 'Recruiter History' || pageKey === 'Performance History') {
    return (
      <ReportsPage
        role={role}
        initialReportsTab="reports"
        initialMainTab="individual_analytics"
        requirements={requirements}
        submissions={submissions}
        interviews={interviews}
        recruiters={recruiters}
        candidates={candidatesList}
        currentUserName={currentUserName}
        currentUserEmail={currentUserEmail}
        myCandidatesCount={myCandidatesCount}
        onOpenSubmit={onOpenSubmit}
        onOpenFeedback={onOpenFeedback}
        onUpdateRequirements={onUpdateRequirements}
      />
    )
  }

  if (pageKey === 'My Team') {
    return <MyTeamPage requirements={requirements} recruiters={recruiters} />
  }

  if (pageKey === 'Requirements') {
    return (
      <RequirementsPage
        role={role}
        requirements={requirements}
        submissions={submissions}
        interviews={interviews}
        recruiters={recruiters}
        initialStatusFilter="All"
        onOpenSubmit={onOpenSubmit}
        onUpdateRequirements={onUpdateRequirements}
        onAddRequirement={onAddRequirement}
        onAddActivityLog={onAddActivityLog}
      />
    )
  }

  if (pageKey === 'Candidates' || pageKey === 'Candidate Search') {
    if (candidateViewMode === 'repository') {
      return (
        <CandidateRepositoryPage
          candidates={candidatesList}
          requirements={requirements}
          selectedReqId={selectedReqId}
          role={role}
          onOpenAddForm={() => handleCandidateViewModeChange('add')}
          onCandidateUpdated={saved => {
            setCandidatesList(prev => upsertCandidate(prev as UiCandidate[], saved))
          }}
          onSelectRequirement={onSelectRequirement}
          backButtonLabel={returnToReports ? 'Back to Reports & Analytics' : undefined}
          onBackToDashboard={
            returnToReports
              ? navigateBackToReportsAnalytics
              : selectedReqId
                ? onNavigateToDashboard
                : undefined
          }
        />
      )
    }

    return (
      <AddCandidatePage
        requirements={requirements}
        selectedReqId={selectedReqId}
        showBack={addOpenedFromRepository}
        onOpenRepository={() => handleCandidateViewModeChange('repository')}
        onAddCandidate={saved => {
          setCandidatesList(prev => upsertCandidate(prev as UiCandidate[], saved as UiCandidate))
        }}
      />
    )
  }

  if (pageKey === 'Submissions' || pageKey === 'Submission to Client' || pageKey === 'Submissions to Client') {
    return (
      <ReportsPage
        role={role}
        initialReportsTab="submissions"
        requirements={requirements}
        submissions={submissions}
        interviews={interviews}
        recruiters={recruiters}
        candidates={candidatesList}
        currentUserName={currentUserName}
        currentUserEmail={currentUserEmail}
        myCandidatesCount={myCandidatesCount}
        onOpenSubmit={onOpenSubmit}
        onOpenFeedback={onOpenFeedback}
        onUpdateRequirements={onUpdateRequirements}
      />
    )
  }

  if (pageKey === 'Interviews' || pageKey === 'Interview Tracking') {
    return (
      <ReportsPage
        role={role}
        initialReportsTab="interviews"
        requirements={requirements}
        submissions={submissions}
        interviews={interviews}
        recruiters={recruiters}
        candidates={candidatesList}
        currentUserName={currentUserName}
        currentUserEmail={currentUserEmail}
        myCandidatesCount={myCandidatesCount}
        onOpenSubmit={onOpenSubmit}
        onOpenFeedback={onOpenFeedback}
        onUpdateRequirements={onUpdateRequirements}
      />
    )
  }

  const meta = PAGE_META[pageKey]

  if (!meta) {
    return (
      <div className="space-y-6 w-full pb-12 font-sans">
        <PageHeader title={getPageTitle(role, pageKey)} />
        <Panel title={pageKey}>
          <p className="text-sm text-slate-600">
            Module wireframe — content for {pageKey} will appear here.
          </p>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full pb-12 font-sans">
      <PageHeader title={meta.title} subtitle={meta.description} />
      {meta.actions && <QuickActions actions={meta.actions} />}
      <Panel title={meta.title}>
        <p className="text-sm text-slate-500">No data to show yet.</p>
      </Panel>
    </div>
  )
}
