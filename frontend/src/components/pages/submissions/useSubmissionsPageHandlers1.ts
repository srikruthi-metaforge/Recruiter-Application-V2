import React, { useMemo, useState } from 'react'
import { Requirement } from '../../../types'
import type { SubmissionsVmState } from './useSubmissionsPageState'

export function useSubmissionsPageHandlers1(s: SubmissionsVmState) {
  const {
    role, submissions, requirements, onUpdateRequirements,
    searchQuery, dateFilter, customStartDate, customEndDate,
    setSelectedReqDetail, targetSubForInterview, setTargetSubForInterview, submissionsList,
    setSubmissionsList, showToast, clientFilter, statusFilter
  } = s
  const handleScheduleSuccess = (data: any) => {
    const scheduledStatus = data.interviewRound ? `${data.interviewRound} Scheduled` : 'Interview Scheduled'

    // Update status in Submissions table
    setSubmissionsList(prev =>
      prev.map(item => {
        if (targetSubForInterview && item.id === targetSubForInterview.id) {
          return { ...item, status: scheduledStatus }
        }
        if (data.submission && data.submission.includes(item.candidateName)) {
          return { ...item, status: scheduledStatus }
        }
        return item
      })
    )

    // Update Requirement status and Recruitment Progress step if callback exists
    if (onUpdateRequirements && requirements.length > 0) {
      const targetReqId = targetSubForInterview?.reqId || 'REQ-2026-08-12-001'
      const updatedReqs: Requirement[] = requirements.map(r => {
        if (r.id === targetReqId) {
          return {
            ...r,
            interviews: (r.interviews || 0) + 1,
            stage: 'Interview Scheduled',
          } as Requirement
        }
        return r
      })
      onUpdateRequirements(updatedReqs)
    }

    showToast(`Interview scheduled! Candidate status updated to "${scheduledStatus}" in table and recruitment progress.`)
    setTargetSubForInterview(null)
  }

  const handleOpenReqOverview = (reqId: string, position: string, company: string) => {
    const existing = requirements.find(r => r.id === reqId || r.title === position)
    if (existing) {
      setSelectedReqDetail(existing)
    } else {
      setSelectedReqDetail({
        id: reqId,
        title: position,
        client: company,
        company: company,
        status: 'Interview Scheduled',
        createdDate: '12 Aug 2026',
        submissionsCount: 7,
        interviewsCount: 3,
        owner: 'Harish Gadipally',
        assignedRecruiter: 'Harish Gadipally',
        experienceRequired: '5 - 10 Years',
        location: 'Hyderabad / Remote',
        salaryRange: '₹18 - ₹28 LPA',
        skills: ['.NET Core', 'C#', 'SQL Server', 'Microservices', 'Azure'],
        description: `Requirement details for ${position} at ${company}. Full job overview, candidate pipeline, and submission history.`,
      } as any)
    }
  }

  // Rejection reasons map (read-only in table column, set via candidate profile modal)
  const [reasons, setReasons] = useState<Record<string, string>>({
    'SUB-005': 'Notice period > 60 days',
    'SUB-007': 'Expected CTC exceeds approved budget limit',
  })

  // Scope filter: 'my_submissions' (lead only), 'team_members' (members only), 'all' (members + lead)
  const [scopeTab, setScopeTab] = useState<'my_submissions' | 'team_members' | 'all'>('my_submissions')

  // Scope submissions data for team lead and recruiter roles
  const scopeSubmissions = useMemo(() => {
    if (role === 'lead') {
      return submissionsList.filter(item => {
        const by = item.submittedBy.toLowerCase()
        if (scopeTab === 'my_submissions') {
          return by.includes('harish') || by.includes('lead')
        }
        if (scopeTab === 'team_members') {
          return !by.includes('harish') && !by.includes('lead')
        }
        return true
      })
    }
    if (role === 'recruiter') {
      return submissionsList.filter(item => {
        const by = item.submittedBy.toLowerCase()
        return by.includes('marcus') || by === 'marcus chen'
      })
    }
    return submissionsList
  }, [submissionsList, role, scopeTab])

  // Extract unique client names dynamically for the client-wise filter dropdown
  const clientOptions = useMemo(() => {
    const clientsSet = new Set<string>()
    scopeSubmissions.forEach(item => {
      if (item.clientName) {
        clientsSet.add(item.clientName)
      }
    })
    return Array.from(clientsSet).sort()
  }, [scopeSubmissions])

  // Map submission counts per client for stats & quick filter pills
  const clientCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    scopeSubmissions.forEach(item => {
      const client = item.clientName || 'Unknown Client'
      counts[client] = (counts[client] || 0) + 1
    })
    return counts
  }, [scopeSubmissions])

  // Dynamic filter
  const filteredData = useMemo(() => {
    return scopeSubmissions.filter(item => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchCandidate = item.candidateName.toLowerCase().includes(q)
        const matchCompany = item.currentCompany.toLowerCase().includes(q)
        const matchReq = item.requirement.toLowerCase().includes(q)
        const matchRecruiter = item.submittedBy.toLowerCase().includes(q)
        const matchClient = (item.clientName || '').toLowerCase().includes(q)

        if (!matchCandidate && !matchCompany && !matchReq && !matchRecruiter && !matchClient) {
          return false
        }
      }

      // Date filter
      const d = item.submittedOn || ''
      if (dateFilter !== 'All') {
        if (dateFilter === 'Today') {
          if (!d.includes('Aug 17') && !d.includes('Today')) return false
        } else if (dateFilter === 'Yesterday') {
          if (!d.includes('Aug 16') && !d.includes('Yesterday')) return false
        } else if (dateFilter === 'This week' || dateFilter === 'This month') {
          if (!d.includes('Aug')) return false
        } else if (dateFilter === 'Custom range') {
          if (customStartDate && d < customStartDate) return false
          if (customEndDate && d > customEndDate) return false
        }
      }

      if (clientFilter !== 'All') {
        if (item.clientName?.toLowerCase() !== clientFilter.toLowerCase()) {
          return false
        }
      }

      const itemStatus = item.status.toLowerCase().trim()
      const filterVal = statusFilter.toLowerCase().trim()

      if (filterVal !== 'all') {
        if (filterVal === 'submitted to lead') {
          if (!itemStatus.includes('lead') && !itemStatus.includes('submit')) return false
        } else if (filterVal === 'interview scheduled') {
          if (!itemStatus.includes('interview')) return false
        } else if (filterVal === 'selected') {
          if (!itemStatus.includes('select')) return false
        } else if (filterVal === 'placed') {
          if (!itemStatus.includes('place')) return false
        } else if (filterVal === 'rejected') {
          if (!itemStatus.includes('reject')) return false
        }
      }

      return true
    })
  }, [
    scopeSubmissions,
    searchQuery,
    dateFilter,
    customStartDate,
    customEndDate,
    clientFilter,
    statusFilter,
  ])

  return {
    handleScheduleSuccess, handleOpenReqOverview, scopeSubmissions, clientOptions,
    clientCounts, filteredData, reasons, setReasons, scopeTab, setScopeTab
  }
}
