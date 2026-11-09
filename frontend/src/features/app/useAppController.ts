'use client'

import { useEffect, useState } from 'react'
import { AuthScreen, Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem, Candidate, Lead, Admin } from '../../types'
import { workspaceService, type WorkspacePayload } from '../../services/workspace.service'
import { bindWorkspaceLoader, fetchWorkspace, resetWorkspaceRefresh } from '../../lib/workspaceRefresh'
import { restoreSession } from '../../data/authService'
import { getSessionUser } from '../../store/session'
import { titleForRole } from '../../data/roleMeta'
import { createSaveInterviewFeedbackHandler, createSubmitCandidateHandler } from './appHandlers'
import { createAuthenticatedHandler, createLogoutHandler, createNavSelectHandler } from './appSessionHandlers'
import { saveSubmissionsStore } from '../../data/submissionsStore'
import { navKeyFromPathname, resetBrowserPathToRoot, syncBrowserPath } from '../../config/navRoutes'

const emptyUser = { email: '', name: '', password: '', title: '' }

export function useAppController() {
  const [role, setRole] = useState<Role>('recruiter')
  const [screen, setScreen] = useState<AuthScreen>('landing')
  const [loginRole, setLoginRole] = useState<Role>('recruiter')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [activeNav, setActiveNav] = useState<string>('Dashboard')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [workspaceReady, setWorkspaceReady] = useState(false)
  const [workspaceError, setWorkspaceError] = useState<string | null>(null)

  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [workspaceStats, setWorkspaceStats] = useState<{
    totalCandidates?: number
    myCandidatesCount?: number
  }>({})
  const [currentUser, setCurrentUser] = useState(emptyUser)

  const handleAddActivityLog = (newLog: ActivityLogItem) => {
    setActivityLogs(prev => [newLog, ...prev])
    void workspaceService.addActivityLog(newLog).catch(() => undefined)
  }

  // Sync React state only — dedicated APIs handle persistence (assign/create/update).
  // Avoid PUT /requirements/bulk (403 for recruiters).
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

  const copyWorkspace = (payload: WorkspacePayload) => {
    setRequirements(payload.requirements || [])
    setSubmissions(payload.submissions || [])
    saveSubmissionsStore(payload.submissions || [], { silent: true })
    setInterviews(payload.interviews || [])
    setRecruiters(payload.recruiters || [])
    setLeads(payload.leads || [])
    setAdmins(payload.admins || [])
    setActivityLogs(payload.activityLogs || [])
    setCandidates(payload.candidates || [])
    setWorkspaceStats({
      totalCandidates: payload.stats?.totalCandidates,
      myCandidatesCount: payload.stats?.myCandidatesCount,
    })
  }

  const applyWorkspace = (opts?: { force?: boolean }) => {
    const id = getSessionUser()?.id
    if (!id) return Promise.resolve()
    return fetchWorkspace(id, opts).then(() => undefined)
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
        const fromUrl = typeof window !== 'undefined' ? navKeyFromPathname(window.location.pathname) : null
        const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
        const targetNav = fromUrl === 'Analytics' ? 'Reports' : (fromUrl || defaultNav)
        setActiveNav(targetNav)
        syncBrowserPath(targetNav, 'replace')
        setScreen('app')
        try {
          await applyWorkspace({ force: true })
          if (!cancelled) setWorkspaceReady(true)
        } catch {
          if (!cancelled) setWorkspaceError('Workspace API unavailable')
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onPopState = () => {
      const key = navKeyFromPathname(window.location.pathname)
      if (!key) return
      setActiveNav(key)
      // Company Analytics page is hidden for now.
      if (key === 'Analytics') {
        setActiveNav('Reports')
        syncBrowserPath('Reports', 'replace')
        return
      }
      // Only refresh workspace for dashboard/requirements — Reports reuses in-memory data
      // (full reload on every Candidates→Reports switch was causing heavy re-fetch storms).
      if (key === 'Requirements' || key === 'Dashboard') {
        void applyWorkspace().catch(() => undefined)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // submissions_updated must not reload /workspace — that loop burned the API rate limit.
  useEffect(() => {
    const refresh = () => {
      void applyWorkspace({ force: true }).catch(() => undefined)
    }
    window.addEventListener('workspace_refresh', refresh)
    const unbind = bindWorkspaceLoader(copyWorkspace)
    return () => {
      window.removeEventListener('workspace_refresh', refresh)
      unbind()
    }
  }, [])

  const handleLogout = () => {
    resetWorkspaceRefresh()
    createLogoutHandler(setScreen, setActiveNav)()
    resetBrowserPathToRoot()
  }

  const handleAuthenticated = (r: Role) => {
    const session = getSessionUser()
    setCurrentUser({
      email: session?.email || '',
      name: session?.name || '',
      password: '',
      title: session?.title || titleForRole(r),
    })
    createAuthenticatedHandler(setRole, setActiveNav, setScreen)(r)
    const fromUrl = typeof window !== 'undefined' ? navKeyFromPathname(window.location.pathname) : null
    const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
    // Company Analytics page is hidden for now.
    const targetNav = fromUrl === 'Analytics' ? 'Reports' : (fromUrl || defaultNav)
    setActiveNav(targetNav)
    syncBrowserPath(targetNav, 'replace')
    setWorkspaceReady(false)
    applyWorkspace({ force: true })
      .then(() => setWorkspaceReady(true))
      .catch(() => setWorkspaceError('Workspace API unavailable'))
  }

  const handleNavSelect = (key: string) => {
    // Company Analytics page is hidden for now.
    if (key === 'Analytics') {
      createNavSelectHandler(setSelectedReqIdForSubmit, setActiveNav)('Reports')
      syncBrowserPath('Reports', 'push')
      return
    }
    createNavSelectHandler(setSelectedReqIdForSubmit, setActiveNav)(key)
    syncBrowserPath(key, 'push')
    // Avoid full workspace reload when opening Reports/Submissions/History — those pages
    // already receive requirements/submissions/interviews from memory. Mutations still
    // refresh via workspace_refresh / submissions_updated listeners above.
    if (key === 'Requirements' || key === 'Dashboard') {
      void applyWorkspace().catch(() => undefined)
    }
  }

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
      await applyWorkspace({ force: true }).catch(() => undefined)
    } catch (err) {
      setRequirements(prev => prev.filter(r => r.id !== enrichedReq.id))
      throw err
    }
  }

  const handleSubmitCandidate = createSubmitCandidateHandler({
    submissions,
    setSubmissions,
    setRequirements,
    setRecruiters,
    handleAddActivityLog,
    currentUser,
    role,
    requirements,
    reloadWorkspace: applyWorkspace,
  })

  const handleSaveInterviewFeedback = createSaveInterviewFeedbackHandler({
    interviews,
    setInterviews,
    handleAddActivityLog,
    currentUser,
    role,
  })

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

  return {
    role,
    screen,
    setScreen,
    loginRole,
    setLoginRole,
    recoveryEmail,
    setRecoveryEmail,
    activeNav,
    setActiveNav,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    requirements,
    submissions,
    interviews,
    recruiters,
    leads,
    admins,
    activityLogs,
    candidates,
    setCandidates,
    workspaceStats,
    workspaceReady,
    workspaceError,
    isNewReqOpen,
    setIsNewReqOpen,
    isSubmitCandidateOpen,
    setIsSubmitCandidateOpen,
    selectedReqIdForSubmit,
    setSelectedReqIdForSubmit,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    selectedInterviewForFeedback,
    isCandidateDetailOpen,
    setIsCandidateDetailOpen,
    selectedSubmissionForDetail,
    currentUser,
    handleAddActivityLog,
    persistRequirements,
    handleLogout,
    handleAuthenticated,
    handleNavSelect,
    handleOpenSubmitCandidateFromDashboard,
    handleAddRequirement,
    handleSubmitCandidate,
    handleSaveInterviewFeedback,
    handleOpenSubmitForReq,
    handleOpenFeedbackForInterview,
    handleOpenCandidateDetail,
  }
}
