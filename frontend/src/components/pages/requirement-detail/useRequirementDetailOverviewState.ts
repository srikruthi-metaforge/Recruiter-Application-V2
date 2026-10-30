import type { RequirementDetailOverviewProps } from './preamble'
import { useState, useMemo, useEffect, useRef } from 'react'
import React from 'react'
import { workspaceService, submissionsService } from '../../../services/workspace.service'
import { getSessionUser } from '../../../store/session'
import { mapBackendSubmission, ScreenshotSubmission } from '../submissions/preamble'
import { apiErrorMessage } from '../../../services/candidatePayload'

export interface PipelineCandidateItem {
  id: string
  name: string
  exp: string
  company: string
  notice: string
  status: string
  activity: string
  action: 'Schedule Interview' | 'View only'
  l1Status: 'locked' | 'active' | 'selected' | 'rejected'
  l2Status: 'locked' | 'active' | 'selected' | 'skipped' | 'rejected'
  finalStatus: 'locked' | 'active' | 'completed' | 'rejected'
  offerLetterStatus?: 'none' | 'ready_to_release' | 'released'
  rejectionReason?: string
  rejectedStage?: 'L1' | 'L2' | 'FINAL' | null
}

export function useRequirementDetailOverviewState(props: RequirementDetailOverviewProps) {
  const {
    requirement: initialRequirement,
    role = 'superadmin',
    onBack,
    onOpenAssignModal,
    onEditRequirement,
    onAddCandidate,
    onRevokeRequirement,
    onRequirementUpdated,
  }: RequirementDetailOverviewProps = props as RequirementDetailOverviewProps & Record<string, never>

  const [requirement, setRequirement] = useState(initialRequirement)
  const [isInternalEditing, setIsInternalEditing] = useState(false)

  useEffect(() => {
    if (initialRequirement) {
      setRequirement(initialRequirement)
    }
  }, [initialRequirement])

  const handleSaveRequirement = async (updatedReq: any) => {
    try {
      await workspaceService.updateRequirement(updatedReq.id, updatedReq)
      setRequirement(updatedReq)
      setIsInternalEditing(false)
      onRequirementUpdated?.(updatedReq)
      showToast('Requirement details updated successfully!')
    } catch (err) {
      showToast(apiErrorMessage(err) || 'Failed to update requirement')
    }
  }
  const normalizedRole = (role || '').toLowerCase()
  const isRecruiter = normalizedRole === 'recruiter'
  const isSuperAdminOrAdmin = normalizedRole === 'superadmin' || normalizedRole === 'admin' || normalizedRole === 'devteam'
  const availableTabs = isSuperAdminOrAdmin
    ? (['Overview', 'Pipeline', 'Interviews', 'Offers', 'Activity'] as const)
    : (['Overview', 'Pipeline', 'Interviews', 'Offers'] as const)

  const [activeTab, setActiveTab] = useState<'Overview' | 'Pipeline' | 'Interviews' | 'Offers' | 'Activity'>('Overview')
  const [historyTabFilter, setHistoryTabFilter] = useState<'all' | 'submitted_lead' | 'submitted_client' | 'interview' | 'selected' | 'rejected'>('all')
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [assignTabFilter, setAssignTabFilter] = useState<'all' | 'active' | 'revoked'>('all')
  const [assignSearchQuery, setAssignSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [schedulingCandidateRow, setSchedulingCandidateRow] = useState<any>(null)
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false)

  // Candidate Pipeline Interactive State
  const [pipelineCandidates, setPipelineCandidates] = useState<PipelineCandidateItem[]>([])

  const [rejectionModalData, setRejectionModalData] = useState<{
    candidateId: string
    candidateName: string
    stage: 'L1' | 'L2' | 'FINAL'
  } | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleUpdatePipelineStage = (candidateId: string, stage: 'L1' | 'L2' | 'FINAL', action: string) => {
    if (action === 'reject') {
      const candidate = pipelineCandidates.find(c => c.id === candidateId)
      if (candidate) {
        setRejectionModalData({
          candidateId,
          candidateName: candidate.name,
          stage,
        })
      }
      return
    }

    setPipelineCandidates(prev =>
      prev.map(c => {
        if (c.id !== candidateId) return c

        if (stage === 'L1') {
          if (action === 'select') {
            return {
              ...c,
              l1Status: 'selected',
              l2Status: 'active',
              status: 'L2 In Progress',
              activity: 'Just now',
            }
          }
          if (action === 'move_to_final') {
            return {
              ...c,
              l1Status: 'selected',
              l2Status: 'skipped',
              finalStatus: 'active',
              status: 'Final Round',
              activity: 'Just now',
            }
          }
        }

        if (stage === 'L2') {
          if (action === 'select') {
            return {
              ...c,
              l2Status: 'selected',
              finalStatus: 'active',
              status: 'Final Round',
              activity: 'Just now',
            }
          }
        }

        if (stage === 'FINAL') {
          if (action === 'completed') {
            return {
              ...c,
              finalStatus: 'completed',
              offerLetterStatus: 'ready_to_release',
              status: 'COMPLETED',
              activity: 'Just now',
            }
          }
        }

        return c
      })
    )

    if (action === 'select') {
      showToast(`Candidate moved to ${stage === 'L1' ? 'L2' : 'FINAL'} stage.`)
    } else if (action === 'move_to_final') {
      showToast(`Candidate moved directly from L1 to FINAL stage (L2 skipped).`)
    } else if (action === 'completed') {
      showToast(`Candidate successfully COMPLETED FINAL stage! Offer letter ready to release.`)
    }
  }

  const handleUpdateOfferLetterStatus = (candidateId: string, offerStatus: 'ready_to_release' | 'released') => {
    setPipelineCandidates(prev =>
      prev.map(c => {
        if (c.id !== candidateId) return c
        return {
          ...c,
          offerLetterStatus: offerStatus,
          activity: 'Just now',
        }
      })
    )
    if (offerStatus === 'released') {
      showToast(`Offer letter marked as Released!`)
    } else {
      showToast(`Offer letter marked as Ready to Release.`)
    }
  }

  const handleConfirmRejection = (reason: string) => {
    if (!rejectionModalData) return
    const { candidateId, stage } = rejectionModalData

    setPipelineCandidates(prev =>
      prev.map(c => {
        if (c.id !== candidateId) return c
        return {
          ...c,
          l1Status: stage === 'L1' ? 'rejected' : c.l1Status,
          l2Status: stage === 'L2' ? 'rejected' : c.l2Status,
          finalStatus: stage === 'FINAL' ? 'rejected' : c.finalStatus,
          status: 'REJECTED',
          rejectionReason: reason,
          rejectedStage: stage,
          activity: 'Just now',
        }
      })
    )

    showToast(`Rejection recorded for ${rejectionModalData.candidateName} at ${stage} stage.`)
    setRejectionModalData(null)
  }

  const currentUserName = getSessionUser()?.name || ''
  const currentUserEmail = (getSessionUser()?.email || '').toLowerCase()

  // Submissions made against this requirement (matched by its code or database id).
  const [reqSubmissions, setReqSubmissions] = useState<ScreenshotSubmission[]>([])
  const [reqSubmissionsLoaded, setReqSubmissionsLoaded] = useState(false)
  const reloadReqSubmissions = async () => {
    const mongoId = String((requirement as any)?._id || '').trim()
    const reqCode = String((requirement as any)?.reqCode || requirement?.id || '')
      .replace(/\s*\([^()]*\)\s*$/, '')
      .trim()
    const keys = new Set(
      [requirement?.id, (requirement as any)?.reqCode, mongoId, (requirement as any)?.displayId, reqCode]
        .filter(Boolean)
        .map(String),
    )
    const q = mongoId
      ? `?requirementId=${encodeURIComponent(mongoId)}`
      : reqCode
        ? `?requirementId=${encodeURIComponent(reqCode)}`
        : ''
    if (!q) return

    const loadOnce = async () => {
      const data: any = await submissionsService.list(q)
      const list: any[] = Array.isArray(data) ? data : data?.items || []
      return list.map(mapBackendSubmission).filter(sub => {
        if (!q) {
          const rid = sub.raw?.requirementId
          return keys.has(String(sub.reqId)) || keys.has(String(rid?._id || rid?.id || rid || ''))
        }
        return true
      })
    }

    try {
      // Prefer server filter so Pipeline shows everyone already on this requirement.
      setReqSubmissions(await loadOnce())
      setReqSubmissionsLoaded(true)
    } catch {
      // One retry — never wipe a good list on a transient 429/network blip
      // (that was showing 0 resumes until the next login refreshed).
      try {
        await new Promise(r => setTimeout(r, 400))
        setReqSubmissions(await loadOnce())
        setReqSubmissionsLoaded(true)
      } catch {
        /* keep previous reqSubmissions / loaded flag */
      }
    }
  }
  useEffect(() => {
    let active = true
    let seq = 0
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    setReqSubmissionsLoaded(false)
    const run = () => {
      const mySeq = ++seq
      void (async () => {
        await reloadReqSubmissions()
        if (!active || mySeq !== seq) return
      })()
    }
    const refresh = () => {
      // Collapse bursts from submit + workspace + StrictMode into one fetch.
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(run, 250)
    }
    run()
    if (typeof window !== 'undefined') {
      window.addEventListener('submissions_updated', refresh)
    }
    return () => {
      active = false
      if (debounceTimer) clearTimeout(debounceTimer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('submissions_updated', refresh)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirement?.id, (requirement as any)?._id, (requirement as any)?.reqCode])

  useEffect(() => {
    setPipelineCandidates(
      reqSubmissions.map(sub => ({
        id: String(sub.id),
        name: sub.candidateName,
        exp: sub.experience || '—',
        company: sub.currentCompany || '—',
        notice: sub.noticePeriod || '—',
        status: sub.status,
        activity: sub.submittedOn,
        action: 'Schedule Interview' as const,
        l1Status: 'active' as const,
        l2Status: 'locked' as const,
        finalStatus: 'locked' as const,
      })),
    )
  }, [reqSubmissions])

  const rawHistorySubmissions = useMemo(
    () =>
      reqSubmissions.map(sub => ({
        subId: String(sub.submissionId || sub.id),
        avatar: (sub.candidateName || '?')
          .split(/\s+/)
          .map(w => w.charAt(0))
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        name: sub.candidateName,
        email: sub.email,
        submittedBy: sub.submittedBy,
        submitterEmail: String(
          (sub.raw?.recruiterId && typeof sub.raw.recruiterId === 'object'
            ? sub.raw.recruiterId.email
            : '') ||
            sub.raw?.recruiterEmail ||
            '',
        ),
        recruiterMongoId: String(
          (sub.raw?.recruiterId && typeof sub.raw.recruiterId === 'object'
            ? sub.raw.recruiterId._id || sub.raw.recruiterId.id
            : sub.raw?.recruiterId) || '',
        ),
        submittedOn: sub.submittedOn,
        status: sub.status,
        canSchedule: !/interview|offer|placed|rejected/i.test(sub.status || ''),
      })),
    [reqSubmissions],
  )

  const filteredHistoryRows = useMemo(() => {
    // Trust the requirement-scoped API list. A second client-side "own submission"
    // name filter previously wiped recruiter History when recruiterId was stamped
    // as the lead (cards stayed 0 while the lead account showed the same rows).
    return rawHistorySubmissions.filter(row => {
      if (historyTabFilter !== 'all') {
        if (historyTabFilter === 'submitted_client' && row.status !== 'Submitted to Client') return false
        if (historyTabFilter === 'submitted_lead' && row.status !== 'Submitted to Lead') return false
        if (historyTabFilter === 'interview' && !/interview/i.test(row.status || '')) return false
        if (historyTabFilter === 'selected' && !/select|offer|placed/i.test(row.status || '')) return false
        if (historyTabFilter === 'rejected' && !/reject/i.test(row.status || '')) return false
      }

      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase()
        const matchName = row.name.toLowerCase().includes(q)
        const matchSubId = row.subId.toLowerCase().includes(q)
        const matchSubmitter = row.submittedBy.toLowerCase().includes(q)
        if (!matchName && !matchSubId && !matchSubmitter) return false
      }

      return true
    })
  }, [historyTabFilter, historySearchQuery, rawHistorySubmissions])

  const historyStatusCounts = useMemo(() => {
    // Metric cards ignore the active status tab so totals stay stable while filtering.
    const scoped = rawHistorySubmissions
    const assignedNames = String((requirement as any)?.assignedRecruiterNames || requirement.owner || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .filter(n => n.toLowerCase() !== 'unassigned')
    return {
      total: scoped.length,
      leadReview: scoped.filter(r => r.status === 'Submitted to Lead').length,
      client: scoped.filter(r => r.status === 'Submitted to Client').length,
      interview: scoped.filter(r => /interview/i.test(r.status || '')).length,
      selected: scoped.filter(r => /select|offer|placed/i.test(r.status || '')).length,
      rejected: scoped.filter(r => /reject/i.test(r.status || '')).length,
      recruitersWorking: isRecruiter
        ? Math.max(
            1,
            new Set(
              scoped.map(r => r.recruiterMongoId || r.submitterEmail || r.submittedBy).filter(Boolean),
            ).size,
          )
        : new Set(
            scoped.map(r => r.recruiterMongoId || r.submitterEmail || r.submittedBy).filter(Boolean),
          ).size || assignedNames.length,
    }
  }, [rawHistorySubmissions, isRecruiter, requirement])

  const isUnassigned =
    requirement.assignmentStatus === 'Unassigned' || !requirement.owner || requirement.owner === 'Unassigned'

  const mandatorySkills = useMemo(() => {
    if (requirement.mandatorySkills && requirement.mandatorySkills.length > 0) {
      return requirement.mandatorySkills
    }
    if (requirement.skills && requirement.skills.length > 0) {
      return requirement.skills.slice(0, 4)
    }
    return []
  }, [requirement])

  const generalSkills = useMemo(() => {
    if (requirement.skills && requirement.skills.length > 0) {
      return requirement.skills
    }
    return []
  }, [requirement])

  return {
    requirement,
    setRequirement,
    isInternalEditing,
    setIsInternalEditing,
    handleSaveRequirement,
    role,
    onBack,
    onOpenAssignModal,
    onEditRequirement,
    onRequirementUpdated,
    onAddCandidate,
    onRevokeRequirement,
    activeTab,
    setActiveTab,
    historyTabFilter,
    setHistoryTabFilter,
    historySearchQuery,
    setHistorySearchQuery,
    historyPage,
    setHistoryPage,
    assignTabFilter,
    setAssignTabFilter,
    assignSearchQuery,
    setAssignSearchQuery,
    toastMsg,
    setToastMsg,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    schedulingCandidateRow,
    setSchedulingCandidateRow,
    isAddCandidateModalOpen,
    setIsAddCandidateModalOpen,
    normalizedRole,
    isRecruiter,
    isSuperAdminOrAdmin,
    availableTabs,
    currentUserName,
    rawHistorySubmissions,
    reqSubmissions,
    reqSubmissionsLoaded,
    filteredHistoryRows,
    historyStatusCounts,
    isUnassigned,
    showToast,
    mandatorySkills,
    generalSkills,
    pipelineCandidates,
    setPipelineCandidates,
    rejectionModalData,
    setRejectionModalData,
    handleUpdatePipelineStage,
    handleConfirmRejection,
    handleUpdateOfferLetterStatus,
    reloadReqSubmissions,
  }
}
export type RequirementDetailVmState = ReturnType<typeof useRequirementDetailOverviewState>
