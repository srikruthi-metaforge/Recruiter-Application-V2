import React from 'react'
import { Candidate } from '../../../types'
import { getSavedDrafts, saveDraftItem, removeSavedDraft, SavedDraftItem } from '../../../data/savedDraftsStore'
import type { AddCandidateVmState } from './useAddCandidatePageState'

export function useAddCandidatePageHandlers2(s: AddCandidateVmState) {
  const {
    onAddCandidate, setImportMode, parsedFileName, setParsedFileName,
    setShowSuccessToast, setToastMsg, setDraftsList, candidateId,
    setCandidateId, submissionDate, candidateName, setCandidateName,
    currentCompany, setCurrentCompany, contactNumber, setContactNumber,
    email, setEmail, linkedInUrl, setLinkedInUrl,
    qualification, setQualification, skills, setSkills,
    technologies, setTechnologies, totalExperience, setTotalExperience,
    relevantExperience, setRelevantExperience, currentCtc, setCurrentCtc,
    expectedCtc, setExpectedCtc, noticePeriod, setNoticePeriod,
    currentLocation, setCurrentLocation, preferredLocation, setPreferredLocation,
    interviewAvailability, setInterviewAvailability, offerInHand, setOfferInHand,
    reasonForChange, setReasonForChange, notes, setNotes
  } = s

  const handleLoadDraft = (draft: SavedDraftItem) => {
    if (draft.type === 'candidate' && draft.data) {
      const d = draft.data
      if (d.candidateId) setCandidateId(d.candidateId)
      if (d.candidateName) setCandidateName(d.candidateName)
      if (d.currentCompany) setCurrentCompany(d.currentCompany)
      if (d.contactNumber) setContactNumber(d.contactNumber)
      if (d.email) setEmail(d.email)
      if (d.linkedInUrl) setLinkedInUrl(d.linkedInUrl)
      if (d.qualification) setQualification(d.qualification)
      if (d.skills) setSkills(d.skills)
      if (d.technologies) setTechnologies(d.technologies)
      if (d.totalExperience) setTotalExperience(d.totalExperience)
      if (d.relevantExperience) setRelevantExperience(d.relevantExperience)
      if (d.currentCtc) setCurrentCtc(d.currentCtc)
      if (d.expectedCtc) setExpectedCtc(d.expectedCtc)
      if (d.noticePeriod) setNoticePeriod(d.noticePeriod)
      if (d.currentLocation) setCurrentLocation(d.currentLocation)
      if (d.preferredLocation) setPreferredLocation(d.preferredLocation)
      if (d.interviewAvailability) setInterviewAvailability(d.interviewAvailability)
      if (d.offerInHand) setOfferInHand(d.offerInHand)
      if (d.reasonForChange) setReasonForChange(d.reasonForChange)
      if (d.notes) setNotes(d.notes)
      if (d.parsedFileName) setParsedFileName(d.parsedFileName)

      setImportMode('single')
      setToastMsg(`Restored saved draft "${draft.title}". You can now complete and submit it!`)
      setTimeout(() => setToastMsg(null), 3500)
    }
  }

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = removeSavedDraft(id)
    setDraftsList(updated)
    setToastMsg('Draft removed from Saved for Later.')
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleDirectSubmitDraft = (draft: SavedDraftItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (draft.type === 'candidate' && draft.data) {
      const d = draft.data
      const newCand: Candidate = {
        id: d.candidateId || `CAND-${Date.now()}`,
        submissionDate: d.submissionDate || new Date().toISOString().split('T')[0],
        name: d.candidateName || draft.title || 'Saved Candidate',
        company: d.currentCompany || 'Company',
        phone: d.contactNumber || '+91 98765 43210',
        email: d.email || 'candidate@gmail.com',
        linkedIn: d.linkedInUrl || '',
        qualification: d.qualification || '',
        skills: d.skills || '',
        technologies: d.technologies || 'Full Stack',
        totalExperience: d.totalExperience || '5 Years',
        relevantExperience: d.relevantExperience || '4 Years',
        currentCtc: d.currentCtc || '14 LPA',
        expectedCtc: d.expectedCtc || '18 LPA',
        noticePeriod: d.noticePeriod || '30 Days',
        currentLocation: d.currentLocation || 'Hyderabad',
        preferredLocation: d.preferredLocation || 'Hyderabad',
        interviewAvailability: d.interviewAvailability || 'Immediate',
        offerInHand: d.offerInHand || 'No',
        reasonForChange: d.reasonForChange || '',
        notes: d.notes || '',
        resumeName: d.parsedFileName,
        matchScore: '92%',
        status: 'Parsed',
      }
      onAddCandidate?.(newCand)
      handleDeleteDraft(draft.id, e)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    }
  }

  return {
    handleLoadDraft, handleDeleteDraft, handleDirectSubmitDraft
  }
}
