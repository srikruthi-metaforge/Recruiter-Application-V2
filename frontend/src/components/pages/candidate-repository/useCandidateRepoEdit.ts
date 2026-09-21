import React, { useState } from 'react'
import { CandidateRepoItem } from './types'

export function useCandidateRepoEdit(
  repoList: CandidateRepoItem[],
  setRepoList: React.Dispatch<React.SetStateAction<CandidateRepoItem[]>>,
  showToast: (msg: string) => void,
) {
  const [editingCandidate, setEditingCandidate] = useState<CandidateRepoItem | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLinkedIn, setEditLinkedIn] = useState('')
  const [editCurrentCompany, setEditCurrentCompany] = useState('')
  const [editQualification, setEditQualification] = useState('')
  const [editSkills, setEditSkills] = useState('')
  const [editTechnology, setEditTechnology] = useState('')
  const [editTotalExp, setEditTotalExp] = useState('')
  const [editRelevantExp, setEditRelevantExp] = useState('')
  const [editCurrentCtc, setEditCurrentCtc] = useState('')
  const [editExpectedCtc, setEditExpectedCtc] = useState('')
  const [editNoticePeriod, setEditNoticePeriod] = useState('')
  const [editCurrentLoc, setEditCurrentLoc] = useState('')
  const [editPreferredLoc, setEditPreferredLoc] = useState('')
  const [editAvailability, setEditAvailability] = useState('')
  const [editReasonForChange, setEditReasonForChange] = useState('')
  const [editOfferInHand, setEditOfferInHand] = useState('—')
  const [editResumeReference, setEditResumeReference] = useState('')
  const [editNotes, setEditNotes] = useState('')

  // Open Full-Page Edit Form
  const handleOpenEdit = (item: CandidateRepoItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingCandidate(item)
    setEditFullName(item.name)
    setEditEmail(item.email.includes('*') ? `${item.name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : item.email)
    setEditPhone(item.phone.includes('*') ? '+91 98765 43210' : item.phone)
    setEditLinkedIn('https://www.linkedin.com/in/' + item.name.toLowerCase().replace(/\s+/g, ''))
    setEditCurrentCompany(item.currentCompany || 'Software Solutions Ltd')
    setEditQualification(item.qualification || 'B.E. - Bachelor of Engineering')
    setEditSkills(item.skills || 'Testing, Automation, Manual Testing, Java, Python')
    setEditTechnology(item.technology)
    setEditTotalExp(item.totalExperience)
    setEditRelevantExp(item.relevantExperience || item.totalExperience)
    setEditCurrentCtc(item.currentCtc || '12 LPA')
    setEditExpectedCtc(item.expectedCtc || '16 LPA')
    setEditNoticePeriod(item.noticePeriod || '30 Days')
    setEditCurrentLoc(item.currentLocation || 'Bangalore')
    setEditPreferredLoc(item.preferredLocation || 'Bangalore / Remote')
    setEditAvailability(item.interviewAvailability || 'Immediate')
    setEditReasonForChange(item.reasonForChange || 'Career Growth')
    setEditOfferInHand(item.offerInHand || 'No')
    setEditResumeReference(item.resumeReference || `${item.name.replace(/\s+/g, '_')}_Resume.pdf`)
    setEditNotes(item.notes || 'Candidate profile in repository')
  }

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCandidate) return

    const updated = repoList.map(item =>
      item.id === editingCandidate.id
        ? {
            ...item,
            name: editFullName,
            email: editEmail,
            phone: editPhone,
            technology: editTechnology,
            totalExperience: editTotalExp,
            relevantExperience: editRelevantExp,
            qualification: editQualification,
            skills: editSkills,
            currentCompany: editCurrentCompany,
            currentCtc: editCurrentCtc,
            expectedCtc: editExpectedCtc,
            noticePeriod: editNoticePeriod,
            currentLocation: editCurrentLoc,
            preferredLocation: editPreferredLoc,
            interviewAvailability: editAvailability,
            reasonForChange: editReasonForChange,
            offerInHand: editOfferInHand,
            notes: editNotes,
          }
        : item
    )

    setRepoList(updated)
    setEditingCandidate(null)
    showToast('Candidate profile updated successfully!')
  }

  return {
    editingCandidate,
    setEditingCandidate,
    editFullName,
    setEditFullName,
    editEmail,
    setEditEmail,
    editPhone,
    setEditPhone,
    editLinkedIn,
    setEditLinkedIn,
    editCurrentCompany,
    setEditCurrentCompany,
    editQualification,
    setEditQualification,
    editSkills,
    setEditSkills,
    editTechnology,
    setEditTechnology,
    editTotalExp,
    setEditTotalExp,
    editRelevantExp,
    setEditRelevantExp,
    editCurrentCtc,
    setEditCurrentCtc,
    editExpectedCtc,
    setEditExpectedCtc,
    editNoticePeriod,
    setEditNoticePeriod,
    editCurrentLoc,
    setEditCurrentLoc,
    editPreferredLoc,
    setEditPreferredLoc,
    editAvailability,
    setEditAvailability,
    editReasonForChange,
    setEditReasonForChange,
    editOfferInHand,
    setEditOfferInHand,
    editResumeReference,
    setEditResumeReference,
    editNotes,
    setEditNotes,
    handleOpenEdit,
    handleEditSubmit,
  }
}
