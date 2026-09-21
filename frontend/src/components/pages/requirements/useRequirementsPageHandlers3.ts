import { useMemo, useState } from 'react'
import { Requirement } from '../../../types'
import type { RequirementsVmState } from './useRequirementsPageState'

export function useRequirementsPageHandlers3(s: RequirementsVmState) {
  const {
    role, localRequirements,
    globalSearch, setGlobalSearch, statusDropdown, setStatusDropdown,
    clientDropdown, setClientDropdown, activeCardFilter, setActiveCardFilter,
    selectedReqIds, setSelectedReqIds
  } = s

  const filteredRequirements = useMemo(() => {
    return localRequirements.filter(r => {
      if (globalSearch.trim()) {
        const query = globalSearch.trim().toLowerCase()
        const matchId = r.id.toLowerCase().includes(query)
        const matchClient = r.client.toLowerCase().includes(query)
        const matchTitle = r.title.toLowerCase().includes(query)
        const matchLocation = (r.location || '').toLowerCase().includes(query)
        const matchOwner = (r.owner || '').toLowerCase().includes(query)
        const matchEmail = (r.clientEmail || '').toLowerCase().includes(query)
        const matchLead = (r.assignedLead || '').toLowerCase().includes(query)
        const matchSkills = (r.skills || []).some(skill => skill.toLowerCase().includes(query))

        if (!matchId && !matchClient && !matchTitle && !matchLocation && !matchOwner && !matchEmail && !matchLead && !matchSkills) {
          return false
        }
      }

      if (clientDropdown !== 'All') {
        if (r.client !== clientDropdown) return false
      }

      if (statusDropdown !== 'All') {
        if (statusDropdown === 'Unassigned') {
          if (r.owner && r.owner !== 'Unassigned' && r.assignmentStatus !== 'Unassigned') return false
        } else if (statusDropdown === 'Assigned') {
          if (!r.owner || r.owner === 'Unassigned' || r.assignmentStatus === 'Unassigned') return false
        } else if (statusDropdown === 'Submitted' || statusDropdown === 'Submitted to Lead' || statusDropdown === 'Submitted to Client') {
          if ((r.submissions || 0) === 0) return false
        } else if (statusDropdown === 'Interview') {
          if ((r.interviews || 0) === 0) return false
        } else if (statusDropdown === 'Selected') {
          if ((r.placed || r.selections || 0) === 0) return false
        } else if (statusDropdown === 'Rejected') {
          if ((r.rejections || 0) === 0) return false
        } else if (statusDropdown === 'Closed') {
          if (r.status !== 'Closed' && r.assignmentStatus !== 'Closed') return false
        }
      }

      if (activeCardFilter === 'UNASSIGNED') {
        return !r.owner || r.owner === 'Unassigned'
      } else if (activeCardFilter === 'ASSIGNED') {
        return r.owner && r.owner !== 'Unassigned'
      } else if (activeCardFilter === 'IN_PROGRESS') {
        return r.status === 'Active' || r.assignmentStatus === 'In Progress'
      } else if (activeCardFilter === 'SUBMISSIONS') {
        return r.submissions > 0
      } else if (activeCardFilter === 'INTERVIEWS') {
        return r.interviews > 0
      } else if (activeCardFilter === 'SELECTIONS') {
        return (r.placed || r.selections || 0) > 0
      } else if (activeCardFilter === 'REJECTIONS') {
        return (r.rejections || 0) > 0
      }

      return true
    })
  }, [localRequirements, globalSearch, statusDropdown, clientDropdown, activeCardFilter])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const paginatedRequirements = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRequirements.slice(start, start + pageSize)
  }, [filteredRequirements, currentPage, pageSize])

  const isAllSelected =
    paginatedRequirements.length > 0 &&
    paginatedRequirements.every(r => selectedReqIds.has(r.id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedReqIds(new Set())
    } else {
      setSelectedReqIds(new Set(paginatedRequirements.map(r => r.id)))
    }
  }

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedReqIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedReqIds(next)
  }

  const handleResetFilters = () => {
    setGlobalSearch('')
    setStatusDropdown('Unassigned')
    setClientDropdown('All')
    setActiveCardFilter('ALL')
  }

  const roleLabel =
    role === 'superadmin' || role === 'devteam'
      ? 'Super Admin View'
      : role === 'admin'
        ? 'Admin View'
        : role === 'lead'
          ? 'Team Lead View'
          : 'Recruiter View'

  const [isEditingDemand, setIsEditingDemand] = useState(false)
  const [editingReq, setEditingReq] = useState<Requirement | null>(null)

  const pendingRevokeRequests = useMemo(() => {
    return localRequirements.filter(r => r.revokeRequested)
  }, [localRequirements])

  return {
    filteredRequirements, currentPage, setCurrentPage, pageSize, setPageSize,
    paginatedRequirements, isAllSelected, toggleSelectAll, toggleSelectRow, handleResetFilters,
    roleLabel, isEditingDemand, setIsEditingDemand, editingReq, setEditingReq, pendingRevokeRequests
  }
}
