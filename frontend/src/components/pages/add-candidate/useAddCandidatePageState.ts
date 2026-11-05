import type { AddCandidatePageProps } from './preamble'
import { checkDuplicateSubmission, DuplicateCheckResult } from '../../../data/submissionsStore'
import { getSavedDrafts, SavedDraftItem } from '../../../data/savedDraftsStore'
import { candidatesService } from '../../../services/workspace.service'
import {
  CANDIDATE_FORM_SESSION_KEY,
  clearSessionDraft,
  readSessionDraft,
  writeSessionDraft,
} from '../../../lib/formSessionDraft'
import { useState, useMemo, useEffect, useRef } from 'react'
import React from 'react'

type CandidateFormSessionDraft = {
  importMode?: 'single' | 'bulk' | 'drafts'
  parsedFileName?: string | null
  resumeFileId?: string | null
  candidateId?: string
  submissionDate?: string
  candidateName?: string
  currentCompany?: string
  contactNumber?: string
  email?: string
  linkedInUrl?: string
  qualification?: string
  skills?: string
  technologies?: string
  totalExperience?: string
  relevantExperience?: string
  currentCtc?: string
  expectedCtc?: string
  noticePeriod?: string
  currentLocation?: string
  preferredLocation?: string
  interviewAvailability?: string
  offerInHand?: 'Select' | 'Yes' | 'No' | 'In Pipeline'
  reasonForChange?: string
  notes?: string
  targetReqId?: string
}

