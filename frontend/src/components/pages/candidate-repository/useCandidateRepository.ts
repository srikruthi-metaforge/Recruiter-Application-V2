import React, { useMemo, useState } from 'react'
import { Requirement } from '../../../types'
import { INITIAL_REQUIREMENTS } from '../../../data/mockData'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'
import { DEFAULT_REPO_CANDIDATES } from './candidates.data'
import { CandidateRepoItem, CandidateRepositoryPageProps } from './types'
import { useCandidateRepoEdit } from './useCandidateRepoEdit'
import { useCandidateRepoFilters } from './useCandidateRepoFilters'
import { useCandidateRepoMasking } from './useCandidateRepoMasking'

export function useCandidateRepository({
  requirements = INITIAL_REQUIREMENTS,
  selectedReqId = null,
  role = 'recruiter',
  onOpenAddForm,
  onSelectRequirement,
  onBackToDashboard,
}: CandidateRepositoryPageProps) {
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('metaforge_user_role') : null
  const activeRoleStr = (role || storedRole || '').toLowerCase()
  const isLeadRole = activeRoleStr === 'lead' || activeRoleStr.includes('lead') || activeRoleStr === 'team lead' || activeRoleStr === 'team_lead'

  const [repoList, setRepoList] = useState<CandidateRepoItem[]>(DEFAULT_REPO_CANDIDATES)
  const [viewMode, setViewMode] = useState<string>('list')
  const filters = useCandidateRepoFilters(repoList)
  const masking = useCandidateRepoMasking()

  const scrollToNextPageSection = () => {
    setTimeout(() => {
      const el = document.getElementById('candidate-repo-next-page-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const [activeReqId, setActiveReqId] = useState<string | null>(selectedReqId || null)
  const [isChangeReqModalOpen, setIsChangeReqModalOpen] = useState(false)
  const [pendingCandidateForSubmit, setPendingCandidateForSubmit] = useState<CandidateRepoItem | null>(null)
  const [tempModalReqId, setTempModalReqId] = useState<string>('')

  React.useEffect(() => {
    if (selectedReqId !== undefined) {
      setActiveReqId(selectedReqId)
    }
  }, [selectedReqId])

  const activeRequirement = useMemo(() => {
    if (!activeReqId) return null
    return (
      requirements.find(r => r.id === activeReqId) ||
      ({
        id: activeReqId,
        title: 'Requirement ' + activeReqId,
        client: 'Metaforge Client',
        priority: 'High',
        status: 'Active',
      } as Requirement)
    )
  }, [requirements, activeReqId])

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const toggleSelectCandidate = (id: string, e?: React.SyntheticEvent) => {
    e?.stopPropagation()
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }
  const toggleSelectAll = () => {
    if (selectedIds.size === filters.filteredList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filters.filteredList.map(item => item.id)))
    }
  }

  const [selectedCandidatesForSubmit, setSelectedCandidatesForSubmit] = useState<CandidateRepoItem[]>([])
  const [viewingCandidateDetail, setViewingCandidateDetail] = useState<CandidateRepoItem | null>(null)
  const [selectedSubmissionHistoryCandidate, setSelectedSubmissionHistoryCandidate] = useState<CandidateRepoItem | null>(null)
  const [submissionModalSearchQuery, setSubmissionModalSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const edit = useCandidateRepoEdit(repoList, setRepoList, showToast)
  const handleOpenEdit = (item: CandidateRepoItem, e?: React.MouseEvent) => {
    setViewingCandidateDetail(null)
    edit.handleOpenEdit(item, e)
  }

  const handleSubmitSingleToLead = (item: CandidateRepoItem, e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (activeReqId) {
      const dupCheck = checkDuplicateSubmission(activeReqId, {
        email: item.email,
        phone: item.phone,
        candidateId: item.candidateId,
        name: item.name,
      })

      if (dupCheck.isDuplicate) {
        showToast(
          `⚠️ Duplicate Submission: Candidate "${item.name}" has already been submitted for requirement "${activeRequirement?.title || activeReqId}" by ${dupCheck.existingSubmission?.recruiter || 'another recruiter'}. Cannot submit!`
        )
        return
      }
    }

    setViewingCandidateDetail(null)
    if (!activeReqId) {
      setPendingCandidateForSubmit(item)
      setTempModalReqId(requirements[0]?.id || '')
      setIsChangeReqModalOpen(true)
    } else {
      setSelectedCandidatesForSubmit([item])
      setViewMode('submit_to_lead')
    }
  }

  const handleConfirmReqSelection = (reqIdToSet: string) => {
    setActiveReqId(reqIdToSet)
    onSelectRequirement?.(reqIdToSet)
    setIsChangeReqModalOpen(false)
    if (pendingCandidateForSubmit) {
      setSelectedCandidatesForSubmit([pendingCandidateForSubmit])
      setPendingCandidateForSubmit(null)
      setViewMode('submit_to_lead')
    } else {
      showToast('Requirement selected successfully!')
    }
  }

  return {
    role,
    requirements,
    onOpenAddForm,
    onSelectRequirement,
    onBackToDashboard,
    isLeadRole,
    repoList,
    viewMode,
    setViewMode,
    ...filters,
    ...masking,
    scrollToNextPageSection,
    activeReqId,
    setActiveReqId,
    isChangeReqModalOpen,
    setIsChangeReqModalOpen,
    pendingCandidateForSubmit,
    setPendingCandidateForSubmit,
    tempModalReqId,
    setTempModalReqId,
    activeRequirement,
    selectedIds,
    setSelectedIds,
    toggleSelectCandidate,
    toggleSelectAll,
    selectedCandidatesForSubmit,
    setSelectedCandidatesForSubmit,
    viewingCandidateDetail,
    setViewingCandidateDetail,
    selectedSubmissionHistoryCandidate,
    setSelectedSubmissionHistoryCandidate,
    submissionModalSearchQuery,
    setSubmissionModalSearchQuery,
    toastMsg,
    showToast,
    ...edit,
    handleOpenEdit,
    handleSubmitSingleToLead,
    handleConfirmReqSelection,
  }
}

export type CandidateRepoVm = ReturnType<typeof useCandidateRepository>
