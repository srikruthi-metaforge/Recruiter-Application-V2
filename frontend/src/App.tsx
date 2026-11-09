'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import { AuthScreen, Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem, Candidate, Lead, Admin } from './types'
import { brand } from './theme'
import { logoutRemote, restoreSession } from './data/authService'
import { clearSession, getSessionUser } from './store/session'
import { markSidebarNavigation } from './utils/notificationNavigation'
import { titleForRole } from './data/roleMeta'
import { workspaceService } from './services/workspace.service'
import { saveSubmissionsStore } from './data/submissionsStore'
import { fetchWorkspace, isWorkspaceFresh, patchWorkspace, prefetchCandidateFirstPage, prefetchNotifications, prefetchWorkspace, resetWorkspaceRefresh } from './lib/workspaceRefresh'
import { queryKeys } from './lib/queryKeys'
import { NotificationProvider } from './hooks/notificationContext'

import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { PageContainer } from './components/layout/PageContainer'
import { PageLoading } from './components/common/PageLoading'
import { navKeyFromPathname, resetBrowserPathToRoot, syncBrowserPath } from './config/navRoutes'

const screenLoading = () => <PageLoading label="Loading…" />

/** Company Analytics page is hidden for now. Open Reports instead. */
function withoutHiddenAnalytics(nav: string): string {
  return nav === 'Analytics' ? 'Reports' : nav
}

const RecruiterDashboard = dynamic(
  () => import('./components/dashboards/RecruiterDashboard').then(m => m.RecruiterDashboard),
  { loading: screenLoading },
)
const DevTeamDashboard = dynamic(
  () => import('./components/dashboards/DevTeamDashboard').then(m => m.DevTeamDashboard),
  { loading: screenLoading },
)
const ModulePage = dynamic(
  () => import('./components/pages/ModulePage').then(m => m.ModulePage),
  { loading: screenLoading },
)
const LandingPage = dynamic(
  () => import('./components/landing/LandingPage').then(m => m.LandingPage),
  { loading: screenLoading },
)
const SignInPage = dynamic(
  () => import('./components/auth/SignInPage').then(m => m.SignInPage),
  { loading: screenLoading },
)
const SignUpPage = dynamic(
  () => import('./components/auth/SignUpRequestPage').then(m => m.SignUpPage),
  { loading: screenLoading },
)
const PasswordRecoveryFlow = dynamic(
  () => import('./components/auth/PasswordRecoveryFlow').then(m => m.PasswordRecoveryFlow),
  { loading: screenLoading },
)
const NewRequirementModal = dynamic(
  () => import('./components/modals/NewRequirementModal').then(m => m.NewRequirementModal),
  { loading: () => null },
)
const SubmitCandidateModal = dynamic(
  () => import('./components/modals/SubmitCandidateModal').then(m => m.SubmitCandidateModal),
  { loading: () => null },
)
const InterviewFeedbackModal = dynamic(
  () => import('./components/modals/InterviewFeedbackModal').then(m => m.InterviewFeedbackModal),
  { loading: () => null },
)
const CandidateDetailModal = dynamic(
  () => import('./components/modals/CandidateDetailModal').then(m => m.CandidateDetailModal),
  { loading: () => null },
)

