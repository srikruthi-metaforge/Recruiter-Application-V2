import React, { useMemo, useState } from 'react'
import { Requirement } from '../../../types'
import { getSessionUser } from '../../../store/session'
import { ownsByRecruiter } from '../../../utils/recruiterOwnership'
import { matchesSubmissionStatusFilter } from '../../../utils/submissionStatusFilter'
import type { ScreenshotSubmission } from './preamble'
import type { SubmissionsVmState } from './useSubmissionsPageState'

function submissionOwnerFields(item: ScreenshotSubmission) {
  const raw = item.raw || {}
  const recruiterId =
    typeof raw.recruiterId === 'object' && raw.recruiterId
      ? String(raw.recruiterId._id || raw.recruiterId.id || '')
      : String(raw.recruiterId || '')
  const recruiterEmail =
    String(raw.recruiterEmail || (typeof raw.recruiterId === 'object' ? raw.recruiterId?.email : '') || '')
      .trim()
  return {
    id: recruiterId,
    email: recruiterEmail,
    name: item.submittedBy || raw.recruiter || raw.recruiterName || '',
  }
}

export function getSubmissionTimestamp(item: ScreenshotSubmission): number {
  const raw = item.raw || {}
  const rawDate = raw.updatedAt || raw.submittedAt || raw.createdAt || item.submittedOn || raw.date
  if (rawDate) {
    const t = new Date(rawDate).getTime()
    if (!isNaN(t) && t > 0) return t
  }
  const idMatch = (item.id || item.submissionId || '').match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (idMatch) {
    const d = new Date(`${idMatch[1]}-${idMatch[2].padStart(2, '0')}-${idMatch[3].padStart(2, '0')}`).getTime()
    if (!isNaN(d)) return d
  }
  return 0
}

