import type { AddCandidatePageProps } from './preamble'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'
import { getSavedDrafts, SavedDraftItem } from '../../../data/savedDraftsStore'
import { useState, useMemo, useEffect, useRef } from 'react'
import React from 'react'

export function useAddCandidatePageState(props: AddCandidatePageProps) {
  const {
  requirements = [],
  selectedReqId = null,
  onOpenRepository,
  onAddCandidate,
}: AddCandidatePageProps = props as AddCandidatePageProps & Record<string, never>
  // Mode selection: 'single' | 'bulk' | 'drafts'
  const [importMode, setImportMode] = useState<'single' | 'bulk' | 'drafts'>('single')
  const [isParsing, setIsParsing] = useState(false)
  const [parsedFileName, setParsedFileName] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showSaveDraftToast, setShowSaveDraftToast] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Saved Drafts state
  const [draftsList, setDraftsList] = useState<SavedDraftItem[]>(() => getSavedDrafts())

  // Form Fields State (pre-filled with optional defaults matching screenshot)
  const [candidateId, setCandidateId] = useState('CAND-2026-08-07-001')
  const [submissionDate, setSubmissionDate] = useState('2026-08-07')
  const [candidateName, setCandidateName] = useState('')
  const [currentCompany, setCurrentCompany] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [email, setEmail] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [qualification, setQualification] = useState('')

  // Skills & Technologies
  const [skills, setSkills] = useState('')
  const [technologies, setTechnologies] = useState('')

  // Experience & CTC
  const [totalExperience, setTotalExperience] = useState('')
  const [relevantExperience, setRelevantExperience] = useState('')
  const [currentCtc, setCurrentCtc] = useState('')
  const [expectedCtc, setExpectedCtc] = useState('')
  const [noticePeriod, setNoticePeriod] = useState('')

  // Location & Availability
  const [currentLocation, setCurrentLocation] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [interviewAvailability, setInterviewAvailability] = useState('')
  const [offerInHand, setOfferInHand] = useState<
    'Select' | 'Yes' | 'No' | 'In Pipeline'
  >('Select')
  const [reasonForChange, setReasonForChange] = useState('')
  const [notes, setNotes] = useState('')

  const [targetReqId, setTargetReqId] = useState<string>(selectedReqId || (requirements[0]?.id ?? 'REQ-001'))

  // Real-time Duplicate Submission Check
  const dupCheckResult = useMemo(() => {
    if (!targetReqId || (!candidateName && !email && !contactNumber)) {
      return { isDuplicate: false }
    }
    return checkDuplicateSubmission(targetReqId, {
      email,
      phone: contactNumber,
      candidateId,
      name: candidateName,
    })
  }, [targetReqId, candidateName, email, contactNumber, candidateId])

  return {
    requirements,
    selectedReqId,
    onOpenRepository,
    onAddCandidate,
    importMode,
    setImportMode,
    isParsing,
    setIsParsing,
    parsedFileName,
    setParsedFileName,
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
  }
}
export type AddCandidateVmState = ReturnType<typeof useAddCandidatePageState>
