import type { RequirementDetailOverviewProps } from './preamble'
import { useState, useMemo, useEffect, useRef } from 'react'
import React from 'react'

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

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

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
  }
}
export type RequirementDetailVmState = ReturnType<typeof useRequirementDetailOverviewState>
