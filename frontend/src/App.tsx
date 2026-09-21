'use client'

import React, { useEffect, useState } from 'react'
import { AuthScreen, Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem } from './types'
import {
  INITIAL_ADMINS,
  INITIAL_INTERVIEWS,
  INITIAL_LEADS,
  INITIAL_RECRUITERS,
  INITIAL_REQUIREMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ACTIVITY_LOGS,
  DEMO_ACCOUNTS,
} from './data/mockData'
import { brand } from './theme'
import { logoutRemote } from './data/authService'
import { clearSession } from './store/session'
import { workspaceService } from './services/workspace.service'

import { Sidebar } from './components/layout/Sidebar'
import { PageContainer } from './components/layout/PageContainer'

import { LeadDashboard } from './components/dashboards/LeadDashboard'
import { RecruiterDashboard } from './components/dashboards/RecruiterDashboard'
import { DevTeamDashboard } from './components/dashboards/DevTeamDashboard'
import { ModulePage } from './components/pages/ModulePage'

import { RoleSelectPage } from './components/auth/RoleSelectPage'
import { RoleLoginPage } from './components/auth/RoleLoginPage'
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage'
import { LandingPage } from './components/landing/LandingPage'
import { SignInPage } from './components/auth/SignInPage'
import { SignUpPage } from './components/auth/SignUpRequestPage'
import { PasswordRecoveryFlow } from './components/auth/PasswordRecoveryFlow'

import { NewRequirementModal } from './components/modals/NewRequirementModal'
import { SubmitCandidateModal } from './components/modals/SubmitCandidateModal'
import { InterviewFeedbackModal } from './components/modals/InterviewFeedbackModal'
import { CandidateDetailModal } from './components/modals/CandidateDetailModal'

