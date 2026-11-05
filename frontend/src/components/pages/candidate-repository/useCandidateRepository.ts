import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Requirement } from '../../../types'
import { uiCandidateToRepo, UiCandidate, apiCandidateToUi } from '../../../services/candidatePayload'
import { candidatesService, usersService } from '../../../services/workspace.service'
import { CandidateRepoItem, CandidateRepositoryPageProps } from './types'
import { useCandidateRepoEdit } from './useCandidateRepoEdit'
import { useCandidateRepoFilters } from './useCandidateRepoFilters'
import { useCandidateRepoMasking } from './useCandidateRepoMasking'
import { getSessionUser } from '../../../store/session'
import { canWorkOnRequirement } from '../../../utils/recruiterOwnership'
import { CANDIDATE_GC_MS, CANDIDATE_STALE_MS, queryKeys } from '../../../lib/queryKeys'

const STABLE_DEFAULT_CANDIDATES: UiCandidate[] = []

export function useCandidateRepository({
  candidates = STABLE_DEFAULT_CANDIDATES,
  requirements = [],
  selectedReqId = null,
  role = 'recruiter',
  onOpenAddForm,
  onCandidateUpdated,
  onSelectRequirement,
  onBackToDashboard,
  backButtonLabel,
}: CandidateRepositoryPageProps) {
  const storedRole = getSessionUser()?.role || null
  const activeRoleStr = (role || storedRole || '').toLowerCase()
  const isLeadRole = activeRoleStr === 'lead' || activeRoleStr.includes('lead') || activeRoleStr === 'team lead' || activeRoleStr === 'team_lead'
  const canFilterByCreator =
    activeRoleStr === 'superadmin' || activeRoleStr === 'admin' || activeRoleStr === 'devteam'

  const [repoList, setRepoList] = useState<CandidateRepoItem[]>([])
  const [serverTotal, setServerTotal] = useState(0)
  const [viewMode, setViewMode] = useState<string>('list')
  const [creatorOptions, setCreatorOptions] = useState<Array<{ id: string; name: string }>>([])
  const filters = useCandidateRepoFilters(repoList, { serverPaged: true, serverTotal })
  const masking = useCandidateRepoMasking()
  const [debouncedSearch, setDebouncedSearch] = useState('')
  /** Admin UI filter OR analytics/History deep-link to one recruiter's sourced profiles. */
  const sourcedByUserId =
    filters.createdByFilter && filters.createdByFilter !== 'All'
      ? String(filters.createdByFilter).trim()
      : ''
  const createdByParam = canFilterByCreator ? sourcedByUserId : ''
  /** History-style sourced list: always honor deep-link / Created-by user id via listSourcedBy. */
  const scopedSourcedUserId = sourcedByUserId
  const sourcedFrom = String(filters.sourcedFrom || '').trim()
  const sourcedTo = String(filters.sourcedTo || '').trim()

  // Debounce search so each keystroke does not hit the API.
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(filters.searchQuery.trim()), 300)
    return () => window.clearTimeout(t)
  }, [filters.searchQuery])

  // Load creator names for the Created By filter (admin roles only).
  useEffect(() => {
    if (!canFilterByCreator) {
      setCreatorOptions([])
      return
    }
    let active = true
    usersService
      .list()
      .then((rows: any) => {
        if (!active) return
        const list = Array.isArray(rows) ? rows : Array.isArray(rows?.items) ? rows.items : []
        const options = list
          .map((u: any) => {
            const id = String(u.id || u._id || '').trim()
            const name = String(u.name || u.fullName || u.email || '').trim()
            if (!id || !name) return null
            return { id, name }
          })
          .filter(Boolean) as Array<{ id: string; name: string }>
        options.sort((a, b) => a.name.localeCompare(b.name))
        setCreatorOptions(options)
      })
      .catch(() => {
        if (active) setCreatorOptions([])
      })
    return () => {
      active = false
    }
  }, [canFilterByCreator])

  // Reset to page 1 when search or Created By filter changes.
  useEffect(() => {
    filters.setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when filter inputs change
  }, [debouncedSearch, createdByParam, scopedSourcedUserId, sourcedFrom, sourcedTo])

  const sessionUserId = getSessionUser()?.id || ''
  const candidateParams = {
    mode: (scopedSourcedUserId ? 'sourced' : 'list') as 'sourced' | 'list',
    page: filters.currentPage,
    limit: filters.pageSize,
    search: scopedSourcedUserId ? '' : debouncedSearch,
    createdBy: scopedSourcedUserId ? '' : createdByParam,
    sourcedBy: scopedSourcedUserId,
    from: scopedSourcedUserId ? sourcedFrom : '',
    to: scopedSourcedUserId ? sourcedTo : '',
  }
  const candidateQuery = useQuery({
    queryKey: queryKeys.candidatePage(sessionUserId || 'signed-out', candidateParams),
    enabled: Boolean(sessionUserId),
    staleTime: CANDIDATE_STALE_MS,
    gcTime: CANDIDATE_GC_MS,
    queryFn: ({ signal }) =>
      scopedSourcedUserId
        ? candidatesService.listSourcedBy(scopedSourcedUserId, {
            page: filters.currentPage,
            limit: filters.pageSize,
            from: sourcedFrom || undefined,
            to: sourcedTo || undefined,
            signal,
          })
        : candidatesService.listPage({
            page: filters.currentPage,
            limit: filters.pageSize,
            search: debouncedSearch,
            createdBy: createdByParam || undefined,
            signal,
          }),
  })
  const listLoading = candidateQuery.isFetching

  useEffect(() => {
    const res = candidateQuery.data
    if (!res) return
    const rows = (res.items || []).map((c: any) => uiCandidateToRepo(apiCandidateToUi(c)))
    setRepoList(rows)
    setServerTotal(Number(res.total || rows.length))
  }, [candidateQuery.data])

  useEffect(() => {
    if (!candidateQuery.isError) return
    setRepoList([])
    setServerTotal(0)
  }, [candidateQuery.isError])

  // Keep local create/update from parent props in sync without dumping workspace.
  useEffect(() => {
    if (!candidates?.length) return
    // Soft-merge newly added candidates into the current page view when present.
    setRepoList(prev => {
      if (prev.length === 0) return prev
      const byId = new Map(prev.map(r => [r.id, r]))
      for (const c of candidates) {
        const mapped = uiCandidateToRepo(c as UiCandidate)
        if (byId.has(mapped.id)) byId.set(mapped.id, { ...byId.get(mapped.id)!, ...mapped })
      }
      return Array.from(byId.values())
    })
  }, [candidates])

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
        client: '',
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
    const pageIds = filters.paginatedRepoList.map(item => item.id)
    if (pageIds.length > 0 && pageIds.every(id => selectedIds.has(id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(pageIds))
    }
  }

  const [selectedCandidatesForSubmit, setSelectedCandidatesForSubmit] = useState<CandidateRepoItem[]>([])
  const [viewingCandidateDetail, setViewingCandidateDetail] = useState<CandidateRepoItem | null>(null)

  const openCandidateDetail = React.useCallback(async (item: CandidateRepoItem) => {
    setViewingCandidateDetail(item)
    const lookupId = item.id || item.candidateId
    if (!lookupId) return
    try {
      const doc = await candidatesService.getById(lookupId)
      if (!doc) return
      const fresh = uiCandidateToRepo(apiCandidateToUi(doc))
      setViewingCandidateDetail(prev => {
        if (!prev) return fresh
        const same =
          prev.id === item.id ||
          prev.candidateId === item.candidateId ||
          prev.id === fresh.id ||
          prev.candidateId === fresh.candidateId
        if (!same) return prev
        return {
          ...prev,
          ...fresh,
          resumeReference: fresh.resumeReference || prev.resumeReference,
          resumeFileId: fresh.resumeFileId || prev.resumeFileId,
        }
      })
      setRepoList(prev =>
        prev.map(row => {
          const match =
            row.id === fresh.id ||
            row.candidateId === fresh.candidateId ||
            row.id === item.id ||
            row.candidateId === item.candidateId
          if (!match) return row
          return {
            ...row,
            resumeReference: fresh.resumeReference || row.resumeReference,
            resumeFileId: fresh.resumeFileId || row.resumeFileId,
          }
        }),
      )
    } catch {
      // Keep list row data if detail hydrate fails.
    }
  }, [])

  const [selectedSubmissionHistoryCandidate, setSelectedSubmissionHistoryCandidate] = useState<CandidateRepoItem | null>(null)
  const [submissionModalSearchQuery, setSubmissionModalSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const edit = useCandidateRepoEdit(setRepoList, showToast, onCandidateUpdated)
  const handleOpenEdit = (item: CandidateRepoItem, e?: React.MouseEvent) => {
    setViewingCandidateDetail(null)
    edit.handleOpenEdit(item, e)
  }

  const sessionMe = () => {
    const session = getSessionUser()
    return {
      id: session?.id || null,
      email: session?.email || null,
      name: session?.name || null,
    }
  }

  const workableRequirements = useMemo(
    () => requirements.filter(req => canWorkOnRequirement(req, sessionMe(), role)),
    [requirements, role],
  )

  const handleSubmitSingleToLead = (item: CandidateRepoItem, e?: React.MouseEvent) => {
    e?.stopPropagation()

    setViewingCandidateDetail(null)
    const me = sessionMe()
    const active = activeRequirement
    if (!activeReqId || !canWorkOnRequirement(active, me, role)) {
      setPendingCandidateForSubmit(item)
      setTempModalReqId(workableRequirements[0]?.id || '')
      setIsChangeReqModalOpen(true)
      if (activeReqId && !canWorkOnRequirement(active, me, role)) {
        showToast('You are not assigned to this requirement. Pick one assigned to you.')
      }
      return
    }
    setSelectedCandidatesForSubmit([item])
    setViewMode('submit_to_lead')
  }

  const handleConfirmReqSelection = (reqIdToSet: string) => {
    const selected = requirements.find(r => r.id === reqIdToSet)
    if (!canWorkOnRequirement(selected, sessionMe(), role)) {
      showToast('You can only submit candidates to requirements assigned to you.')
      return
    }
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
    backButtonLabel,
    isLeadRole,
    repoList,
    listLoading,
    viewMode,
    setViewMode,
    creatorOptions,
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
    openCandidateDetail,
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
