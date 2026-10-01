import type { RequirementDetailOverviewProps } from './preamble'
import { useState, useMemo, useEffect, useRef } from 'react'
import React from 'react'

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
  requirement,
  role = 'superadmin',
  onBack,
  onOpenAssignModal,
  onEditRequirement,
  onAddCandidate,
  onRevokeRequirement,
}: RequirementDetailOverviewProps = props as RequirementDetailOverviewProps & Record<string, never>
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
  const [pipelineCandidates, setPipelineCandidates] = useState<PipelineCandidateItem[]>([
    {
      id: 'pipe-1',
      name: 'MUNTAZAR SAYED',
      exp: '8 Years 2 Months',
      company: '—',
      notice: '—',
      status: 'COMPLETED',
      activity: 'Just now',
      action: 'Schedule Interview',
      l1Status: 'selected',
      l2Status: 'skipped',
      finalStatus: 'completed',
      offerLetterStatus: 'ready_to_release',
    },
    {
      id: 'pipe-2',
      name: 'Nikhil Joshte',
      exp: '10 Years 4 Months',
      company: '—',
      notice: '—',
      status: 'Submitted to Client',
      activity: '19/06/2026, 19:29',
      action: 'Schedule Interview',
      l1Status: 'active',
      l2Status: 'locked',
      finalStatus: 'locked',
    },
    {
      id: 'pipe-3',
      name: 'Pratibha Kale',
      exp: '10 Years 5 Months',
      company: '—',
      notice: '—',
      status: 'Submitted to Client',
      activity: '19/06/2026, 18:45',
      action: 'Schedule Interview',
      l1Status: 'active',
      l2Status: 'locked',
      finalStatus: 'locked',
    },
    {
      id: 'pipe-4',
      name: 'SANDEEP YADAV',
      exp: '13 Years 1 Month',
      company: '—',
      notice: '—',
      status: 'Submitted to Client',
      activity: '19/06/2026, 18:38',
      action: 'View only',
      l1Status: 'active',
      l2Status: 'locked',
      finalStatus: 'locked',
    },
    {
      id: 'pipe-5',
      name: 'Akshay Soni',
      exp: '3 Years 6 Months',
      company: '—',
      notice: '—',
      status: 'Submitted to Client',
      activity: '19/06/2026, 18:33',
      action: 'Schedule Interview',
      l1Status: 'active',
      l2Status: 'locked',
      finalStatus: 'locked',
    },
    {
      id: 'pipe-6',
      name: 'Sima Borokar',
      exp: '4 Years 5 Months',
      company: '—',
      notice: '—',
      status: 'Submitted to Client',
      activity: '19/06/2026, 17:56',
      action: 'Schedule Interview',
      l1Status: 'active',
      l2Status: 'locked',
      finalStatus: 'locked',
    },
    {
      id: 'pipe-7',
      name: 'Puttapaka Saiteja',
      exp: '5 years',
      company: 'Metaforge it solutions',
      notice: '30 days ,last working 29 April 2026.',
      status: 'Submitted to Client',
      activity: '19/06/2026, 17:50',
      action: 'Schedule Interview',
      l1Status: 'active',
      l2Status: 'locked',
      finalStatus: 'locked',
    },
  ])

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

  const currentUserName = useMemo(() => {
    if (isSuperAdminOrAdmin) return 'Harish Gadipally'
    if (normalizedRole === 'lead') return 'Sarah Kim'
    if (isRecruiter) return 'Marcus Chen'
    return 'Marcus Chen'
  }, [normalizedRole, isRecruiter, isSuperAdminOrAdmin])

  const rawHistorySubmissions = useMemo(
    () => [
      {
        subId: 'SUB-197',
        avatar: 'MS',
        name: 'MUNTAZAR SAYED',
        email: 'sayedmuntazar1996@gmail.com',
        submittedBy: 'Marcus Chen',
        submitterEmail: 'm.chen@talentflow.io',
        submittedOn: '06/19/2026, 07:29 PM',
        status: 'Submitted to Client',
        canSchedule: true,
      },
      {
        subId: 'SUB-196',
        avatar: 'NJ',
        name: 'Nikhil Joshte',
        email: 'nikhiljoshte@gmail.com',
        submittedBy: 'Marcus Chen',
        submitterEmail: 'm.chen@talentflow.io',
        submittedOn: '06/19/2026, 07:29 PM',
        status: 'Submitted to Client',
        canSchedule: true,
      },
      {
        subId: 'SUB-195',
        avatar: 'PK',
        name: 'Pratibha Kale',
        email: 'pratibhakale13@yahoo.com',
        submittedBy: 'Harish Gadipally',
        submitterEmail: 'harish.g@metaforgeit.com',
        submittedOn: '06/19/2026, 06:45 PM',
        status: 'Submitted to Client',
        canSchedule: true,
      },
      {
        subId: 'SUB-194',
        avatar: 'SY',
        name: 'SANDEEP YADAV',
        email: 'sandeep886441@gmail.com',
        submittedBy: 'Saiteja Puttapaka',
        submitterEmail: 'saiteja.p@metaforgeit.com',
        submittedOn: '06/19/2026, 06:38 PM',
        status: 'Submitted to Client',
        canSchedule: false,
      },
      {
        subId: 'SUB-193',
        avatar: 'AS',
        name: 'Akshay Soni',
        email: 'akkisoni12123@gmail.com',
        submittedBy: 'Harish Gadipally',
        submitterEmail: 'harish.g@metaforgeit.com',
        submittedOn: '06/19/2026, 06:33 PM',
        status: 'Submitted to Client',
        canSchedule: true,
      },
    ],
    []
  )

  const filteredHistoryRows = useMemo(() => {
    return rawHistorySubmissions.filter(row => {
      // For recruiter module, ONLY show their own submissions!
      if (isRecruiter) {
        const isOwnSubmission =
          row.submittedBy === 'Marcus Chen' ||
          row.submitterEmail === 'm.chen@talentflow.io' ||
          row.submittedBy === currentUserName
        if (!isOwnSubmission) return false
      }

      if (historyTabFilter !== 'all') {
        if (historyTabFilter === 'submitted_client' && row.status !== 'Submitted to Client') return false
        if (historyTabFilter === 'submitted_lead' && row.status !== 'Submitted to Lead') return false
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
  }, [role, currentUserName, historyTabFilter, historySearchQuery, rawHistorySubmissions])

  const isUnassigned = !requirement.owner || requirement.owner === 'Unassigned'

  // Skills lists matching attached screenshot
  const mandatorySkills = [
    'Catia V6',
    'Door Panel design experience',
    'knowledge on complete door design',
    'packaging',
    'gaps',
    'other CAE',
    'Plant',
    'forming requirements',
    'Any',
  ]

  const generalSkills = [
    'Master section creation & validation',
    'Door mechanisms',
    'Hinges & handles',
    'Cross-functional collaboration (CFT)',
    'Manufacturing awareness',
    'Experienced in Design & Development of BIW Closures from the concept to mass production Design',
    'Design Considering the Package',
    'master sections',
    'styling',
    'vehicle regulation & performance',
    'Knowledge on Door Regulation for Asian and European market',
    'Worked in atleast two complete life cycle of Door design',
  ]

  return {
    requirement,
    role,
    onBack,
    onOpenAssignModal,
    onEditRequirement,
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
    filteredHistoryRows,
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
  }
}
export type RequirementDetailVmState = ReturnType<typeof useRequirementDetailOverviewState>
