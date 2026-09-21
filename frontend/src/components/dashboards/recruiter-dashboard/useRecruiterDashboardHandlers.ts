import React from 'react'
import { ActiveReqRow, DEFAULT_ACTIVE_REQS } from './preamble'
import type { RecruiterDashboardVmState } from './useRecruiterDashboardState'

export function useRecruiterDashboardHandlers(s: RecruiterDashboardVmState) {
  const {
    submissions, interviews, requirements, selectedReqForDetail,
    setSelectedReqForDetail, setIsAssignModalOpen, isAssignMyselfChecked, setIsAssignMyselfChecked,
    selectedRecruiterNames, setSelectedRecruiterNames, recruiterSearchQuery, setRecruiterSearchQuery,
    setInlineReqId, searchQuery, statusFilter, currentPage, pageSize, recentSubmissionsFilter
  } = s
  const handleOpenInlineCandidateRepo = (reqId: string) => {
    setInlineReqId(reqId)
    setTimeout(() => {
      const el = document.getElementById('inline-candidate-repo-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleOpenReqOverview = (reqId: string, reqName?: string, reqClient?: string) => {
    const found = requirements.find(r => r.id === reqId) || {
      id: reqId,
      client: reqClient || 'harish',
      title: reqName || 'Implement and support SAP Transportation Management solutions in S 4HANA',
      priority: 'Medium' as const,
      status: 'Active' as const,
      assignmentStatus: 'Assigned' as const,
      owner: 'Harish Gadipally',
      submissions: 7,
      interviews: 0,
      placed: 0,
      rejections: 0,
      clientEmail: reqClient || 'harish',
      clientPhone: '+91 98765 43210',
      location: 'Remote, Hybrid, Onsite',
      openings: 1,
      dueDate: '2026-06-19',
      emailArrivedTime: 'Jun 19, 2026, 05:30 AM',
      budget: '₹5,000,000',
    }
    setSelectedReqForDetail(found)
  }

  const recruiterList = [
    { id: '1', name: 'Adirala sathvika', email: 'No email' },
    { id: '2', name: 'Arvind GR', email: 'arvind.gr@metaforgeit.com' },
    { id: '3', name: 'Charlie Darwin', email: 'charlie@metaforgeit.com' },
    { id: '4', name: 'Harini Sindey', email: 'harini.s@metaforgeit.com' },
    { id: '5', name: 'Harish Gadipally', email: 'harish.g@metaforgeit.com' },
    { id: '6', name: 'Puttapaka Saiteja', email: 'saiteja.p@metaforgeit.com' },
    { id: '7', name: 'Kallol Chakraborty', email: 'kallol.c@ltts.com' },
  ]

  const filteredRecruiterList = recruiterList.filter(
    r =>
      !recruiterSearchQuery.trim() ||
      r.name.toLowerCase().includes(recruiterSearchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(recruiterSearchQuery.toLowerCase())
  )

  const totalSelectedRecruitersCount = (isAssignMyselfChecked ? 1 : 0) + selectedRecruiterNames.size

  const toggleRecruiterSelection = (name: string) => {
    const next = new Set(selectedRecruiterNames)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    setSelectedRecruiterNames(next)
  }

  const handleConfirmReassign = () => {
    const assignees: string[] = []
    if (isAssignMyselfChecked) assignees.push('Harish Gadipally')
    selectedRecruiterNames.forEach(n => assignees.push(n))

    if (assignees.length === 0) return

    const assigneesText = assignees.join(', ')

    if (selectedReqForDetail) {
      setSelectedReqForDetail({
        ...selectedReqForDetail,
        owner: assigneesText,
        assignmentStatus: 'Assigned',
        submissions: selectedReqForDetail.submissions || 7,
      })
    }

    setIsAssignModalOpen(false)
    setSelectedRecruiterNames(new Set())
    setIsAssignMyselfChecked(true)
    setRecruiterSearchQuery('')
  }

  const assignedRequirements = requirements.filter(
    r => r.owner && r.owner !== 'Unassigned' && r.assignmentStatus !== 'Unassigned'
  )

  const activeReqRows: ActiveReqRow[] = assignedRequirements.length > 0
    ? assignedRequirements.map(r => ({
        type: 'Requirement',
        id: r.id,
        name: r.title,
        client: r.client,
        status: r.assignmentStatus || 'Assigned',
        timestamp: r.dueDate ? `${r.dueDate}, 07:29 PM` : 'Jun 19, 2026, 07:29 PM',
      }))
    : DEFAULT_ACTIVE_REQS.filter(r => r.status !== 'Unassigned')

  const filteredReqs = activeReqRows.filter(req => {
    if (req.status.toLowerCase() === 'unassigned') return false
    const q = searchQuery.trim().toLowerCase()
    const matchesQuery = !q || req.client.toLowerCase().includes(q) || req.id.toLowerCase().includes(q) || req.name.toLowerCase().includes(q)
    const filterLower = statusFilter.toLowerCase().trim()
    let matchesStatus = true
    if (filterLower === 'assigned') {
      matchesStatus = req.status.toLowerCase().includes('assign') || req.status.toLowerCase() === 'active' || req.status.toLowerCase() === 'open'
    } else if (filterLower === 'submitted') {
      matchesStatus = req.status.toLowerCase().includes('submit')
    } else if (filterLower === 'selected for interview') {
      matchesStatus = req.status.toLowerCase().includes('interview') || req.status.toLowerCase().includes('select')
    }
    return matchesQuery && matchesStatus
  })

  const paginatedReqs = filteredReqs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const filteredSubmissions = submissions.filter(sub => {
    if (recentSubmissionsFilter === 'All Status' || recentSubmissionsFilter === 'All') return true
    return sub.stage.toLowerCase() === recentSubmissionsFilter.toLowerCase()
  })

  return {
    handleOpenInlineCandidateRepo, handleOpenReqOverview, recruiterList, filteredRecruiterList,
    totalSelectedRecruitersCount, toggleRecruiterSelection, handleConfirmReassign,
    assignedRequirements, activeReqRows, filteredReqs, paginatedReqs, filteredSubmissions
  }
}
