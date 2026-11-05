import { useMemo, useState, useEffect } from 'react'
import { Requirement } from '../../../types'
import type { RequirementsVmState } from './useRequirementsPageState'
import { useDebouncedValue } from '../../../lib/useDebouncedValue'
import {
  isRequirementUnassigned,
  isRequirementAssigned,
  isRequirementInProgress,
  requirementHasSelections,
  requirementHasRejection,
} from '../../ui/requirementAssignment'
import { requirementAssignedToRecruiter } from '../../../utils/recruiterOwnership'

function requirementInAssigneeScope(r: Requirement, idsRaw?: string, name?: string): boolean {
  const ids = String(idsRaw || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)
  const assigneeName = String(name || '').trim()
  if (!ids.length && !assigneeName) return true
  const reqIds = (Array.isArray(r.assignedRecruiterIds) ? r.assignedRecruiterIds : []).map(id => String(id))
  if (ids.some(id => reqIds.includes(id))) return true
  if (
    requirementAssignedToRecruiter(r, {
      id: ids[0] || '',
      name: assigneeName,
    })
  ) {
    return true
  }
  const label = String(r.assignedRecruiterNames || r.owner || '').toLowerCase()
  return Boolean(assigneeName) && label.includes(assigneeName.toLowerCase())
}

/**
 * Safely extracts a canonical Date for when a requirement was created/received.
 * Uses arrival/creation timestamps only — never dueDate, lastSeenAt, or updatedAt,
 * so date filters (Today / This month) match the Arrived column, not later edits.
 */
export function getRequirementDate(r: Requirement): Date | null {
  if (!r) return null

  const parseValid = (candidate: unknown): Date | null => {
    if (!candidate) return null
    const d = candidate instanceof Date ? candidate : new Date(String(candidate))
    if (isNaN(d.getTime()) || d.getFullYear() < 2020) return null
    return d
  }

  // 1. Prefer full ISO arrival / creation timestamps from the workspace mapper
  const isoCandidates = [
    (r as any).emailArrivedTimeRaw,
    (r as any).firstDetectedAt,
    (r as any).first_detected_at,
    (r as any).sourceEmailReceivedAt,
    (r as any).source_email_received_at,
    (r as any).createdAt,
  ]

  for (const candidate of isoCandidates) {
    const d = parseValid(candidate)
    if (d) return d
  }

  // 2. Extract calendar day from reqCode / id (e.g. "2026-10-31-001", "2026/05/14-006")
  const code = (r.reqCode || r.id || '').trim()
  const m = code.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (m) {
    const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10))
    if (!isNaN(d.getTime())) return d
  }

  // 3. Display string fallback (may omit year → JS defaults to 2001)
  if (r.emailArrivedTime) {
    const d = new Date(r.emailArrivedTime)
    if (!isNaN(d.getTime())) {
      if (d.getFullYear() < 2020) {
        const codeYear = m ? parseInt(m[1], 10) : new Date().getFullYear()
        d.setFullYear(codeYear)
      }
      if (d.getFullYear() >= 2020) return d
    }
  }

  return null
}

export function getRequirementTimestamp(r: Requirement): number {
  const d = getRequirementDate(r)
  return d ? d.getTime() : 0
}

export function parseRequirementCode(req: Requirement) {
  const code = (req.reqCode || req.id || '').trim()
  const m = code.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})-(\d+)/)
  if (m) {
    const dateNum = parseInt(`${m[1]}${m[2].padStart(2, '0')}${m[3].padStart(2, '0')}`, 10)
    const seqNum = parseInt(m[4], 10)
    return { hasCode: true, dateNum, seqNum }
  }
  return { hasCode: false, dateNum: 0, seqNum: 0 }
}

/** Original creation time of the canonical requirement (never its last update). */
export function getRequirementCreatedTime(r: Requirement): number {
  const d = getRequirementDate(r)
  return d ? d.getTime() : 0
}

/**
 * Default list order, identical to the backend: newest original creation time first,
 * then database insertion order (_id). Updates, holds and reopens never move a requirement.
 */
export function compareRequirementsDescending(a: Requirement, b: Requirement): number {
  const diff = getRequirementCreatedTime(b) - getRequirementCreatedTime(a)
  if (diff !== 0) return diff
  const idA = String((a as any)._id || '')
  const idB = String((b as any)._id || '')
  if (idA !== idB) return idB.localeCompare(idA)
  return (b.reqCode || b.id || '').localeCompare(a.reqCode || a.id || '')
}

