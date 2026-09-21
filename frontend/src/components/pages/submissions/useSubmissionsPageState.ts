import type { SubmissionsPageProps, ScreenshotSubmission } from './preamble'
import { DEFAULT_SCREENSHOT_SUBMISSIONS } from './submissions.data'
import { Requirement } from '../../../types'
import { useState } from 'react'
import React from 'react'

export function useSubmissionsPageState(props: SubmissionsPageProps) {
  const {
  role,
  submissions = [],
  requirements = [],
  onOpenSubmitCandidate,
  onUpdateRequirements,
}: SubmissionsPageProps = props as SubmissionsPageProps & Record<string, never>
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('All')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [clientFilter, setClientFilter] = useState('All')
  const [selectedSub, setSelectedSub] = useState<ScreenshotSubmission | null>(
    null
  )

  const [selectedReqDetail, setSelectedReqDetail] = useState<Requirement | null>(null)
  const [isEditingReq, setIsEditingReq] = useState(false)
  const [editingReq, setEditingReq] = useState<Requirement | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Interview Schedule Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [targetSubForInterview, setTargetSubForInterview] = useState<ScreenshotSubmission | null>(null)

  // Dynamic Submissions List State
  const [submissionsList, setSubmissionsList] = useState<ScreenshotSubmission[]>(() => {
    if (submissions && submissions.length > 0) {
      const mapped = submissions.map(s => ({
        id: s.id,
        candidateName: s.candidate,
        requirement: s.req || 'Senior Developer',
        reqId: s.req || 'REQ-2026-08-12-001',
        clientName: s.client || 'Accenture',
        experience: s.experience || '6 Years',
        currentCompany: s.client || 'Tech Enterprise',
        submittedBy: s.recruiter || 'Marcus Chen',
        submittedOn: s.date || 'Aug 17, 2026',
        status: s.stage === 'Submitted' ? 'Submitted to Client' : s.stage,
      }))
      return [...DEFAULT_SCREENSHOT_SUBMISSIONS, ...mapped]
    }
    return DEFAULT_SCREENSHOT_SUBMISSIONS
  })

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  return {
    role,
    submissions,
    requirements,
    onOpenSubmitCandidate,
    onUpdateRequirements,
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
    showToast,
  }
}
export type SubmissionsVmState = ReturnType<typeof useSubmissionsPageState>
