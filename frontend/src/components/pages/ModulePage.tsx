import React, { useState } from 'react'
import { Requirement, Submission, Interview, Recruiter, Candidate, ActivityLogItem } from '../../types'
import { Role } from '../../types'
import { INITIAL_CANDIDATES } from '../../data/mockData'
import { renderModulePage } from './ModulePage.routes'

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
  onOpenSubmit?: (reqId?: string) => void
  onOpenFeedback?: (iv: Interview) => void
  onOpenCandidate?: (sub: Submission) => void
  onUpdateRequirements?: (requirements: Requirement[]) => void
  onSelectRequirement?: (reqId: string | null) => void
  onAddActivityLog?: (log: ActivityLogItem) => void
  onNavigateToDashboard?: () => void
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
  onOpenSubmit,
  onOpenFeedback,
  onOpenCandidate,
  onUpdateRequirements,
  onSelectRequirement,
  onAddActivityLog,
  onNavigateToDashboard,
}: ModulePageProps) {
  const [candidatesList, setCandidatesList] = useState<Candidate[]>(INITIAL_CANDIDATES)
  const [candidateViewMode, setCandidateViewMode] = useState<'add' | 'repository'>(() => {
    try {
      const saved = localStorage.getItem('metaforge_candidate_view_mode')
      if (saved === 'add' || saved === 'repository') return saved
    } catch {}
    return 'add'
  })

  const handleCandidateViewModeChange = (mode: 'add' | 'repository') => {
    setCandidateViewMode(mode)
    try {
      localStorage.setItem('metaforge_candidate_view_mode', mode)
    } catch {}
  }

  React.useEffect(() => {
    if (selectedReqId) {
      setCandidateViewMode('repository')
      try {
        localStorage.setItem('metaforge_candidate_view_mode', 'repository')
      } catch {}
    }
  }, [selectedReqId, pageKey])

  return renderModulePage({
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
    candidatesList,
    candidateViewMode,
    onOpenSubmit,
    onOpenFeedback,
    onOpenCandidate,
    onUpdateRequirements,
    onSelectRequirement,
    onAddActivityLog,
    onNavigateToDashboard,
    handleCandidateViewModeChange,
    setCandidatesList,
  })
}