export function useRequirementsPageHandlers3(s: RequirementsVmState) {
  const {
    role, localRequirements,
    submissions = [],
    interviews = [],
    globalSearch, setGlobalSearch, statusDropdown, setStatusDropdown,
    clientDropdown, setClientDropdown,
    dateFilter, setDateFilter,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,
    activeCardFilter, setActiveCardFilter,
    selectedReqIds, setSelectedReqIds,
    sortField = 'reqId', sortOrder = 'desc',
    assigneeScopeIds = '',
    assigneeScopeName = '',
    setAssigneeScopeIds,
    setAssigneeScopeName,
  } = s
  const debouncedSearch = useDebouncedValue(globalSearch, 300)

  const dashboardRequirements = useMemo(() => {
    return localRequirements.filter(r => {
      if (!requirementInAssigneeScope(r, assigneeScopeIds, assigneeScopeName)) return false
      if (!dateFilter || dateFilter === 'All') return true
      const d = getRequirementDate(r)
      if (!d) return false
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      if (dateFilter === 'Today') return d >= startOfToday && d <= endOfToday
      if (dateFilter === 'Yesterday') {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0)
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
        return d >= startOfYesterday && d <= endOfYesterday
      }
      if (dateFilter === 'This week') {
        const day = (now.getDay() + 6) % 7
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0)
        return d >= startOfWeek && d <= endOfToday
      }
      if (dateFilter === 'This month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        return d >= startOfMonth && d <= endOfToday
      }
      if (dateFilter === 'Custom range') {
        let start: Date | null = null
        let end: Date | null = null
        if (customStartDate) {
          const [sY, sM, sD] = customStartDate.split('-').map(Number)
          if (sY && sM && sD) start = new Date(sY, sM - 1, sD, 0, 0, 0, 0)
        }
        if (customEndDate) {
          const [eY, eM, eD] = customEndDate.split('-').map(Number)
          if (eY && eM && eD) end = new Date(eY, eM - 1, eD, 23, 59, 59, 999)
        }
        if (start && d < start) return false
        if (end && d > end) return false
      }
      return true
    })
  }, [localRequirements, dateFilter, customStartDate, customEndDate, assigneeScopeIds, assigneeScopeName])

  const filteredRequirements = useMemo(() => {
    const list = dashboardRequirements.filter(r => {
      // Search query filter (matches Requirement ID, Client Name, Role, Skills, Location, Recruiter, Owner, Emails)
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.trim().toLowerCase()

        const reqId = (r.reqCode || r.id || (r as any)._id || '').toLowerCase()
        const clientReqId = (r.sourceClientJdId || (r as any).clientJdId || '').toLowerCase()
        const matchId = reqId.includes(query) || clientReqId.includes(query)

        const client = (r.client || (r as any).clientName || '').toLowerCase()
        const matchClient = client.includes(query)

        const title = (r.title || (r as any).role || '').toLowerCase()
        const matchTitle = title.includes(query)

        const location = (r.location || '').toLowerCase()
        const matchLocation = location.includes(query)

        const owner = (r.owner || '').toLowerCase()
        const recruiterNames = Array.isArray((r as any).assignedRecruiterNames)
          ? (r as any).assignedRecruiterNames.join(' ').toLowerCase()
          : ''
        const matchOwner = owner.includes(query) || recruiterNames.includes(query)

        const clientEmail = (r.clientEmail || '').toLowerCase()
        const toEmails = Array.isArray(r.toEmails) ? r.toEmails.join(' ').toLowerCase() : ''
        const matchEmail = clientEmail.includes(query) || toEmails.includes(query)

        const lead = (r.assignedLead || '').toLowerCase()
        const matchLead = lead.includes(query)

        const skills = Array.isArray(r.skills)
          ? r.skills.join(' ').toLowerCase()
          : (Array.isArray((r as any).skillsRequired) ? (r as any).skillsRequired.join(' ').toLowerCase() : '')
        const mandatorySkills = Array.isArray(r.mandatorySkills) ? r.mandatorySkills.join(' ').toLowerCase() : ''
        const matchSkills = skills.includes(query) || mandatorySkills.includes(query)

        const description = (r.description || '').toLowerCase()
        const matchDesc = description.includes(query)

        const sourceSubject = ((r as any).sourceSubject || (r as any).subject || '').toLowerCase()
        const matchSubject = sourceSubject.includes(query)

        if (!matchId && !matchClient && !matchTitle && !matchLocation && !matchOwner && !matchEmail && !matchLead && !matchSkills && !matchDesc && !matchSubject) {
          return false
        }
      }

      if (clientDropdown !== 'All') {
        const clientVal = (r.client || (r as any).clientName || '').toLowerCase()
        if (clientVal !== clientDropdown.toLowerCase()) return false
      }

      // KPI card filter takes precedence over the status dropdown so counts match the list.
      // Status dropdown still applies when Total (ALL) is selected.
      if (activeCardFilter !== 'ALL') {
        if (activeCardFilter === 'UNASSIGNED') return isRequirementUnassigned(r)
        if (activeCardFilter === 'ASSIGNED') return isRequirementAssigned(r)
        if (activeCardFilter === 'IN_PROGRESS') return isRequirementInProgress(r)
        if (activeCardFilter === 'SUBMISSIONS') return (r.submissions || 0) > 0
        if (activeCardFilter === 'INTERVIEWS') return (r.interviews || 0) > 0
        if (activeCardFilter === 'SELECTIONS') return requirementHasSelections(r, submissions)
        if (activeCardFilter === 'REJECTIONS') {
          return requirementHasRejection(r, interviews, submissions)
        }
      } else {
        // Status dropdown (All | Unassigned | Assigned | Closed) when no KPI card is active
        if (statusDropdown === 'Unassigned') {
          if (!isRequirementUnassigned(r)) return false
        } else if (statusDropdown === 'Assigned') {
          if (!isRequirementAssigned(r)) return false
        } else if (statusDropdown === 'Closed') {
          if (r.status !== 'Closed' && r.assignmentStatus !== 'Closed') return false
        }
        // 'All' / unknown → no status restriction so date filters can show every match
      }

      return true
    })

    // Dynamic sorting: default to Requirement ID descending (highest sequence first)
    const mult = sortOrder === 'asc' ? -1 : 1
    return [...list].sort((a, b) => {
      if (sortField === 'reqId') {
        return compareRequirementsDescending(a, b) * mult
      } else if (sortField === 'client') {
        const cA = a.client || ''
        const cB = b.client || ''
        const comp = cA.localeCompare(cB)
        if (comp !== 0) return comp * (sortOrder === 'asc' ? 1 : -1)
        return compareRequirementsDescending(a, b) * mult
      } else if (sortField === 'role') {
        const rA = a.title || ''
        const rB = b.title || ''
        const comp = rA.localeCompare(rB)
        if (comp !== 0) return comp * (sortOrder === 'asc' ? 1 : -1)
        return compareRequirementsDescending(a, b) * mult
      } else if (sortField === 'arrivedTime') {
        const timeA = getRequirementTimestamp(a)
        const timeB = getRequirementTimestamp(b)
        if (timeB !== timeA) return (timeB - timeA) * mult
        return compareRequirementsDescending(a, b) * mult
      }
      return compareRequirementsDescending(a, b) * mult
    })
  }, [dashboardRequirements, debouncedSearch, statusDropdown, clientDropdown, activeCardFilter, sortField, sortOrder, submissions, interviews])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusDropdown, clientDropdown, dateFilter, customStartDate, customEndDate, activeCardFilter])

  const paginatedRequirements = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRequirements.slice(start, start + pageSize)
  }, [filteredRequirements, currentPage, pageSize])

  const selectablePaginatedReqs = useMemo(() => {
    return paginatedRequirements.filter(r => r.status !== 'Hold' && r.status !== 'On Hold')
  }, [paginatedRequirements])

  const isAllSelected =
    selectablePaginatedReqs.length > 0 &&
    selectablePaginatedReqs.every(r => selectedReqIds.has(r.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedReqIds(new Set())
    } else {
      setSelectedReqIds(new Set(selectablePaginatedReqs.map(r => r.id)))
    }
  }

  const toggleSelectRow = (id: string) => {
    const target = localRequirements.find(r => r.id === id)
    if (target && (target.status === 'Hold' || target.status === 'On Hold')) {
      return
    }
    const next = new Set(selectedReqIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedReqIds(next)
  }

  const handleResetFilters = () => {
    setGlobalSearch('')
    setStatusDropdown('All')
    setClientDropdown('All')
    setDateFilter('All')
    setCustomStartDate('')
    setCustomEndDate('')
    setAssigneeScopeIds?.('')
    setAssigneeScopeName?.('')
    setActiveCardFilter('ALL')
    setCurrentPage(1)
  }

  const roleLabel =
    role === 'superadmin' || role === 'devteam'
      ? 'Super Admin View'
      : role === 'admin'
        ? 'Admin View'
        : role === 'lead'
          ? 'Team Lead View'
          : 'Recruiter View'

  const [isEditingDemand, setIsEditingDemand] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return Boolean(window.sessionStorage.getItem('mrap_req_editing_demand_id_v1'))
    } catch {
      return false
    }
  })
  const [editingReq, setEditingReq] = useState<Requirement | null>(null)

  // After refresh, re-open the same requirement edit form once requirements load
  useEffect(() => {
    let editingId: string | null = null
    try {
      editingId = window.sessionStorage.getItem('mrap_req_editing_demand_id_v1')
    } catch {
      editingId = null
    }
    if (!editingId) return
    if (editingReq?.id === editingId) return
    const found =
      localRequirements.find(r => String(r.id) === editingId || String((r as any).reqCode || '') === editingId) ||
      null
    if (found) {
      setEditingReq(found)
      setIsEditingDemand(true)
    }
  }, [localRequirements, editingReq?.id])

  useEffect(() => {
    try {
      if (isEditingDemand && editingReq?.id) {
        window.sessionStorage.setItem('mrap_req_editing_demand_id_v1', String(editingReq.id))
      } else if (!isEditingDemand) {
        window.sessionStorage.removeItem('mrap_req_editing_demand_id_v1')
      }
    } catch {
      // ignore
    }
  }, [isEditingDemand, editingReq?.id])

  const pendingRevokeRequests = useMemo(() => {
    return localRequirements.filter(r => r.revokeRequested)
  }, [localRequirements])

  return {
    filteredRequirements, dashboardRequirements, currentPage, setCurrentPage, pageSize, setPageSize,
    paginatedRequirements, isAllSelected, toggleSelectAll, toggleSelectRow, handleResetFilters,
    roleLabel, isEditingDemand, setIsEditingDemand, editingReq, setEditingReq, pendingRevokeRequests
  }
}