const emptyUser = { email: '', name: '', password: '', title: '' }
const noop = () => {}
const EMPTY_REQUIREMENTS: Requirement[] = []
const EMPTY_SUBMISSIONS: Submission[] = []
const EMPTY_INTERVIEWS: Interview[] = []
const EMPTY_RECRUITERS: Recruiter[] = []
const EMPTY_LEADS: Lead[] = []
const EMPTY_ADMINS: Admin[] = []
const EMPTY_LOGS: ActivityLogItem[] = []
const EMPTY_CANDIDATES: Candidate[] = []
const WORKSPACE_NAV = new Set(['Requirements', 'Dashboard', 'Reports'])
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

  const [currentUser, setCurrentUser] = useState(emptyUser)
  const sessionUserId = getSessionUser()?.id || ''
  const workspaceQuery = useQuery({
    queryKey: queryKeys.workspace(sessionUserId || 'signed-out'),
    enabled: false,
    queryFn: ({ signal }) => workspaceService.load({ signal }),
  })
  const workspace = sessionUserId ? workspaceQuery.data : undefined
  const requirements = workspace?.requirements ?? EMPTY_REQUIREMENTS
  const submissions = workspace?.submissions ?? EMPTY_SUBMISSIONS
  const interviews = workspace?.interviews ?? EMPTY_INTERVIEWS
  const recruiters = workspace?.recruiters ?? EMPTY_RECRUITERS
  const leads = workspace?.leads ?? EMPTY_LEADS
  const admins = workspace?.admins ?? EMPTY_ADMINS
  const activityLogs = workspace?.activityLogs ?? EMPTY_LOGS
  const candidates = workspace?.candidates ?? EMPTY_CANDIDATES
  const workspaceStats = {
    totalCandidates: workspace?.stats?.totalCandidates,
    myCandidatesCount: workspace?.stats?.myCandidatesCount,
  }

  const handleAddActivityLog = useCallback((newLog: ActivityLogItem) => {
    patchWorkspace(current => ({
      ...current,
      activityLogs: [newLog, ...(current.activityLogs || [])],
    }))
    void workspaceService.addActivityLog(newLog).catch(() => undefined)
  }, [])

  // Sync the shared cache only. Do NOT call PUT /requirements/bulk here —
  // assign/create/edit already hit dedicated APIs; bulk is lead/admin-only and 403s for recruiters.
  const persistRequirements = useCallback((next: Requirement[]) => {
    patchWorkspace(current => ({ ...current, requirements: next }))
  }, [])

  const [isNewReqOpen, setIsNewReqOpen] = useState(false)
  const [isSubmitCandidateOpen, setIsSubmitCandidateOpen] = useState(false)
  const [selectedReqIdForSubmit, setSelectedReqIdForSubmit] = useState<string | null>(null)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] = useState<Interview | null>(null)
  const [isCandidateDetailOpen, setIsCandidateDetailOpen] = useState(false)
  const [selectedSubmissionForDetail, setSelectedSubmissionForDetail] = useState<Submission | null>(null)
  // Single workspace GET. Navigation reuses a fresh copy; mutations pass force.
  const loadWorkspace = useCallback((opts?: { force?: boolean }) => {
    const id = getSessionUser()?.id
    if (!id) return Promise.resolve()
    return fetchWorkspace(id, opts).then(() => undefined)
  }, [])

  /** Requirements nav: only hit /workspace when the in-memory cache is stale. */
  const refreshWorkspaceIfStale = useCallback(() => {
    const id = getSessionUser()?.id
    if (!id) return
    if (isWorkspaceFresh(id)) return
    void loadWorkspace().catch(() => undefined)
  }, [loadWorkspace])

  useEffect(() => {
    const onRefresh = () => {
      void loadWorkspace({ force: true }).catch(() => undefined)
    }
    window.addEventListener('workspace_refresh', onRefresh)
    return () => window.removeEventListener('workspace_refresh', onRefresh)
  }, [loadWorkspace])

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
        const targetNav = withoutHiddenAnalytics(fromUrl || normalizedSaved || defaultNav)
        setActiveNav(targetNav)
        saveNav(targetNav)
        syncBrowserPath(targetNav, 'replace')
        setScreen('app')
        try {
          await loadWorkspace({ force: true })
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
      const rawKey = navKeyFromPathname(window.location.pathname)
      if (!rawKey) return
      const key = withoutHiddenAnalytics(rawKey)
      setActiveNav(key)
      saveNav(key)
      if (key !== rawKey) syncBrowserPath(key, 'replace')
      if (key === 'Requirements') {
        refreshWorkspaceIfStale()
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [refreshWorkspaceIfStale])

  const handleLogout = useCallback(() => {
    void logoutRemote()
    resetWorkspaceRefresh()
    clearSession()
    clearSavedNav()
    setScreen('landing')
    setActiveNav('Requirements')
    resetBrowserPathToRoot()
    setCurrentUser(emptyUser)
  }, [])

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
    const targetNav = withoutHiddenAnalytics(fromUrl || normalizedSaved || defaultNav)
    setActiveNav(targetNav)
    saveNav(targetNav)
    syncBrowserPath(targetNav, 'replace')
    setScreen('app')
    void loadWorkspace({ force: true }).catch(() => undefined)
  }

  const handleNavSelect = useCallback((nav: string) => {
    const next = withoutHiddenAnalytics(nav)
    if (next !== 'Candidates' && next !== 'Candidate Search') {
      setSelectedReqIdForSubmit(null)
    }
    setActiveNav(next)
    saveNav(next)
    syncBrowserPath(next, 'push')
    if (nav === 'Requirements') {
      refreshWorkspaceIfStale()
    }
  }, [refreshWorkspaceIfStale])

  const handleSidebarNav = useCallback((nav: string) => {
    setSelectedReqIdForSubmit(null)
    markSidebarNavigation()
    handleNavSelect(nav)
  }, [handleNavSelect])

  const handlePrefetchNav = useCallback((nav: string) => {
    const id = getSessionUser()?.id
    if (!id) return
    if (nav === 'Notifications') {
      void prefetchNotifications(id)
      return
    }
    if (nav === 'Candidates') {
      void prefetchCandidateFirstPage(id)
      return
    }
    if (WORKSPACE_NAV.has(nav)) void prefetchWorkspace(id)
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(collapsed => !collapsed)
  }, [])

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
    patchWorkspace(current => ({
      ...current,
      requirements: [enrichedReq, ...(current.requirements || [])],
    }))
    try {
      const created: any = await workspaceService.createRequirement(enrichedReq)
      if (created) {
        const persistedId = created.reqCode || created.displayId || created.id || enrichedReq.id
        patchWorkspace(current => ({
          ...current,
          requirements: (current.requirements || []).map(r =>
            r.id === enrichedReq.id
              ? { ...r, ...created, id: persistedId, reqCode: created.reqCode || persistedId, _id: created._id || (r as any)._id }
              : r,
          ),
        }))
      }
      // Refresh from workspace so list matches DB for every role in the org.
      await loadWorkspace({ force: true }).catch(() => undefined)
    } catch (err) {
      patchWorkspace(current => ({
        ...current,
        requirements: (current.requirements || []).filter(r => r.id !== enrichedReq.id),
      }))
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

      patchWorkspace(current => {
        const nextSubs = [saved, ...(current.submissions || []).filter(s => s.id !== enrichedSub.id && s.id !== saved.id)]
        saveSubmissionsStore(nextSubs)
        return {
          ...current,
          submissions: nextSubs,
          requirements: (current.requirements || []).map(r =>
            r.id === matched?.id || (r as any)._id === requirementId || (r as any).reqCode === reqCode
              ? { ...r, submissions: (r.submissions || 0) + (created?.alreadyExists ? 0 : 1) }
              : r,
          ),
          recruiters: (current.recruiters || []).map(rec =>
            rec.name === newSub.recruiter
              ? { ...rec, submissions: rec.submissions + 1, today: rec.today + 1 }
              : rec,
          ),
        }
      })
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
        await loadWorkspace({ force: true }).catch(() => undefined)
      }
    } catch (err: any) {
      if (!opts?.silent && typeof window !== 'undefined') {
        window.alert(err?.message || 'Failed to submit candidate to requirement. Please try again.')
      }
      throw err
    }
  }

  const handleSaveInterviewFeedback = (interviewId: string, status: InterviewStatus, notes: string) => {
    patchWorkspace(current => ({
      ...current,
      interviews: (current.interviews || []).map(iv => (iv.id === interviewId ? { ...iv, status, notes } : iv)),
    }))
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
              myCandidatesCount={workspaceStats.myCandidatesCount}
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
        myCandidatesCount={workspaceStats.myCandidatesCount}
        initialCandidates={candidates}
        onCandidatesChange={next => {
          patchWorkspace(current => ({ ...current, candidates: next }))
        }}
      />
    )
  }

  return (
    <NotificationProvider role={role}>
    <div className="flex h-dvh overflow-hidden font-body" style={{ background: brand.background }}>
      <Sidebar
        role={role}
        onLogout={handleLogout}
        activeNav={activeNav}
        onNavSelect={handleSidebarNav}
        onPrefetch={handlePrefetchNav}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div
        className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0"
        style={{ ['--app-sidebar-offset' as string]: isSidebarCollapsed ? '72px' : '260px' }}
      >
        <Topbar
          title={activeNav}
          role={role}
          searchValue=""
          onSearchChange={noop}
          onSignOut={handleLogout}
        />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full min-w-0 px-4 py-5 lg:px-6 xl:px-8 app-main-content">
          <PageContainer>{renderContent()}</PageContainer>
        </main>
      </div>

      {isNewReqOpen && (
        <NewRequirementModal isOpen onClose={() => setIsNewReqOpen(false)} onAdd={handleAddRequirement} />
      )}
      {isSubmitCandidateOpen && (
        <SubmitCandidateModal
          isOpen
          onClose={() => setIsSubmitCandidateOpen(false)}
          requirements={requirements}
          selectedReqId={selectedReqIdForSubmit}
          onSubmit={handleSubmitCandidate}
          currentRecruiterName={currentUser.name}
        />
      )}
      {isFeedbackModalOpen && selectedInterviewForFeedback && (
        <InterviewFeedbackModal
          isOpen
          onClose={() => setIsFeedbackModalOpen(false)}
          interview={selectedInterviewForFeedback}
          onSaveFeedback={handleSaveInterviewFeedback}
        />
      )}
      {isCandidateDetailOpen && selectedSubmissionForDetail && (
        <CandidateDetailModal
          isOpen
          onClose={() => setIsCandidateDetailOpen(false)}
          submission={selectedSubmissionForDetail}
        />
      )}

    </div>
    </NotificationProvider>
  )
}
