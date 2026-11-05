import type { SubmissionsPageProps, ScreenshotSubmission } from './preamble'
import { mapBackendSubmission, apiErrorMessage } from './preamble'
import { Requirement } from '../../../types'
import { useState, useEffect, useCallback } from 'react'
import React from 'react'
import { interviewsService, offersService, submissionsService } from '../../../services/workspace.service'
import { saveSubmissionsStore } from '../../../data/submissionsStore'

function collectLinkedSubmissionIds(rows: any[]): Set<string> {
  const ids = new Set<string>()
  for (const row of rows) {
    const raw = row?.submissionId
    const sid =
      (typeof raw === 'object' && raw
        ? String(raw._id || raw.id || raw.submissionId || '')
        : String(raw || '')) || ''
    const businessId =
      typeof raw === 'object' && raw ? String(raw.submissionId || '') : ''
    if (sid) ids.add(sid)
    if (businessId) ids.add(businessId)
  }
  return ids
}

export function useSubmissionsPageState(props: SubmissionsPageProps) {
  const {
    role,
    currentUserName,
    submissions = [],
    requirements = [],
    interviews = [],
    onOpenSubmitCandidate,
    onUpdateRequirements,
    includeAllMySubmissions = false,
    preferPropSubmissions,
    initialStatusFilter = 'All',
  }: SubmissionsPageProps = props as SubmissionsPageProps & Record<string, never>

  const usePropSubmissions =
    preferPropSubmissions === true ||
    includeAllMySubmissions ||
    (preferPropSubmissions !== false && Array.isArray(submissions) && submissions.length > 0)

  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('All')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => {
    try {
      const pending = sessionStorage.getItem('pending_submissions_status')
      if (pending) {
        sessionStorage.removeItem('pending_submissions_status')
        return pending
      }
    } catch {
      // ignore
    }
    return initialStatusFilter || 'All'
  })
  const [clientFilter, setClientFilter] = useState('All')
  const [recruiterFilter, setRecruiterFilter] = useState(() => {
    try {
      const pending = sessionStorage.getItem('pending_submissions_recruiter')
      if (pending) {
        sessionStorage.removeItem('pending_submissions_recruiter')
        return pending
      }
    } catch {
      // ignore
    }
    return 'All'
  })
  const [selectedSub, setSelectedSub] = useState<ScreenshotSubmission | null>(null)

  // Analytics KPI deep-link → status / recruiter filters (match My Workspace Onboarding).
  useEffect(() => {
    const applyPending = () => {
      try {
        const status = sessionStorage.getItem('pending_submissions_status')
        const recruiter = sessionStorage.getItem('pending_submissions_recruiter')
        if (status) {
          setStatusFilter(status)
          sessionStorage.removeItem('pending_submissions_status')
        }
        if (recruiter) {
          setRecruiterFilter(recruiter)
          sessionStorage.removeItem('pending_submissions_recruiter')
        }
      } catch {
        // ignore
      }
    }
    applyPending()
    window.addEventListener('notification_navigate', applyPending as EventListener)
    return () => window.removeEventListener('notification_navigate', applyPending as EventListener)
  }, [])

  const [selectedReqDetail, setSelectedReqDetail] = useState<Requirement | null>(null)
  const [isEditingReq, setIsEditingReq] = useState(false)
  const [editingReq, setEditingReq] = useState<Requirement | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  /** Submission ids that have ≥1 interview — powers Went for Interview filter accurately. */
  const [interviewSubmissionIds, setInterviewSubmissionIds] = useState<Set<string>>(() => new Set())
  /** Submission ids that have ≥1 offer — powers Selected / Offered when stage lags behind. */
  const [offerSubmissionIds, setOfferSubmissionIds] = useState<Set<string>>(() => new Set())

  // Interview Schedule Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [targetSubForInterview, setTargetSubForInterview] = useState<ScreenshotSubmission | null>(null)

  // Submissions List State
  const [submissionsList, setSubmissionsList] = useState<ScreenshotSubmission[]>(() => {
    if (submissions && submissions.length > 0) {
      const mapped = submissions.map(s => mapBackendSubmission(s))
      return mapped
    }
    return []
  })

  useEffect(() => {
    if (!Array.isArray(submissions)) return
    // Keep My Workspace list in sync with the KPI-scoped props (including lead submissions).
    if (includeAllMySubmissions || submissions.length > 0) {
      setSubmissionsList(submissions.map(s => mapBackendSubmission(s)))
    }
  }, [submissions, includeAllMySubmissions])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Load backend submissions (skip when parent already scoped / provided the list).
  const reloadSubmissions = useCallback(async () => {
    if (usePropSubmissions) {
      // Keep KPI/Reports-scoped props — do not replace with full API dump.
      setSubmissionsList(submissions.map(s => mapBackendSubmission(s)))
      return
    }
    setIsLoading(true)
    try {
      const data = await submissionsService.list()
      if (Array.isArray(data)) {
        const mapped = data.map(s => mapBackendSubmission(s))
        setSubmissionsList(mapped)
        if (mapped.length > 0) {
          saveSubmissionsStore(mapped as any, { silent: true })
        }
        if (selectedSub) {
          const updatedSelected = mapped.find(m => m.id === selectedSub.id || m.submissionId === selectedSub.id)
          if (updatedSelected) {
            setSelectedSub(updatedSelected)
          }
        }
      }
    } catch (err) {
      showToast(apiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [selectedSub, usePropSubmissions, submissions])

  // Prefer workspace interview props for filter ids; avoid listing /interviews on Reports open.
  // Defer offers slightly so the submissions table paints before secondary link fetches.
  useEffect(() => {
    let active = true
    if (Array.isArray(interviews) && interviews.length > 0) {
      setInterviewSubmissionIds(collectLinkedSubmissionIds(interviews))
    }
    const loadLinkSets = async () => {
      try {
        const needInterviews = !(Array.isArray(interviews) && interviews.length > 0)
        if (needInterviews) {
          const ivData = await interviewsService.list().catch(() => null)
          if (!active) return
          if (Array.isArray(ivData)) {
            setInterviewSubmissionIds(collectLinkedSubmissionIds(ivData))
          }
        }
        const offerData = await offersService.list().catch(() => null)
        if (!active) return
        if (Array.isArray(offerData)) {
          setOfferSubmissionIds(collectLinkedSubmissionIds(offerData))
        }
      } catch {
        // Filters still work on stage text alone if link APIs fail.
      }
    }
    const timer = window.setTimeout(() => {
      void loadLinkSets()
    }, 350)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [interviews])

  useEffect(() => {
    // Reports / My Workspace already pass submissions — skip GET /submissions storm on tab open.
    if (usePropSubmissions) return

    let active = true
    const fetchInit = async () => {
      try {
        const data = await submissionsService.list()
        if (active && Array.isArray(data)) {
          const mapped = data.map(s => mapBackendSubmission(s))
          if (mapped.length > 0) {
            setSubmissionsList(mapped)
            saveSubmissionsStore(mapped as any, { silent: true })
          }
        }
      } catch (err) {
        if (active) {
          showToast(apiErrorMessage(err))
        }
      }
    }
    fetchInit()

    const handleSubmissionsUpdated = () => {
      reloadSubmissions()
    }
    window.addEventListener('submissions_updated', handleSubmissionsUpdated)

    return () => {
      active = false
      window.removeEventListener('submissions_updated', handleSubmissionsUpdated)
    }
  }, [reloadSubmissions, usePropSubmissions])

  const applySubmissionPatch = (id: string, updated: any, fallbackStage?: string) => {
    const mapped = mapBackendSubmission(
      updated || { id, stage: fallbackStage || 'Submitted to Client', rejectionReason: '' },
    )
    const matches = (row: ScreenshotSubmission) =>
      row.id === id || row.submissionId === id || String(row.raw?._id || '') === id
    setSubmissionsList(prev => prev.map(row => (matches(row) ? { ...row, ...mapped, id: row.id } : row)))
    setSelectedSub(prev =>
      prev && matches(prev)
        ? {
            ...prev,
            ...mapped,
            id: prev.id,
            status: mapped.status,
            rejectionReason: mapped.rejectionReason || '',
          }
        : prev,
    )
  }

  // Action: Update Stage (including reversing Rejected → Submitted to Client)
  const handleUpdateStage = async (id: string, stage: string, notes?: string) => {
    try {
      const updated = await submissionsService.updateStage(id, { stage, notes })
      applySubmissionPatch(id, updated, stage)
      showToast(`Submission stage updated to "${stage}"`)
      // Prop-scoped lists (Reports / My Workspace) are stale until parent reload — keep the local patch.
      if (!usePropSubmissions) await reloadSubmissions()
    } catch (err) {
      showToast(apiErrorMessage(err))
    }
  }

  const leadActionInFlight = React.useRef(false)

  // Action: Lead Approval (Approve / Reject) — recruiter is notified by the backend.
  const handleLeadApproval = async (id: string, approved: boolean, status?: string, reason?: string) => {
    if (leadActionInFlight.current) return
    leadActionInFlight.current = true
    try {
      await submissionsService.leadApproval(id, { approved, status, reason, notes: reason })
      const statusText = status || (approved ? 'Approved' : 'Rejected')
      showToast(
        approved || statusText === 'Approved'
          ? 'Lead approved — recruiter has been notified'
          : `Lead rejected — recruiter has been notified${reason ? ` (${reason})` : ''}`,
      )
      await reloadSubmissions()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications_updated'))
      }
    } catch (err) {
      showToast(apiErrorMessage(err))
    } finally {
      leadActionInFlight.current = false
    }
  }

  // Action: Forward to Client — recruiter is notified by the backend.
  const handleForwardClient = async (id: string, notes?: string) => {
    if (leadActionInFlight.current) return
    leadActionInFlight.current = true
    try {
      const updated = await submissionsService.forwardClient(id, { notes })
      applySubmissionPatch(id, updated, 'Submitted to Client')
      showToast('Approved & forwarded to client — recruiter has been notified')
      if (!usePropSubmissions) await reloadSubmissions()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications_updated'))
      }
    } catch (err) {
      showToast(apiErrorMessage(err))
    } finally {
      leadActionInFlight.current = false
    }
  }

  return {
    role,
    currentUserName,
    submissions,
    requirements,
    onOpenSubmitCandidate,
    onUpdateRequirements,
    includeAllMySubmissions,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    statusFilter,
    setStatusFilter,
    clientFilter,
    setClientFilter,
    recruiterFilter,
    setRecruiterFilter,
    selectedSub,
    setSelectedSub,
    selectedReqDetail,
    setSelectedReqDetail,
    isEditingReq,
    setIsEditingReq,
    editingReq,
    setEditingReq,
    toastMsg,
    setToastMsg,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    targetSubForInterview,
    setTargetSubForInterview,
    submissionsList,
    setSubmissionsList,
    interviewSubmissionIds,
    offerSubmissionIds,
    isLoading,
    showToast,
    reloadSubmissions,
    handleUpdateStage,
    handleLeadApproval,
    handleForwardClient,
  }
}
export type SubmissionsVmState = ReturnType<typeof useSubmissionsPageState>