export function useSubmissionsPageHandlers1(s: SubmissionsVmState) {
  const {
    role, submissions, requirements, onUpdateRequirements,
    searchQuery, dateFilter, customStartDate, customEndDate,
    setSelectedReqDetail, targetSubForInterview, setTargetSubForInterview, submissionsList,
    setSubmissionsList, showToast, clientFilter, statusFilter, recruiterFilter,
    includeAllMySubmissions,
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
      const targetReqId = targetSubForInterview?.reqId || ''
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

    const emailNotice = data?.emailSent ? ` Invite email sent to ${data.candidateEmail || 'candidate'}.` : ''
    const waNotice = data?.whatsappSent ? ' WhatsApp link opened.' : ''
    showToast(`Interview scheduled! Candidate status updated to "${scheduledStatus}".${emailNotice}${waNotice}`)
    setTargetSubForInterview(null)
  }

  const handleOpenReqOverview = (reqId: string, position: string, company: string) => {
    const existing = requirements.find(r => r.id === reqId || r.title === position)
    if (existing) {
      setSelectedReqDetail(existing)
    } else {
      setSelectedReqDetail({ id: reqId, title: position, client: company, company } as any)
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
    const session = getSessionUser()
    const activeRecruiterName = (s.currentUserName || session?.name || '').trim().toLowerCase()
    const activeRecruiterId = session?.id || ''
    const activeRecruiterEmail = (session?.email || '').trim().toLowerCase()

    if (role === 'lead') {
      return submissionsList.filter(item => {
        const by = (item.submittedBy || '').toLowerCase().trim()
        const rawLead = item.raw?.leadId
        const leadId = String(
          (rawLead && typeof rawLead === 'object' ? (rawLead as any)._id || (rawLead as any).id : rawLead) ||
            '',
        ).trim()
        const leadEmail = String(
          (rawLead && typeof rawLead === 'object' ? (rawLead as any).email : '') ||
            item.raw?.leadEmail ||
            item.raw?.leadName ||
            '',
        )
          .toLowerCase()
          .trim()
        const assignedToMe =
          (activeRecruiterId && leadId && leadId === String(activeRecruiterId)) ||
          (activeRecruiterEmail && leadEmail && leadEmail === activeRecruiterEmail)

        const submittedByMe = ownsByRecruiter(submissionOwnerFields(item), {
          id: activeRecruiterId,
          email: activeRecruiterEmail,
          name: activeRecruiterName,
        })

        const pendingForLead =
          (item.status || '').toLowerCase().includes('submitted to lead') ||
          ((item.leadApprovalStatus || '').toLowerCase() === 'pending' &&
            (item.status || '').toLowerCase().includes('lead'))

        if (scopeTab === 'my_submissions') {
          // Lead review queue + own pipeline rows (e.g. Offered/Placed she submitted as recruiter).
          if (assignedToMe) return true
          if (pendingForLead) return true
          if (submittedByMe) return true
          return false
        }
        if (scopeTab === 'team_members') {
          return !submittedByMe
        }
        return true
      })
    }

    if (role === 'recruiter') {
      // Same ownership rule as My Workspace Total Submissions KPI (id → email → name).
      // Do not include leadId-only rows from the API list — those inflate Reports vs My Work.
      const me = {
        id: activeRecruiterId,
        email: activeRecruiterEmail,
        name: activeRecruiterName,
      }
      return submissionsList.filter(item => ownsByRecruiter(submissionOwnerFields(item), me))
    }

    return submissionsList
  }, [submissionsList, role, scopeTab, s.currentUserName, includeAllMySubmissions])

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

  // Unique recruiters from SUBMITTED BY for admin/superadmin filter
  const recruiterOptions = useMemo(() => {
    const names = new Set<string>()
    scopeSubmissions.forEach(item => {
      const name = String(item.submittedBy || '').trim()
      if (name) names.add(name)
    })
    return Array.from(names).sort((a, b) => a.localeCompare(b))
  }, [scopeSubmissions])

  const recruiterCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    scopeSubmissions.forEach(item => {
      const name = String(item.submittedBy || '').trim() || 'Unknown'
      counts[name] = (counts[name] || 0) + 1
    })
    return counts
  }, [scopeSubmissions])

  // Base list for KPI cards: apply search/date/client/recruiter, but NOT status.
  // Status KPI clicks only filter the table — they must not rewrite the summary numbers.
  const kpiBaseData = useMemo(() => {
    const list = scopeSubmissions.filter(item => {
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

      if (dateFilter && dateFilter !== 'All') {
        const rawDate = item.submittedOn || ''
        if (!rawDate) return false
        const d = new Date(rawDate)
        if (isNaN(d.getTime())) return false

        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

        if (dateFilter === 'Today') {
          if (d < startOfToday || d > endOfToday) return false
        } else if (dateFilter === 'Yesterday') {
          const startOfYesterday = new Date(startOfToday.getTime() - 86400000)
          const endOfYesterday = new Date(endOfToday.getTime() - 86400000)
          if (d < startOfYesterday || d > endOfYesterday) return false
        } else if (dateFilter === 'This week') {
          const day = (now.getDay() + 6) % 7
          const startOfWeek = new Date(startOfToday.getTime() - day * 86400000)
          if (d < startOfWeek || d > endOfToday) return false
        } else if (dateFilter === 'This month') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          if (d < startOfMonth || d > endOfToday) return false
        } else if (dateFilter === 'Custom range') {
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

      if (clientFilter !== 'All') {
        if (item.clientName?.toLowerCase() !== clientFilter.toLowerCase()) {
          return false
        }
      }

      if (recruiterFilter !== 'All') {
        if ((item.submittedBy || '').trim().toLowerCase() !== recruiterFilter.trim().toLowerCase()) {
          return false
        }
      }

      return true
    })

    return [...list].sort((a, b) => {
      const timeA = getSubmissionTimestamp(a)
      const timeB = getSubmissionTimestamp(b)
      if (timeB !== timeA) return timeB - timeA
      return (b.id || '').localeCompare(a.id || '')
    })
  }, [
    scopeSubmissions,
    searchQuery,
    dateFilter,
    customStartDate,
    customEndDate,
    clientFilter,
    recruiterFilter,
  ])

  // Table list: same base filters + status filter
  const filteredData = useMemo(() => {
    const interviewIds = s.interviewSubmissionIds || new Set<string>()
    const offerIds = s.offerSubmissionIds || new Set<string>()
    return kpiBaseData.filter(item => {
      const idKeys = [
        String(item.id || ''),
        String(item.submissionId || ''),
        String(item.raw?._id || ''),
        String(item.raw?.id || ''),
        String(item.raw?.submissionId || ''),
      ].filter(Boolean)
      const hasInterview = idKeys.some(k => interviewIds.has(k))
      const hasOffer = idKeys.some(k => offerIds.has(k))
      return matchesSubmissionStatusFilter(item.status, statusFilter, { hasInterview, hasOffer })
    })
  }, [kpiBaseData, statusFilter, s.interviewSubmissionIds, s.offerSubmissionIds])

  return {
    handleScheduleSuccess, handleOpenReqOverview, scopeSubmissions, clientOptions,
    clientCounts, recruiterOptions, recruiterCounts, kpiBaseData, filteredData, reasons, setReasons, scopeTab, setScopeTab
  }
}
