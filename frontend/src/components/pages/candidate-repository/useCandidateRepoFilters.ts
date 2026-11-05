import { useEffect, useMemo, useState } from 'react'
import { CandidateRepoItem } from './types'
import { getCandidateSubmissionsHistory } from './history'

type FilterOptions = {
  /** When true, repoList is already one server page — search/paging happen via API. */
  serverPaged?: boolean
  serverTotal?: number
}

function readPendingRepoScope(): { createdBy: string; from: string; to: string } {
  if (typeof window === 'undefined') return { createdBy: 'All', from: '', to: '' }
  try {
    const createdBy = sessionStorage.getItem('pending_repo_created_by') || ''
    const from = sessionStorage.getItem('pending_repo_from') || ''
    const to = sessionStorage.getItem('pending_repo_to') || ''
    if (createdBy) sessionStorage.removeItem('pending_repo_created_by')
    if (from) sessionStorage.removeItem('pending_repo_from')
    if (to) sessionStorage.removeItem('pending_repo_to')
    return { createdBy: createdBy || 'All', from, to }
  } catch {
    return { createdBy: 'All', from: '', to: '' }
  }
}

export function useCandidateRepoFilters(repoList: CandidateRepoItem[], options: FilterOptions = {}) {
  const serverPaged = Boolean(options.serverPaged)
  const [pendingScope] = useState(readPendingRepoScope)
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedPeriod, setSubmittedPeriod] = useState('All time')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [totalExpFilter, setTotalExpFilter] = useState('All experience')
  const [submissionCountFilter, setSubmissionCountFilter] = useState('All Submissions')
  const [submittedClientFilter, setSubmittedClientFilter] = useState('All Clients')
  /** User id of the recruiter who added the candidate; empty / 'All' = no filter */
  const [createdByFilter, setCreatedByFilter] = useState(pendingScope.createdBy)
  /** Analytics period passed to sourced-by (createdAt from/to). Empty = all time. */
  const [sourcedFrom, setSourcedFrom] = useState(pendingScope.from)
  const [sourcedTo, setSourcedTo] = useState(pendingScope.to)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Apply recruiter + period when navigating from Individual Analytics → Sourced KPI.
  useEffect(() => {
    const applyPending = () => {
      try {
        const pending = sessionStorage.getItem('pending_repo_created_by')
        const from = sessionStorage.getItem('pending_repo_from') || ''
        const to = sessionStorage.getItem('pending_repo_to') || ''
        if (!pending && !from && !to) return
        if (pending) {
          sessionStorage.removeItem('pending_repo_created_by')
          setCreatedByFilter(pending)
        }
        sessionStorage.removeItem('pending_repo_from')
        sessionStorage.removeItem('pending_repo_to')
        setSourcedFrom(from)
        setSourcedTo(to)
        setCurrentPage(1)
      } catch {
        // ignore
      }
    }
    applyPending()
    window.addEventListener('notification_navigate', applyPending as EventListener)
    return () => window.removeEventListener('notification_navigate', applyPending as EventListener)
  }, [])

  const uniqueSubmittedClients = useMemo(() => {
    const set = new Set<string>()
    repoList.forEach(item => {
      const history = getCandidateSubmissionsHistory(item)
      history.companies.forEach(c => set.add(c))
    })
    return Array.from(set).sort()
  }, [repoList])

  // Filter repo list dynamically (search is server-side when serverPaged).
  const filteredList = useMemo(() => {
    return repoList.filter(item => {
      if (!serverPaged && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = item.name.toLowerCase().includes(q)
        const matchId = item.candidateId.toLowerCase().includes(q)
        const matchTech = item.technology.toLowerCase().includes(q)
        const matchCreator = String(item.createdBy || '').toLowerCase().includes(q)
        const matchSkills = (item.skills || '').toLowerCase().includes(q)
        const matchCompany = (item.currentCompany || '').toLowerCase().includes(q)
        if (!matchName && !matchId && !matchTech && !matchCreator && !matchSkills && !matchCompany) return false
      }

      // Date / Submitted Period Filter
      if (submittedPeriod && submittedPeriod !== 'All time') {
        const rawDate = item.createdDate || ''
        if (!rawDate) return false
        const d = new Date(rawDate)
        if (isNaN(d.getTime())) return false

        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

        if (submittedPeriod === 'Today') {
          if (d < startOfToday || d > endOfToday) return false
        } else if (submittedPeriod === 'Yesterday') {
          const startOfYesterday = new Date(startOfToday.getTime() - 86400000)
          const endOfYesterday = new Date(endOfToday.getTime() - 86400000)
          if (d < startOfYesterday || d > endOfYesterday) return false
        } else if (submittedPeriod === 'This week') {
          const day = (now.getDay() + 6) % 7
          const startOfWeek = new Date(startOfToday.getTime() - day * 86400000)
          if (d < startOfWeek || d > endOfToday) return false
        } else if (submittedPeriod === 'This month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          if (d < startOfMonth || d > endOfToday) return false
        } else if (submittedPeriod === 'Custom range') {
          if (customStartDate) {
            const start = new Date(`${customStartDate}T00:00:00`)
            if (d < start) return false
          }
          if (customEndDate) {
            const end = new Date(`${customEndDate}T23:59:59.999`)
            if (d > end) return false
          }
        }
      }

      const subHistory = getCandidateSubmissionsHistory(item)

      if (submissionCountFilter !== 'All Submissions') {
        if (submissionCountFilter === 'Not Submitted Yet' && subHistory.count !== 0) return false
        if (submissionCountFilter === 'Submitted 1+ times' && subHistory.count < 1) return false
        if (submissionCountFilter === 'Submitted 2+ times' && subHistory.count < 2) return false
        if (submissionCountFilter === 'Submitted 3+ times' && subHistory.count < 3) return false
      }

      if (submittedClientFilter !== 'All Clients') {
        const clientTarget = submittedClientFilter.toLowerCase()
        const matchesClient = subHistory.companies.some(c => c.toLowerCase().includes(clientTarget))
        if (!matchesClient) return false
      }

      if (totalExpFilter !== 'All experience') {
        const expMatch = item.totalExperience.match(/\d+/)
        const years = expMatch ? parseInt(expMatch[0], 10) : 0
        if (totalExpFilter === '0–2 years' && (years < 0 || years > 2)) return false
        if (totalExpFilter === '2–5 years' && (years < 2 || years > 5)) return false
        if (totalExpFilter === '5–8 years' && (years < 5 || years > 8)) return false
        if (totalExpFilter === '8–10 years' && (years < 8 || years > 10)) return false
        if (totalExpFilter === '10+ years' && years < 10) return false
      }

      return true
    })
  }, [
    repoList,
    serverPaged,
    searchQuery,
    submittedPeriod,
    customStartDate,
    customEndDate,
    submissionCountFilter,
    submittedClientFilter,
    totalExpFilter,
  ])

  const paginatedRepoList = useMemo(() => {
    if (serverPaged) return filteredList
    const start = (currentPage - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, currentPage, pageSize, serverPaged])

  const totalItems = serverPaged
    ? Number(options.serverTotal || filteredList.length)
    : filteredList.length

  return {
    searchQuery,
    setSearchQuery,
    submittedPeriod,
    setSubmittedPeriod,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    totalExpFilter,
    setTotalExpFilter,
    submissionCountFilter,
    setSubmissionCountFilter,
    submittedClientFilter,
    setSubmittedClientFilter,
    createdByFilter,
    setCreatedByFilter,
    sourcedFrom,
    sourcedTo,
    uniqueSubmittedClients,
    filteredList,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedRepoList,
    totalItems,
    serverPaged,
  }
}
