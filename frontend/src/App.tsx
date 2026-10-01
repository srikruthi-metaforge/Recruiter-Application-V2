'use client'

import React, { useEffect, useState } from 'react'
import { AuthScreen, Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem, Candidate, Lead, Admin } from './types'
import { brand } from './theme'
import { logoutRemote, restoreSession } from './data/authService'
import { clearSession, getSessionUser } from './store/session'
import { titleForRole } from './data/seedCredentials'
import { workspaceService } from './services/workspace.service'
import { saveSubmissionsStore } from './data/submissionsStore'

import { Sidebar } from './components/layout/Sidebar'
import { PageContainer } from './components/layout/PageContainer'

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

const emptyUser = { email: '', name: '', password: '', title: '' }

export default function App() {
  const [role, setRole] = useState<Role>('recruiter')
  const [screen, setScreen] = useState<AuthScreen>('landing')
  const [loginRole, setLoginRole] = useState<Role>('recruiter')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [activeNav, setActiveNav] = useState<string>('Dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [currentUser, setCurrentUser] = useState(emptyUser)

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

  const loadWorkspace = async () => {
    const payload = await workspaceService.load()
    setRequirements(payload.requirements || [])
    setSubmissions(payload.submissions || [])
    saveSubmissionsStore(payload.submissions || [])
    setInterviews(payload.interviews || [])
    setRecruiters(payload.recruiters || [])
    setLeads(payload.leads || [])
    setAdmins(payload.admins || [])
    setActivityLogs(payload.activityLogs || [])
    setCandidates(payload.candidates || [])
  }

  useEffect(() => {
    let cancelled = false
    restoreSession()
      .then(async user => {
        if (cancelled || !user) return
        const r = user.role as Role
        setRole(r)
        setCurrentUser({
          email: user.email,
          name: user.name,
          password: '',
          title: user.title || titleForRole(r),
        })
        setActiveNav((r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard')
        setScreen('app')
        try {
          await loadWorkspace()
        } catch {
          // Empty workspace until API recovers
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = () => {
    void logoutRemote()
    clearSession()
    setScreen('landing')
    setActiveNav('Requirements')
    setRequirements([])
    setSubmissions([])
    setInterviews([])
    setRecruiters([])
    setLeads([])
    setAdmins([])
    setActivityLogs([])
    setCandidates([])
    setCurrentUser(emptyUser)
  }

  const handleAuthenticated = (r: Role) => {
    setRole(r)
    const session = getSessionUser()
    setCurrentUser({
      email: session?.email || '',
      name: session?.name || '',
      password: '',
      title: session?.title || titleForRole(r),
    })
    const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
    setActiveNav(defaultNav)
    setScreen('app')
    void loadWorkspace().catch(() => undefined)
  }

  const handleNavSelect = (nav: string) => {
    if (nav === 'Candidates' || nav === 'Candidate Search') {
      setSelectedReqIdForSubmit(null)
    }
    setActiveNav(nav)
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
    saveSubmissionsStore([newSub, ...submissions])
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
      ipAddress: '127.0.0.1',
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
      ipAddress: '127.0.0.1',
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
        initialCandidates={candidates}
        onCandidatesChange={setCandidates}
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
