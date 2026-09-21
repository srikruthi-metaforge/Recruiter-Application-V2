import React, { useState, useMemo } from 'react'
import { Requirement, Submission } from '../../types'
import { checkDuplicateSubmission } from '../../data/submissionsStore'
import { CandidateRepoItem, SAMPLE_EXISTING_CANDIDATES } from './SubmitCandidateModal.data'

export function useSubmitCandidateModal({
  requirements,
  selectedReqId,
  onSubmit,
  onClose,
  currentRecruiterName,
}: {
  requirements: Requirement[]
  selectedReqId?: string | null
  onSubmit: (sub: Submission) => void
  onClose: () => void
  currentRecruiterName: string
}) {
  const [pathMode, setPathMode] = useState<'existing' | 'new'>('existing')
  const [targetReqId, setTargetReqId] = useState(selectedReqId || (requirements[0]?.id ?? 'REQ-001'))
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRepoItem | null>(SAMPLE_EXISTING_CANDIDATES[0])
  const [newCandidateName, setNewCandidateName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newExperience, setNewExperience] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newSkills, setNewSkills] = useState('')
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  const targetReq = requirements.find(r => r.id === targetReqId) || requirements[0]

  const existingDupResult = useMemo(() => {
    if (!selectedCandidate || !targetReqId) return { isDuplicate: false }
    return checkDuplicateSubmission(targetReqId, {
      email: selectedCandidate.email,
      phone: selectedCandidate.phone,
      candidateId: selectedCandidate.candidateId,
      name: selectedCandidate.name,
    })
  }, [targetReqId, selectedCandidate])

  const newDupResult = useMemo(() => {
    if (!newCandidateName || !targetReqId) return { isDuplicate: false }
    return checkDuplicateSubmission(targetReqId, {
      email: newEmail,
      phone: newPhone,
      name: newCandidateName,
    })
  }, [targetReqId, newCandidateName, newEmail, newPhone])

  const filteredCandidates = SAMPLE_EXISTING_CANDIDATES.filter(c => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      c.name.toLowerCase().includes(q) ||
      c.technology.toLowerCase().includes(q) ||
      c.skills.toLowerCase().includes(q) ||
      c.currentCompany.toLowerCase().includes(q)
    )
  })

  const handleSimulateResumeUpload = (fileLabel?: string) => {
    const filename = fileLabel || 'Anish_Malhotra_Senior_React_Dev_Resume.pdf'
    setResumeName(filename)
    setIsParsing(true)
    setTimeout(() => {
      setNewCandidateName('Anish Malhotra')
      setNewEmail('anish.malhotra@devnet.io')
      setNewPhone('+91 98123 45678')
      setNewExperience('6 Years 2 Months')
      setNewCompany('Wipro Limited')
      setNewSkills('React.js, TypeScript, Node.js, Tailwind CSS, PostgreSQL')
      setIsParsing(false)
    }, 600)
  }

  const handleSubmitExisting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCandidate || existingDupResult.isDuplicate) return
    onSubmit({
      id: `SUB-${Math.floor(Math.random() * 900 + 100)}`,
      candidate: selectedCandidate.name,
      req: targetReqId,
      client: targetReq?.client || 'Enterprise Client',
      date: 'Aug 19, 2026',
      stage: 'Submitted',
      match: '94%',
      recruiter: currentRecruiterName || 'Marcus Chen',
      email: selectedCandidate.email,
      phone: selectedCandidate.phone,
      experience: selectedCandidate.totalExperience,
    })
    onClose()
  }

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCandidateName || newDupResult.isDuplicate) return
    onSubmit({
      id: `SUB-${Math.floor(Math.random() * 900 + 100)}`,
      candidate: newCandidateName,
      req: targetReqId,
      client: targetReq?.client || 'Enterprise Client',
      date: 'Aug 19, 2026',
      stage: 'Submitted',
      match: '96%',
      recruiter: currentRecruiterName || 'Marcus Chen',
      email: newEmail || 'new.candidate@devnet.io',
      phone: newPhone || '+91 98765 43210',
      experience: newExperience || '5 Years',
    })
    onClose()
  }

  return {
    pathMode,
    setPathMode,
    targetReqId,
    searchQuery,
    setSearchQuery,
    selectedCandidate,
    setSelectedCandidate,
    newCandidateName,
    newEmail,
    newPhone,
    newExperience,
    newCompany,
    newSkills,
    resumeName,
    isParsing,
    targetReq,
    existingDupResult,
    newDupResult,
    filteredCandidates,
    setNewCandidateName,
    setNewEmail,
    setNewPhone,
    setNewExperience,
    setNewCompany,
    setNewSkills,
    handleSimulateResumeUpload,
    handleSubmitExisting,
    handleSubmitNew,
  }
}
