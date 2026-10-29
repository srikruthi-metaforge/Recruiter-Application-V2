'use client'

import { useEffect, useState } from 'react'
import { AuthScreen, Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem, Candidate, Lead, Admin } from '../../types'
import { workspaceService } from '../../services/workspace.service'
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

  const applyWorkspace = async () => {
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
        const fromUrl = typeof window !== 'undefined' ? navKeyFromPathname(window.location.pathname) : null
        const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
        const targetNav = fromUrl || defaultNav
        setActiveNav(targetNav)
        syncBrowserPath(targetNav, 'replace')
        setScreen('app')
        try {
          await applyWorkspace()
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
      if (key === 'Requirements') applyWorkspace().catch(() => undefined)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const handleLogout = () => {
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
    const targetNav = fromUrl || defaultNav
    setActiveNav(targetNav)
    syncBrowserPath(targetNav, 'replace')
    setWorkspaceReady(false)
    applyWorkspace()
      .then(() => setWorkspaceReady(true))
      .catch(() => setWorkspaceError('Workspace API unavailable'))
  }

  const handleNavSelect = (key: string) => {
    createNavSelectHandler(setSelectedReqIdForSubmit, setActiveNav)(key)
    syncBrowserPath(key, 'push')
    if (key === 'Requirements') {
      applyWorkspace().catch(() => undefined)
    }
  }

  const handleOpenSubmitCandidateFromDashboard = (reqId?: string) => {
    setSelectedReqIdForSubmit(reqId || null)
    if (role !== 'recruiter') {
      handleNavSelect('Candidates')
    }
  }

  const handleAddRequirement = (newReq: Requirement) => {
    const nowIso = new Date().toISOString()
    const enrichedReq: Requirement = {
      ...newReq,
      emailArrivedTime: newReq.emailArrivedTime || new Date().toLocaleString(),
      createdAt: (newReq as any).createdAt || nowIso,
      updatedAt: (newReq as any).updatedAt || nowIso,
    }
    setRequirements([enrichedReq, ...requirements])
    void workspaceService.createRequirement(enrichedReq).catch(() => undefined)
  }

  const handleSubmitCandidate = createSubmitCandidateHandler({
    submissions,
    setSubmissions,
    setRequirements,
    setRecruiters,
    handleAddActivityLog,
    currentUser,
    role,
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
