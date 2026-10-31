'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AuthScreen, Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem, Candidate, Lead, Admin } from './types'
import { brand } from './theme'
import { logoutRemote, restoreSession } from './data/authService'
import { clearSession, getSessionUser } from './store/session'
import { titleForRole } from './data/roleMeta'
import { workspaceService } from './services/workspace.service'
import { saveSubmissionsStore } from './data/submissionsStore'

import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { PageContainer } from './components/layout/PageContainer'

import { RecruiterDashboard } from './components/dashboards/RecruiterDashboard'
import { DevTeamDashboard } from './components/dashboards/DevTeamDashboard'
import { ModulePage } from './components/pages/ModulePage'

import { LandingPage } from './components/landing/LandingPage'
import { SignInPage } from './components/auth/SignInPage'
import { SignUpPage } from './components/auth/SignUpRequestPage'
import { PasswordRecoveryFlow } from './components/auth/PasswordRecoveryFlow'
import { DevRoleSwitcher } from './components/common/DevRoleSwitcher'

import { NewRequirementModal } from './components/modals/NewRequirementModal'
import { SubmitCandidateModal } from './components/modals/SubmitCandidateModal'
import { InterviewFeedbackModal } from './components/modals/InterviewFeedbackModal'
import { CandidateDetailModal } from './components/modals/CandidateDetailModal'
import { navKeyFromPathname, resetBrowserPathToRoot, syncBrowserPath } from './config/navRoutes'

const emptyUser = { email: '', name: '', password: '', title: '' }
const NAV_STORAGE_KEY = 'mrap_active_nav'

function getSavedNav(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(NAV_STORAGE_KEY)
    } catch {
      return null
    }
  }
  return null
}

function saveNav(nav: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(NAV_STORAGE_KEY, nav)
    } catch {
      // ignore
    }
  }
}

function clearSavedNav(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(NAV_STORAGE_KEY)
    } catch {
      // ignore
    }
  }
}