export function useAddCandidatePageState(props: AddCandidatePageProps) {
  const {
  requirements = [],
  selectedReqId = null,
  showBack = false,
  backLabel,
  onBack,
  pageTitle,
  onOpenRepository,
  onAddCandidate,
}: AddCandidatePageProps = props as AddCandidatePageProps & Record<string, never>
  const sessionDraft = useRef(
    typeof window !== 'undefined'
      ? readSessionDraft<CandidateFormSessionDraft>(CANDIDATE_FORM_SESSION_KEY)
      : null,
  ).current

  // Mode selection: 'single' | 'bulk' | 'drafts'
  const [importMode, setImportMode] = useState<'single' | 'bulk' | 'drafts'>(
    () => sessionDraft?.importMode || 'single',
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedFileName, setParsedFileName] = useState<string | null>(
    () => sessionDraft?.parsedFileName ?? null,
  )
  const [resumeFileId, setResumeFileId] = useState<string | null>(
    () => sessionDraft?.resumeFileId ?? null,
  )
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showSaveDraftToast, setShowSaveDraftToast] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Bulk import queue: every dropped resume stays here until it is submitted or removed.
  const [bulkQueue, setBulkQueue] = useState<BulkQueueItem[]>([])
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null)

  // Saved Drafts state
  const [draftsList, setDraftsList] = useState<SavedDraftItem[]>(() => getSavedDrafts())

  // Form Fields State — restore corrected/parsed values after refresh
  const [candidateId, setCandidateId] = useState(() => sessionDraft?.candidateId || 'Auto')
  const [submissionDate, setSubmissionDate] = useState(
    () => sessionDraft?.submissionDate || new Date().toISOString().slice(0, 10),
  )
  const [candidateName, setCandidateName] = useState(() => sessionDraft?.candidateName || '')
  const [currentCompany, setCurrentCompany] = useState(() => sessionDraft?.currentCompany || '')
  const [contactNumber, setContactNumber] = useState(() => sessionDraft?.contactNumber || '')
  const [email, setEmail] = useState(() => sessionDraft?.email || '')
  const [linkedInUrl, setLinkedInUrl] = useState(() => sessionDraft?.linkedInUrl || '')
  const [qualification, setQualification] = useState(() => sessionDraft?.qualification || '')

  // Skills & Technologies
  const [skills, setSkills] = useState(() => sessionDraft?.skills || '')
  const [technologies, setTechnologies] = useState(() => sessionDraft?.technologies || '')

  // Experience & CTC
  const [totalExperience, setTotalExperience] = useState(() => sessionDraft?.totalExperience || '')
  const [relevantExperience, setRelevantExperience] = useState(
    () => sessionDraft?.relevantExperience || '',
  )
  const [currentCtc, setCurrentCtc] = useState(() => sessionDraft?.currentCtc || '')
  const [expectedCtc, setExpectedCtc] = useState(() => sessionDraft?.expectedCtc || '')
  const [noticePeriod, setNoticePeriod] = useState(() => sessionDraft?.noticePeriod || '')

  // Location & Availability
  const [currentLocation, setCurrentLocation] = useState(() => sessionDraft?.currentLocation || '')
  const [preferredLocation, setPreferredLocation] = useState(
    () => sessionDraft?.preferredLocation || '',
  )
  const [interviewAvailability, setInterviewAvailability] = useState(
    () => sessionDraft?.interviewAvailability || '',
  )
  const [offerInHand, setOfferInHand] = useState<
    'Select' | 'Yes' | 'No' | 'In Pipeline'
  >(() => sessionDraft?.offerInHand || 'Select')
  const [reasonForChange, setReasonForChange] = useState(() => sessionDraft?.reasonForChange || '')
  const [notes, setNotes] = useState(() => sessionDraft?.notes || '')

  const [targetReqId, setTargetReqId] = useState<string>(
    () => sessionDraft?.targetReqId || selectedReqId || '',
  )

  // Autosave in-progress form so refresh keeps corrected details
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasContent = Boolean(
        candidateName.trim() ||
          email.trim() ||
          contactNumber.trim() ||
          skills.trim() ||
          notes.trim() ||
          resumeFileId ||
          parsedFileName,
      )
      if (!hasContent) {
        clearSessionDraft(CANDIDATE_FORM_SESSION_KEY)
        return
      }
      writeSessionDraft(CANDIDATE_FORM_SESSION_KEY, {
        importMode,
        parsedFileName,
        resumeFileId,
        candidateId,
        submissionDate,
        candidateName,
        currentCompany,
        contactNumber,
        email,
        linkedInUrl,
        qualification,
        skills,
        technologies,
        totalExperience,
        relevantExperience,
        currentCtc,
        expectedCtc,
        noticePeriod,
        currentLocation,
        preferredLocation,
        interviewAvailability,
        offerInHand,
        reasonForChange,
        notes,
        targetReqId,
      } satisfies CandidateFormSessionDraft)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [
    importMode,
    parsedFileName,
    resumeFileId,
    candidateId,
    submissionDate,
    candidateName,
    currentCompany,
    contactNumber,
    email,
    linkedInUrl,
    qualification,
    skills,
    technologies,
    totalExperience,
    relevantExperience,
    currentCtc,
    expectedCtc,
    noticePeriod,
    currentLocation,
    preferredLocation,
    interviewAvailability,
    offerInHand,
    reasonForChange,
    notes,
    targetReqId,
  ])

  // Real-time Database Duplicate Check (Candidate Repository level)
  const [dbDuplicate, setDbDuplicate] = useState<{
    isDuplicate: boolean
    duplicateField?: string
    candidate?: any
  }>({ isDuplicate: false })

  // Rehydrate Saved for Later drafts from localStorage after refresh / remount.
  useEffect(() => {
    setDraftsList(getSavedDrafts())
  }, [])

  useEffect(() => {
    const cleanEmail = email.trim()
    const cleanPhone = contactNumber.trim()
    if (!cleanEmail && !cleanPhone) {
      setDbDuplicate({ isDuplicate: false })
      return
    }

    let active = true
    const timer = setTimeout(async () => {
      try {
        const payload: { email?: string; phone?: string } = {}
        if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) payload.email = cleanEmail
        if (cleanPhone && cleanPhone.length >= 7) payload.phone = cleanPhone
        if (!payload.email && !payload.phone) return

        const res = await candidatesService.duplicateCheck(payload)
        if (active) {
          if (res?.isDuplicate) {
            setDbDuplicate(res)
          } else {
            setDbDuplicate({ isDuplicate: false })
          }
        }
      } catch {
        // Non-blocking best effort check
      }
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [email, contactNumber])

  // Real-time Duplicate Submission & Repository Check
  const dupCheckResult = useMemo(() => {
    // 1. Requirement submission duplicate check
    if (targetReqId && (candidateName || email || contactNumber)) {
      const reqDup = checkDuplicateSubmission(targetReqId, {
        email,
        phone: contactNumber,
        candidateId,
        name: candidateName,
      })
      if (reqDup.isDuplicate) {
        return {
          isDuplicate: true,
          type: 'requirement' as const,
          existingSubmission: reqDup.existingSubmission,
          matchReason: reqDup.matchReason,
        }
      }
    }

    // 2. Candidate repository duplicate check
    if (dbDuplicate.isDuplicate) {
      return {
        isDuplicate: true,
        type: 'repository' as const,
        existingCandidate: dbDuplicate.candidate,
        duplicateField: dbDuplicate.duplicateField,
        matchReason: `Already exists in repository with matching ${dbDuplicate.duplicateField} (${dbDuplicate.duplicateField === 'email' ? email : contactNumber})`,
      }
    }

    return { isDuplicate: false }
  }, [targetReqId, candidateName, email, contactNumber, candidateId, dbDuplicate])

  return {
    requirements,
    selectedReqId,
    showBack,
    backLabel,
    onBack,
    pageTitle,
    onOpenRepository,
    onAddCandidate,
    importMode,
    setImportMode,
    selectedFile,
    setSelectedFile,
    isParsing,
    setIsParsing,
    parsedFileName,
    setParsedFileName,
    resumeFileId,
    setResumeFileId,
    showSuccessToast,
    setShowSuccessToast,
    showSaveDraftToast,
    setShowSaveDraftToast,
    toastMsg,
    setToastMsg,
    isSaving,
    setIsSaving,
    draftsList,
    setDraftsList,
    candidateId,
    setCandidateId,
    submissionDate,
    setSubmissionDate,
    candidateName,
    setCandidateName,
    currentCompany,
    setCurrentCompany,
    contactNumber,
    setContactNumber,
    email,
    setEmail,
    linkedInUrl,
    setLinkedInUrl,
    qualification,
    setQualification,
    skills,
    setSkills,
    technologies,
    setTechnologies,
    totalExperience,
    setTotalExperience,
    relevantExperience,
    setRelevantExperience,
    currentCtc,
    setCurrentCtc,
    expectedCtc,
    setExpectedCtc,
    noticePeriod,
    setNoticePeriod,
    currentLocation,
    setCurrentLocation,
    preferredLocation,
    setPreferredLocation,
    interviewAvailability,
    setInterviewAvailability,
    offerInHand,
    setOfferInHand,
    reasonForChange,
    setReasonForChange,
    notes,
    setNotes,
    targetReqId,
    setTargetReqId,
    dupCheckResult,
    bulkQueue,
    setBulkQueue,
    activeQueueId,
    setActiveQueueId,
  }
}

export type BulkQueueStatus = 'queued' | 'parsing' | 'parsed' | 'failed' | 'submitted'

export interface BulkQueueItem {
  id: string
  file: File
  status: BulkQueueStatus
  data?: import('../../../services/workspace.service').ParsedResume
  error?: string
  resumeFileId?: string
}
export type AddCandidateVmState = ReturnType<typeof useAddCandidatePageState>
