import React, { Suspense, useState } from 'react'
import { Requirement, Submission, Interview, Recruiter, Candidate, ActivityLogItem } from '../../types'
import { Role } from '../../types'
import { renderModulePage } from './ModulePage.routes'
import { SIDEBAR_NAV_EVENT } from '../../utils/notificationNavigation'
import { useReturnToReports } from '../../utils/useReturnToReports'
import { PageLoading } from '../common/PageLoading'

interface ModulePageProps {
  pageKey: string
  role: Role
  requirements?: Requirement[]
  submissions?: Submission[]
  interviews?: Interview[]
  recruiters?: Recruiter[]
  selectedReqId?: string | null
  activityLogs?: ActivityLogItem[]
  currentUserName?: string
  currentUserEmail?: string
  /** Workspace Candidate Repository count for the logged-in user. */
  myCandidatesCount?: number
  initialCandidates?: Candidate[]
  onOpenSubmit?: (reqId?: string) => void
  onOpenFeedback?: (iv: Interview) => void
  onOpenCandidate?: (sub: Submission) => void
  onUpdateRequirements?: (requirements: Requirement[]) => void
  onAddRequirement?: (newReq: Requirement) => void | Promise<void>
  onSelectRequirement?: (reqId: string | null) => void
  onAddActivityLog?: (log: ActivityLogItem) => void
  onNavigateToDashboard?: () => void
  onCandidatesChange?: (candidates: Candidate[]) => void
}

export function ModulePage({
  pageKey,
  role,
  requirements = [],
  submissions = [],
  interviews = [],
  recruiters = [],
  selectedReqId = null,
  activityLogs = [],
  currentUserName,
  currentUserEmail,
  myCandidatesCount,
  onOpenSubmit,
  onOpenFeedback,
  onOpenCandidate,
  onUpdateRequirements,
  onAddRequirement,
  onSelectRequirement,
  onAddActivityLog,
  onNavigateToDashboard,
  onCandidatesChange,
  initialCandidates = [],
}: ModulePageProps) {
  const [candidatesList, setCandidatesList] = useState<Candidate[]>(initialCandidates)
  const prevCandidatesRef = React.useRef(initialCandidates)

  React.useEffect(() => {
    setCandidatesList(initialCandidates)
    prevCandidatesRef.current = initialCandidates
  }, [initialCandidates])

  const updateCandidatesList: React.Dispatch<React.SetStateAction<Candidate[]>> = updater => {
    setCandidatesList(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return next
    })
  }

  React.useEffect(() => {
    if (prevCandidatesRef.current !== candidatesList) {
      prevCandidatesRef.current = candidatesList
      onCandidatesChange?.(candidatesList)
    }
  }, [candidatesList, onCandidatesChange])

  const [candidateViewMode, setCandidateViewMode] = useState<'add' | 'repository'>(() => {
    if (typeof window === 'undefined') return 'add'
    try {
      const saved = window.sessionStorage.getItem('mrap_candidate_view_mode_v1')
      return saved === 'repository' ? 'repository' : 'add'
    } catch {
      return 'add'
    }
  })
  const [addOpenedFromRepository, setAddOpenedFromRepository] = useState(false)
  const returnToReports = useReturnToReports()

  React.useEffect(() => {
    const onSidebar = () => setAddOpenedFromRepository(false)
    window.addEventListener(SIDEBAR_NAV_EVENT, onSidebar)
    return () => window.removeEventListener(SIDEBAR_NAV_EVENT, onSidebar)
  }, [])

  const handleCandidateViewModeChange = (mode: 'add' | 'repository') => {
    if (mode === 'add' && candidateViewMode === 'repository') {
      setAddOpenedFromRepository(true)
    }
    if (mode === 'repository') {
      setAddOpenedFromRepository(false)
    }
    setCandidateViewMode(mode)
    try {
      window.sessionStorage.setItem('mrap_candidate_view_mode_v1', mode)
    } catch {
      // ignore
    }
  }

  React.useEffect(() => {
    if (selectedReqId) {
      setCandidateViewMode('repository')
      setAddOpenedFromRepository(false)
      try {
        window.sessionStorage.setItem('mrap_candidate_view_mode_v1', 'repository')
      } catch {
        // ignore
      }
    }
  }, [selectedReqId, pageKey])

  // Sidebar nav to Candidates resets nested-back state for a clean top-level entry
  React.useEffect(() => {
    if (pageKey === 'Candidates' || pageKey === 'Candidate Search') {
      if (!selectedReqId) {
        setAddOpenedFromRepository(false)
      }
    } else {
      setAddOpenedFromRepository(false)
    }
  }, [pageKey, selectedReqId])

  // Open candidate repository only when analytics/notification explicitly requested it.
  const openRepositoryFromPending = React.useCallback((opts?: { clear?: boolean }) => {
    try {
      const pendingId = sessionStorage.getItem('pending_open_candidate')
      const pendingRepo = sessionStorage.getItem('pending_open_candidate_repository')
      if (!pendingId && pendingRepo !== '1') return false
      setCandidateViewMode('repository')
      setAddOpenedFromRepository(false)
      window.sessionStorage.setItem('mrap_candidate_view_mode_v1', 'repository')
      if (opts?.clear !== false) {
        if (pendingId) sessionStorage.removeItem('pending_open_candidate')
        if (pendingRepo === '1') sessionStorage.removeItem('pending_open_candidate_repository')
      }
      return true
    } catch {
      return false
    }
  }, [])

  React.useEffect(() => {
    // Don't clear yet — wait until Candidates page is active so mode can't be lost in a race.
    openRepositoryFromPending({ clear: false })
    const onNav = () => {
      openRepositoryFromPending({ clear: false })
    }
    window.addEventListener('notification_navigate', onNav as EventListener)
    return () => window.removeEventListener('notification_navigate', onNav as EventListener)
  }, [openRepositoryFromPending])

  // When landing on Candidates after Sourced KPI/graph, force repository (not Add form).
  React.useEffect(() => {
    if (pageKey !== 'Candidates' && pageKey !== 'Candidate Search') return
    openRepositoryFromPending({ clear: true })
  }, [pageKey, openRepositoryFromPending])

  return (
    <Suspense fallback={<PageLoading />}>
      {renderModulePage({
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
    onOpenCandidate,
    onUpdateRequirements,
    onAddRequirement,
    onSelectRequirement,
    onAddActivityLog,
    onNavigateToDashboard,
    handleCandidateViewModeChange,
    setCandidatesList: updateCandidatesList,
    addOpenedFromRepository,
    returnToReports,
  })}
    </Suspense>
  )
}