export default function App() {
  // Keep SSR and the first client render identical — never read localStorage here.
  const [role, setRole] = useState<Role>('recruiter')
  const [screen, setScreen] = useState<AuthScreen>('landing')
  const [bootstrapped, setBootstrapped] = useState(false)
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

  // Sync React state only. Do NOT call PUT /requirements/bulk here —
  // assign/create/edit already hit dedicated APIs; bulk is lead/admin-only and 403s for recruiters.
  const persistRequirements = (next: Requirement[]) => {
    setRequirements(next)
  }

  const [isNewReqOpen, setIsNewReqOpen] = useState(false)
  const [isSubmitCandidateOpen, setIsSubmitCandidateOpen] = useState(false)
  const [selectedReqIdForSubmit, setSelectedReqIdForSubmit] = useState<string | null>(null)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState<Interview | null>(null)
  const [isCandidateDetailOpen, setIsCandidateDetailOpen] = useState(false)
  const [selectedSubmissionForDetail, setSelectedSubmissionForDetail] = useState<Submission | null>(null)
  // Ignore stale workspace responses when login + restoreSession + nav refresh overlap.
  const workspaceLoadSeq = useRef(0)

  const loadWorkspace = async () => {
    const seq = ++workspaceLoadSeq.current
    const payload = await workspaceService.load()
    if (seq !== workspaceLoadSeq.current) return
    setRequirements(payload.requirements || [])
    setSubmissions(payload.submissions || [])
    saveSubmissionsStore(payload.submissions || [], { silent: true })
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
        if (cancelled) return
        if (!user) {
          setBootstrapped(true)
          return
        }
        const r = user.role as Role
        setRole(r)
        setCurrentUser({
          email: user.email,
          name: user.name,
          password: '',
          title: user.title || titleForRole(r),
        })
        const fromUrl = typeof window !== 'undefined' ? navKeyFromPathname(window.location.pathname) : null
        const saved = getSavedNav()
        const normalizedSaved = (saved === 'Submissions' || saved === 'Interviews' || saved === 'Submission to Client') ? 'Reports' : saved
        const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
        const targetNav = fromUrl || normalizedSaved || defaultNav
        setActiveNav(targetNav)
        saveNav(targetNav)
        syncBrowserPath(targetNav, 'replace')
        setScreen('app')
        try {
          await loadWorkspace()
        } catch {
          // Empty workspace until API recovers
        }
        if (!cancelled) setBootstrapped(true)
      })
      .catch(() => {
        if (!cancelled) setBootstrapped(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Browser back/forward → update active nav from the URL
  useEffect(() => {
    const onPopState = () => {
      const key = navKeyFromPathname(window.location.pathname)
      if (!key) return
      setActiveNav(key)
      saveNav(key)
      if (key === 'Requirements') {
        void loadWorkspace().catch(() => undefined)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleLogout = () => {
    void logoutRemote()
    clearSession()
    clearSavedNav()
    setScreen('landing')
    setActiveNav('Requirements')
    resetBrowserPathToRoot()
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
    const fromUrl = typeof window !== 'undefined' ? navKeyFromPathname(window.location.pathname) : null
    const saved = getSavedNav()
    const normalizedSaved = (saved === 'Submissions' || saved === 'Interviews' || saved === 'Submission to Client') ? 'Reports' : saved
    const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
    const targetNav = fromUrl || normalizedSaved || defaultNav
    setActiveNav(targetNav)
    saveNav(targetNav)
    syncBrowserPath(targetNav, 'replace')
    setScreen('app')
    void loadWorkspace().catch(() => undefined)
  }

  const handleNavSelect = (nav: string) => {
    if (nav !== 'Candidates' && nav !== 'Candidate Search') {
      setSelectedReqIdForSubmit(null)
    }
    setActiveNav(nav)
    saveNav(nav)
    syncBrowserPath(nav, 'push')
    if (nav === 'Requirements') {
      void loadWorkspace().catch(() => undefined)
    }
  }

  const handleNavSelectRef = useRef(handleNavSelect)
  handleNavSelectRef.current = handleNavSelect

  // Navigate when a notification (popover / page / toast) is clicked
  useEffect(() => {
    const onNotificationNavigate = (event: Event) => {
      const detail = (event as CustomEvent<{ navKey?: string }>).detail
      if (!detail?.navKey) return
      handleNavSelectRef.current(detail.navKey)
    }
    window.addEventListener('notification_navigate', onNotificationNavigate as EventListener)
    return () => window.removeEventListener('notification_navigate', onNotificationNavigate as EventListener)
  }, [])

  const handleOpenSubmitCandidateFromDashboard = (reqId?: string) => {
    setSelectedReqIdForSubmit(reqId || null)
    setIsSubmitCandidateOpen(true)
  }

  const handleAddRequirement = async (newReq: Requirement) => {
    const nowIso = new Date().toISOString()
    const enrichedReq: Requirement = {
      ...newReq,
      emailArrivedTime: newReq.emailArrivedTime || new Date().toLocaleString(),
      createdAt: (newReq as any).createdAt || nowIso,
      updatedAt: (newReq as any).updatedAt || nowIso,
    }
    // Optimistic insert, then replace with persisted row (real reqCode) so all users see it after reload.
    setRequirements(prev => [enrichedReq, ...prev])
    try {
      const created: any = await workspaceService.createRequirement(enrichedReq)
      if (created) {
        const persistedId = created.reqCode || created.displayId || created.id || enrichedReq.id
        setRequirements(prev =>
          prev.map(r =>
            r.id === enrichedReq.id
              ? { ...r, ...created, id: persistedId, reqCode: created.reqCode || persistedId, _id: created._id || (r as any)._id }
              : r,
          ),
        )
      }
      // Refresh from workspace so list matches DB for every role in the org.
      await loadWorkspace().catch(() => undefined)
    } catch (err) {
      setRequirements(prev => prev.filter(r => r.id !== enrichedReq.id))
      throw err
    }
  }

  const handleSubmitCandidate = async (newSub: Submission, opts?: { silent?: boolean }) => {
    const nowIso = new Date().toISOString()
    const hint = String((newSub as any).requirementId || (newSub as any).reqCode || newSub.req || '').trim()
    const matched = requirements.find(r => {
      const rid = String((r as any)._id || '')
      const code = String((r as any).reqCode || '')
      const display = String(r.id || '')
      return (
        (hint && (rid === hint || code === hint || display === hint)) ||
        display === newSub.req ||
        code === newSub.req ||
        rid === (newSub as any).requirementId
      )
    })
    const reqCode =
      String((newSub as any).reqCode || matched?.reqCode || '').trim() ||
      String(newSub.req || '').replace(/\s*\([^()]*\)\s*$/, '').trim()
    const requirementId =
      String((newSub as any).requirementId || (matched as any)?._id || '').trim() || undefined

    const enrichedSub: Submission = {
      ...newSub,
      date: newSub.date || 'Today',
      submittedAt: (newSub as any).submittedAt || nowIso,
      updatedAt: (newSub as any).updatedAt || nowIso,
      createdAt: (newSub as any).createdAt || nowIso,
      req: reqCode || newSub.req,
      ...(reqCode ? { reqCode } : {}),
      ...(requirementId ? { requirementId } : {}),
    } as Submission

    try {
      const created: any = await workspaceService.createSubmission(enrichedSub)
      const sessionId = getSessionUser()?.id
      const saved: Submission = {
        ...enrichedSub,
        ...(created || {}),
        id: created?.submissionId || created?.id || enrichedSub.id,
        _id: created?._id || (enrichedSub as any)._id,
        req: matched?.id || reqCode || enrichedSub.req,
        requirementId: created?.requirementId || requirementId,
        stage: created?.stage || enrichedSub.stage || 'Submitted',
        recruiter: created?.recruiter || enrichedSub.recruiter || currentUser.name,
        recruiterId:
          created?.recruiterId ||
          (enrichedSub as any).recruiterId ||
          sessionId ||
          undefined,
      } as Submission

      setSubmissions(prev => {
        const next = [saved, ...prev.filter(s => s.id !== enrichedSub.id && s.id !== saved.id)]
        saveSubmissionsStore(next)
        return next
      })
      setRequirements(prev =>
        prev.map(r =>
          r.id === matched?.id || (r as any)._id === requirementId || (r as any).reqCode === reqCode
            ? { ...r, submissions: (r.submissions || 0) + (created?.alreadyExists ? 0 : 1) }
            : r,
        ),
      )
      setRecruiters(prev =>
        prev.map(rec =>
          rec.name === newSub.recruiter
            ? { ...rec, submissions: rec.submissions + 1, today: rec.today + 1 }
            : rec,
        ),
      )
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissions_updated'))
      }
      handleAddActivityLog({
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        userName: newSub.recruiter || currentUser.name,
        userEmail: currentUser.email,
        userRole: role,
        userAvatar: (newSub.recruiter || currentUser.name).charAt(0).toUpperCase(),
        action: `Submitted candidate ${newSub.candidate} for ${reqCode || newSub.req}`,
        category: 'Submissions',
        targetEntity: `Candidate ${newSub.candidate}`,
        targetId: saved.id,
        clientName: newSub.client,
        ipAddress: '127.0.0.1',
        status: 'Success',
        details: created?.alreadyExists
          ? `Candidate already linked to requirement ${reqCode || newSub.req}`
          : `Submitted candidate to requirement ${reqCode || newSub.req}`,
      })
      if (!opts?.silent) {
        await loadWorkspace().catch(() => undefined)
      }
    } catch (err: any) {
      if (!opts?.silent && typeof window !== 'undefined') {
        window.alert(err?.message || 'Failed to submit candidate to requirement. Please try again.')
      }
      throw err
    }
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
    setIsSubmitCandidateOpen(true)
  }

  const handleOpenFeedbackForInterview = (iv: Interview) => {
    setSelectedInterviewForFeedback(iv)
    setIsFeedbackModalOpen(true)
  }

  const handleOpenCandidateDetail = (sub: Submission) => {
    setSelectedSubmissionForDetail(sub)
    setIsCandidateDetailOpen(true)
  }

  if (!bootstrapped) {
    return (
      <div
        className="flex h-screen items-center justify-center font-body"
        style={{ background: brand.background }}
        aria-busy="true"
      >
        <div className="text-sm text-slate-500">Loading workspace…</div>
      </div>
    )
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
      />
    )
  }

  if (screen === 'signup') {
    return <SignUpPage onBack={() => setScreen('signin')} onSubmitted={() => setScreen('signin')} onLogin={handleAuthenticated} />
  }

  if (screen === 'password-recovery') {
    return <PasswordRecoveryFlow initialEmail={recoveryEmail} onExit={() => setScreen('signin')} />
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
              candidates={candidates}
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
              onUpdateRequirements={persistRequirements}
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
        onAddRequirement={handleAddRequirement}
        onSelectRequirement={setSelectedReqIdForSubmit}
        activityLogs={activityLogs}
        onAddActivityLog={handleAddActivityLog}
        onNavigateToDashboard={() => {
          setActiveNav('Dashboard')
          saveNav('Dashboard')
          syncBrowserPath('Dashboard', 'push')
        }}
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
        <Topbar
          title={activeNav}
          role={role}
          searchValue=""
          onSearchChange={() => {}}
          onSignOut={handleLogout}
        />
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

      {/* Dev role switcher for quick in-app switching during development */}
      <DevRoleSwitcher
        currentRole={role}
        currentUserName={currentUser.name}
        onSwitchRole={handleAuthenticated}
      />
    </div>
  )
}
