import React from 'react'
import { Candidate } from '../../../types'
import { getSavedDrafts, saveDraftItem, removeSavedDraft, SavedDraftItem } from '../../../data/savedDraftsStore'
import type { AddCandidateVmState } from './useAddCandidatePageState'

export function useAddCandidatePageHandlers1(s: AddCandidateVmState) {
  const {
    onAddCandidate, setIsParsing, parsedFileName, setParsedFileName,
    setShowSuccessToast, setShowSaveDraftToast, setToastMsg, setDraftsList,
    candidateId, setCandidateId, submissionDate, candidateName,
    setCandidateName, currentCompany, setCurrentCompany, contactNumber,
    setContactNumber, email, setEmail, linkedInUrl,
    setLinkedInUrl, qualification, setQualification, skills,
    setSkills, technologies, setTechnologies, totalExperience,
    setTotalExperience, relevantExperience, setRelevantExperience, currentCtc,
    setCurrentCtc, expectedCtc, setExpectedCtc, noticePeriod,
    setNoticePeriod, currentLocation, setCurrentLocation, preferredLocation,
    setPreferredLocation, interviewAvailability, setInterviewAvailability, offerInHand,
    setOfferInHand, reasonForChange, setReasonForChange, notes,
    setNotes, dupCheckResult
  } = s
  // Simulate Metaforge AI Resume Parsing
  const handleParseResume = () => {
    setIsParsing(true)
    setTimeout(() => {
      setIsParsing(false)
      setParsedFileName('Priya_Nair_Resume.pdf')

      // Fill out form automatically with sample parsed candidate details
      setCandidateName('Priya Nair')
      setCurrentCompany('Contoso')
      setContactNumber('+91 98765 43210')
      setEmail('priya.nair@contoso.com')
      setLinkedInUrl('https://www.linkedin.com/in/priyanair-tech')
      setQualification('B.Tech CS')
      setSkills('Communication, Problem solving, Stakeholder management')
      setTechnologies('React, TypeScript, Node.js, SQL, Tailwind CSS')
      setTotalExperience('4.5 Years')
      setRelevantExperience('3.8 Years')
      setCurrentCtc('12 LPA')
      setExpectedCtc('16 LPA')
      setNoticePeriod('30 days')
      setCurrentLocation('Bengaluru')
      setPreferredLocation('Bengaluru / Remote')
      setInterviewAvailability('Available after 5 PM weekdays')
      setOfferInHand('No')
      setReasonForChange('Better role / Growth')
      setNotes('Parsed via Metaforge AI. Strong frontend architecture expertise.')
    }, 1000)
  }

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (dupCheckResult.isDuplicate) {
      setToastMsg(`⚠️ Duplicate Submission: ${candidateName || 'Candidate'} has already been submitted for this requirement.`)
      setTimeout(() => setToastMsg(null), 3500)
      return
    }

    const newCandidate: Candidate = {
      id: candidateId,
      submissionDate,
      name: candidateName || 'Unnamed Candidate',
      company: currentCompany,
      phone: contactNumber,
      email: email,
      linkedIn: linkedInUrl,
      qualification: qualification,
      skills: skills,
      technologies: technologies,
      totalExperience: totalExperience,
      relevantExperience: relevantExperience,
      currentCtc: currentCtc,
      expectedCtc: expectedCtc,
      noticePeriod: noticePeriod,
      currentLocation: currentLocation,
      preferredLocation: preferredLocation,
      interviewAvailability: interviewAvailability,
      offerInHand: offerInHand,
      reasonForChange: reasonForChange,
      notes: notes,
      resumeName: parsedFileName || undefined,
      matchScore: '95%',
      status: 'Parsed',
    }

    if (onAddCandidate) {
      onAddCandidate(newCandidate)
    }

    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)

    // Auto-increment Candidate ID for next entry
    const match = candidateId.match(/(\d+)$/)
    if (match) {
      const nextNum = (parseInt(match[1], 10) + 1).toString().padStart(3, '0')
      setCandidateId(`CAND-2026-08-07-${nextNum}`)
    }

    // Reset editable text fields
    setCandidateName('')
    setCurrentCompany('')
    setContactNumber('')
    setEmail('')
    setLinkedInUrl('')
    setQualification('')
    setSkills('')
    setTechnologies('')
    setTotalExperience('')
    setRelevantExperience('')
    setCurrentCtc('')
    setExpectedCtc('')
    setNoticePeriod('')
    setCurrentLocation('')
    setPreferredLocation('')
    setInterviewAvailability('')
    setOfferInHand('Select')
    setReasonForChange('')
    setNotes('')
    setParsedFileName(null)
  }

  const handleSaveDraftForLater = () => {
    const draftTitle = candidateName || candidateId || 'Draft Candidate Profile'
    saveDraftItem({
      type: 'candidate',
      title: draftTitle,
      subtitle: `${technologies || 'Technology'} • ${totalExperience || 'Exp'} • Current: ${currentCompany || 'Not specified'} (${currentCtc || 'CTC'})`,
      createdBy: 'Harish Gadipally',
      status: 'Saved for Later',
      data: {
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
        parsedFileName,
      },
    })

    setDraftsList(getSavedDrafts())
    setShowSaveDraftToast(true)
    setTimeout(() => setShowSaveDraftToast(false), 3500)
  }
  return {
    handleParseResume, handleSubmit, handleSaveDraftForLater
  }
}