export default function App() {
  const [role, setRole] = useState<Role>(() => {
    try {
      const savedRole = localStorage.getItem('metaforge_user_role') as Role
      return savedRole || 'recruiter'
    } catch {
      return 'recruiter'
    }
  })

  const [screen, setScreen] = useState<AuthScreen>(() => {
    try {
      const savedSession = localStorage.getItem('metaforge_session_active')
      return savedSession === 'true' ? 'app' : 'landing'
    } catch {
      return 'landing'
    }
  })

  const [loginRole, setLoginRole] = useState<Role>(role)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [activeNav, setActiveNav] = useState<string>(() => {
    try {
      const savedNav = localStorage.getItem('metaforge_active_nav')
      if (savedNav && savedNav !== 'Dashboard') return savedNav
      if (savedNav === 'Dashboard' && (role === 'lead' || role === 'superadmin' || role === 'admin' || role === 'devteam')) {
        return 'Requirements'
      }
      if (savedNav) return savedNav
    } catch {}
    return (role === 'superadmin' || role === 'devteam' || role === 'admin' || role === 'lead') ? 'Requirements' : 'Dashboard'
  })
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const [requirements, setRequirements] = useState<Requirement[]>(INITIAL_REQUIREMENTS)
  const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS)
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_INTERVIEWS)
  const [recruiters, setRecruiters] = useState<Recruiter[]>(INITIAL_RECRUITERS)
  const [leads] = useState(INITIAL_LEADS)
  const [admins] = useState(INITIAL_ADMINS)
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS)

  const handleAddActivityLog = (newLog: ActivityLogItem) => {
    setActivityLogs(prev => [newLog, ...prev])
    void workspaceService.addActivityLog(newLog).catch(() => undefined)
  }

  const persistRequirements = (next: Requirement[]) => {
    setRequirements(next)
    void workspaceService.updateRequirements(next).catch(() => undefined)
  }

  const [isNewReqOpen, setIsNewReqOpen] = useState(false)
  const [isSubmitCandidateOpen, setIsSubmitCandidateOpen] = useState(false)
  const [selectedReqIdForSubmit, setSelectedReqIdForSubmit] = useState<string | null>(null)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState<Interview | null>(null)
  const [isCandidateDetailOpen, setIsCandidateDetailOpen] = useState(false)
  const [selectedSubmissionForDetail, setSelectedSubmissionForDetail] = useState<Submission | null>(null)

  const currentUser = DEMO_ACCOUNTS[role]

  useEffect(() => {
    let cancelled = false
    workspaceService
      .load()
      .then(payload => {
        if (cancelled || !payload) return
        if (payload.requirements?.length) setRequirements(payload.requirements)
        if (payload.submissions?.length) setSubmissions(payload.submissions)
        if (payload.interviews?.length) setInterviews(payload.interviews)
        if (payload.recruiters?.length) setRecruiters(payload.recruiters)
        if (payload.activityLogs?.length) setActivityLogs(payload.activityLogs)
      })
      .catch(() => {
        // Keep existing mock seed so the current workflow still renders if API is down.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    void logoutRemote()
    clearSession()
    try {
      localStorage.removeItem('metaforge_session_active')
      localStorage.removeItem('metaforge_user_role')
      localStorage.removeItem('metaforge_active_nav')
      localStorage.removeItem('metaforge_reports_active_view')
      localStorage.removeItem('metaforge_candidate_view_mode')
    } catch (e) {
      // ignore
    }
    setScreen('landing')
    setActiveNav('Requirements')
  }

  /** Shared post-authentication handoff used by every sign-in surface. */
  const handleAuthenticated = (r: Role) => {
    setRole(r)
    const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
    try {
      localStorage.setItem('metaforge_session_active', 'true')
      localStorage.setItem('metaforge_user_role', r)
      localStorage.setItem('metaforge_active_nav', defaultNav)
    } catch (e) {
      // ignore
    }
    setActiveNav(defaultNav)
    setScreen('app')
  }

  const handleNavSelect = (nav: string) => {
    if (nav === 'Candidates' || nav === 'Candidate Search') {
      setSelectedReqIdForSubmit(null)
    }
    setActiveNav(nav)
    try {
      localStorage.setItem('metaforge_active_nav', nav)
    } catch (e) {}
  }

  const handleOpenSubmitCandidateFromDashboard = (reqId?: string) => {
    setSelectedReqIdForSubmit(reqId || null)
    if (role !== 'recruiter') {
      handleNavSelect('Candidates')
    }
  }

  const handleAddRequirement = (newReq: Requirement) => {
    setRequirements([newReq, ...requirements])
    void workspaceService.createRequirement(newReq).catch(() => undefined)
  }

  const handleSubmitCandidate = (newSub: Submission) => {
    setSubmissions([newSub, ...submissions])
    void workspaceService.createSubmission(newSub).catch(() => undefined)
    setRequirements(prev =>
      prev.map(r => (r.id === newSub.req ? { ...r, submissions: r.submissions + 1 } : r))
    )
    setRecruiters(prev =>
      prev.map(rec =>
        rec.name === newSub.recruiter
          ? { ...rec, submissions: rec.submissions + 1, today: rec.today + 1 }
          : rec
      )
    )
    handleAddActivityLog({
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      userName: newSub.recruiter || currentUser.name,
      userEmail: currentUser.email,
      userRole: role,
      userAvatar: (newSub.recruiter || currentUser.name).charAt(0).toUpperCase(),
      action: `Submitted candidate ${newSub.candidate} for ${newSub.req}`,
      category: 'Submissions',
      targetEntity: `Candidate ${newSub.candidate}`,
      targetId: newSub.id,
      clientName: newSub.client,
      ipAddress: '192.168.1.45',
      status: 'Success',
      details: `Submitted candidate profile to client ${newSub.client}`,
    })
  }

  const handleSaveInterviewFeedback = (interviewId: string, status: InterviewStatus, notes: string) => {
    setInterviews(prev => prev.map(iv => (iv.id === interviewId ? { ...iv, status, notes } : iv)))
    void workspaceService.saveInterviewFeedback(interviewId, status, notes).catch(() => undefined)
    const targetIv = interviews.find(i => i.id === interviewId)
    handleAddActivityLog({
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: role,
      userAvatar: currentUser.name.charAt(0).toUpperCase(),
      action: `Recorded interview feedback (${status}) for ${targetIv?.candidate || 'Candidate'}`,
      category: 'Interviews',
      targetEntity: `Interview ${interviewId}`,
      targetId: interviewId,
      clientName: targetIv?.client || 'Client',
      ipAddress: '192.168.1.45',
      status: 'Success',
      details: notes || `Interview status updated to ${status}`,
    })
  }

  const handleOpenSubmitForReq = (reqId?: string) => {
    setSelectedReqIdForSubmit(reqId || null)
    handleNavSelect('Candidates')
  }

  const handleOpenFeedbackForInterview = (iv: Interview) => {
    setSelectedInterviewForFeedback(iv)
    setIsFeedbackModalOpen(true)
  }

  const handleOpenCandidateDetail = (sub: Submission) => {
    setSelectedSubmissionForDetail(sub)
    setIsCandidateDetailOpen(true)
  }

  if (screen === 'landing') {
    return (
      <LandingPage
        onSignIn={() => setScreen('signin')}
        onRequestAccess={() => setScreen('signup')}
      />
    )
  }

  if (screen === 'signin') {
    return (
      <SignInPage
        onLogin={handleAuthenticated}
        onForgot={email => {
          setRecoveryEmail(email || '')
          setScreen('password-recovery')
        }}
        onSignup={() => setScreen('signup')}
        onBack={() => setScreen('landing')}
        onRolePortals={() => setScreen('role-select')}
      />
    )
  }

  if (screen === 'signup') {
    return <SignUpPage onBack={() => setScreen('signin')} onSubmitted={() => setScreen('signin')} />
  }

  if (screen === 'password-recovery') {
    return <PasswordRecoveryFlow initialEmail={recoveryEmail} onExit={() => setScreen('signin')} />
  }

  if (screen === 'role-select') {
    return (
      <RoleSelectPage
        onSelectRole={r => {
          setLoginRole(r)
          setScreen('role-login')
        }}
        onBack={() => setScreen('signin')}
      />
    )
  }

  if (screen === 'role-login') {
    return (
      <RoleLoginPage
        role={loginRole}
        onLogin={handleAuthenticated}
        onBack={() => setScreen('role-select')}
        onForgot={() => setScreen('forgot')}
      />
    )
  }

  if (screen === 'forgot') {
    return (
      <ForgotPasswordPage
        onBack={() => setScreen('role-login')}
        onSent={() => setScreen('role-login')}
      />
    )
  }

  const renderContent = () => {
    const effectiveNav = (role === 'superadmin' || role === 'devteam' || role === 'admin') && activeNav === 'Dashboard' ? 'Requirements' : activeNav

    if (effectiveNav === 'Dashboard') {
      switch (role) {
        case 'devteam':
          return (
            <DevTeamDashboard
              admins={admins}
              leads={leads}
              recruiters={recruiters}
              requirements={requirements}
              interviews={interviews}
              onUpdateRequirements={persistRequirements}
              onOpenSubmit={handleOpenSubmitForReq}
            />
          )
        case 'lead':
        case 'recruiter':
        default:
          return (
            <RecruiterDashboard
              submissions={submissions}
              interviews={interviews}
              requirements={requirements}
              activityLogs={activityLogs}
              currentUserName={currentUser.name}
              currentUserEmail={currentUser.email}
              onOpenSubmitCandidate={handleOpenSubmitCandidateFromDashboard}
              onOpenCandidateRepo={handleOpenSubmitCandidateFromDashboard}
              onOpenFeedbackModal={handleOpenFeedbackForInterview}
              onOpenCandidateDetail={handleOpenCandidateDetail}
              onAddActivityLog={handleAddActivityLog}
            />
          )
      }
    }

    return (
      <ModulePage
        pageKey={activeNav}
        role={role}
        requirements={requirements}
        submissions={submissions}
        interviews={interviews}
        recruiters={recruiters}
        selectedReqId={selectedReqIdForSubmit}
        onOpenSubmit={role !== 'client' ? handleOpenSubmitForReq : undefined}
        onOpenFeedback={handleOpenFeedbackForInterview}
        onOpenCandidate={handleOpenCandidateDetail}
        onUpdateRequirements={persistRequirements}
        onSelectRequirement={setSelectedReqIdForSubmit}
        activityLogs={activityLogs}
        onAddActivityLog={handleAddActivityLog}
        onNavigateToDashboard={() => setActiveNav('Dashboard')}
        currentUserName={currentUser.name}
        currentUserEmail={currentUser.email}
      />
    )
  }

  return (
    <div className="flex h-screen overflow-hidden font-body" style={{ background: brand.background }}>
      <Sidebar
        role={role}
        onLogout={handleLogout}
        activeNav={activeNav}
        onNavSelect={handleNavSelect}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto w-full min-w-0 px-4 py-5 lg:px-6 xl:px-8 app-main-content">
          <PageContainer>{renderContent()}</PageContainer>
        </main>
      </div>

      <NewRequirementModal isOpen={isNewReqOpen} onClose={() => setIsNewReqOpen(false)} onAdd={handleAddRequirement} />
      <SubmitCandidateModal
        isOpen={isSubmitCandidateOpen}
        onClose={() => setIsSubmitCandidateOpen(false)}
        requirements={requirements}
        selectedReqId={selectedReqIdForSubmit}
        onSubmit={handleSubmitCandidate}
        currentRecruiterName={currentUser.name}
      />
      <InterviewFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        interview={selectedInterviewForFeedback}
        onSaveFeedback={handleSaveInterviewFeedback}
      />
      <CandidateDetailModal
        isOpen={isCandidateDetailOpen}
        onClose={() => setIsCandidateDetailOpen(false)}
        submission={selectedSubmissionForDetail}
      />
    </div>
  )
}
