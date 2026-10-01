import React, { useState } from 'react'
import { Requirement, Submission, Interview, Recruiter, Candidate, ActivityLogItem } from '../../types'
import { Role } from '../../types'
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
  initialCandidates?: Candidate[]
  onOpenSubmit?: (reqId?: string) => void
  onOpenFeedback?: (iv: Interview) => void
  onOpenCandidate?: (sub: Submission) => void
  onUpdateRequirements?: (requirements: Requirement[]) => void
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
  onOpenSubmit,
  onOpenFeedback,
  onOpenCandidate,
  onUpdateRequirements,
  onSelectRequirement,
  onAddActivityLog,
  onNavigateToDashboard,
  onCandidatesChange,
  initialCandidates = [],
}: ModulePageProps) {
  const [candidatesList, setCandidatesList] = useState<Candidate[]>(initialCandidates)
  const updateCandidatesList: React.Dispatch<React.SetStateAction<Candidate[]>> = updater => {
    setCandidatesList(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      onCandidatesChange?.(next)
      return next
    })
  }
  const [candidateViewMode, setCandidateViewMode] = useState<'add' | 'repository'>('add')

  React.useEffect(() => {
    setCandidatesList(initialCandidates)
  }, [initialCandidates])

  const handleCandidateViewModeChange = (mode: 'add' | 'repository') => {
    setCandidateViewMode(mode)
  }

  React.useEffect(() => {
    if (selectedReqId) {
      setCandidateViewMode('repository')
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
    setCandidatesList: updateCandidatesList,
  })
}
