'use client'

import { useEffect, useState } from 'react'
import { AuthScreen, Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem } from '../../types'
import {
  INITIAL_ADMINS,
  INITIAL_INTERVIEWS,
  INITIAL_LEADS,
  INITIAL_RECRUITERS,
  INITIAL_REQUIREMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_ACTIVITY_LOGS,
  DEMO_ACCOUNTS,
} from '../../data/mockData'
import { workspaceService } from '../../services/workspace.service'
import { createSaveInterviewFeedbackHandler, createSubmitCandidateHandler } from './appHandlers'
import { createAuthenticatedHandler, createLogoutHandler, createNavSelectHandler } from './appSessionHandlers'

export function useAppController() {
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

  const handleLogout = createLogoutHandler(setScreen, setActiveNav)

  const handleAuthenticated = createAuthenticatedHandler(setRole, setActiveNav, setScreen)

  const handleNavSelect = createNavSelectHandler(setSelectedReqIdForSubmit, setActiveNav)

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
