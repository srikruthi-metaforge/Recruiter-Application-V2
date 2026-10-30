import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Requirement, Submission } from '../../types'
import { CandidateRepoItem } from './SubmitCandidateModal.data'
import {
  candidatesService,
  resumeParserService,
  submissionsService,
} from '../../services/workspace.service'
import { apiErrorMessage } from '../pages/submissions/preamble'

type ExistingOnReq = {
  candidateMongoId: string
  email: string
  phone: string
  businessCandidateId: string
}

function normPhone(phone?: string | null): string {
  const digits = String(phone || '').replace(/[^\d]/g, '')
  return digits.length > 10 ? digits.slice(-10) : digits
}

function isUnreliableBusinessId(code?: string | null): boolean {
  const c = String(code || '').trim().toUpperCase()
  if (!c) return true
  if (c === 'CAND-10000' || c === 'CAND-00000' || c === 'CAND-0' || c === '10000') return true
  return false
}

function isDupOnRequirement(
  existing: ExistingOnReq[],
  candidate: {
    id?: string
    candidateId?: string
    email?: string
    phone?: string
  },
): { isDuplicate: boolean; matchReason?: string } {
  const mongoId = String(candidate.id || '')
    .trim()
    .toLowerCase()
  const email = String(candidate.email || '')
    .trim()
    .toLowerCase()
  const phone = normPhone(candidate.phone)
  const businessId = String(candidate.candidateId || '')
    .trim()
    .toLowerCase()

  const hit = existing.find(ex => {
    if (mongoId && /^[a-f\d]{24}$/i.test(mongoId) && ex.candidateMongoId === mongoId) return true
    if (email && ex.email && email === ex.email) return true
    if (phone.length >= 7 && ex.phone && phone === ex.phone) return true
    if (
      businessId &&
      ex.businessCandidateId &&
      businessId === ex.businessCandidateId &&
      !isUnreliableBusinessId(businessId) &&
      !isUnreliableBusinessId(ex.businessCandidateId)
    ) {
      return true
    }
    return false
  })
  return hit
    ? { isDuplicate: true, matchReason: 'Already linked to this requirement' }
    : { isDuplicate: false }
}

export function useSubmitCandidateModal({
  requirements,
  selectedReqId,
  onSubmit,
  onClose,
  currentRecruiterName,
}: {
  requirements: Requirement[]
  selectedReqId?: string | null
  onSubmit: (sub: Submission, opts?: { silent?: boolean }) => void | Promise<void>
  onClose: () => void
  currentRecruiterName: string
}) {
  const [pathMode, setPathMode] = useState<'existing' | 'new'>('existing')
  /** select = repository table; forward = Submit to Lead / client email form (previous flow). */
  const [flowStep, setFlowStep] = useState<'select' | 'forward'>('select')
  const [forwardCandidates, setForwardCandidates] = useState<CandidateRepoItem[]>([])
  const [targetReqId, setTargetReqId] = useState(selectedReqId || (requirements[0]?.id ?? ''))
  useEffect(() => {
    if (selectedReqId) setTargetReqId(selectedReqId)
  }, [selectedReqId])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRepoItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newCandidateName, setNewCandidateName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newExperience, setNewExperience] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newSkills, setNewSkills] = useState('')
  const [resumeName, setResumeName] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [existingCandidates, setExistingCandidates] = useState<CandidateRepoItem[]>([])
  const [existingOnTargetReq, setExistingOnTargetReq] = useState<ExistingOnReq[]>([])

  useEffect(() => {
    let active = true
    candidatesService
      .list()
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : data?.items || data?.data || []
        if (!active) return
        setExistingCandidates(
          list
            .filter(c => c && !c.deletedAt)
            .map(c => {
              const skills: string[] = Array.isArray(c.skills)
                ? c.skills
                : String(c.skills || '')
                    .split(',')
                    .map((x: string) => x.trim())
                    .filter(Boolean)
              const createdRaw = c.createdAt || c.createdDate || c.created_at
              let createdDate = ''
              if (createdRaw) {
                const d = new Date(createdRaw)
                createdDate = Number.isNaN(d.getTime()) ? String(createdRaw) : d.toISOString().slice(0, 10)
              }
              return {
                id: String(c.id || c._id),
                name: c.name || '',
                candidateId: String(c.candidateId || c.id || c._id),
                email: c.email || '',
                phone: c.phone || '',
                technology: c.technology || c.primarySkill || skills.slice(0, 4).join(', ') || skills[0] || '',
                skills: skills.join(', '),
                totalExperience:
                  c.totalExperienceYears != null ? `${c.totalExperienceYears} Years` : c.totalExperience || '',
                currentCompany: c.currentCompany || '',
                status: c.status || '',
                createdDate,
                createdBy: c.createdByName || c.createdBy || c.sourcedByRecruiterName || c.recruiterName || '',
              }
            }),
        )
      })
      .catch(() => active && setExistingCandidates([]))
    return () => {
      active = false
    }
  }, [])

  const targetReq =
    requirements.find(r => {
      const id = String(r.id || '')
      const code = String((r as any).reqCode || '')
      const mongo = String((r as any)._id || '')
      const selected = String(targetReqId || '')
      return selected && (id === selected || code === selected || mongo === selected)
    }) || requirements[0]

  // Server-scoped list for THIS requirement only — never use the global client store.
  useEffect(() => {
    let cancelled = false
    const mongoReqId = String((targetReq as any)?._id || '').trim()
    const reqCode = String((targetReq as any)?.reqCode || targetReqId || '')
      .replace(/\s*\([^()]*\)\s*$/, '')
      .trim()
    const queryId = mongoReqId || reqCode
    if (!queryId) {
      setExistingOnTargetReq([])
      return
    }
    submissionsService
      .list(`?requirementId=${encodeURIComponent(queryId)}`)
      .then((data: any) => {
        if (cancelled || !Array.isArray(data)) return
        setExistingOnTargetReq(
          data.map((raw: any) => {
            const cand = raw?.candidateId && typeof raw.candidateId === 'object' ? raw.candidateId : null
            const mongoCandidateId = String(
              cand?._id ||
                (typeof raw?.candidateId === 'string' && /^[a-f\d]{24}$/i.test(raw.candidateId)
                  ? raw.candidateId
                  : '') ||
                raw?.candidateMongoId ||
                '',
            )
              .trim()
              .toLowerCase()
            const businessCandidateId = String(
              cand?.candidateId ||
                raw?.businessCandidateId ||
                (typeof raw?.candidateId === 'string' && !/^[a-f\d]{24}$/i.test(raw.candidateId)
                  ? raw.candidateId
                  : '') ||
                '',
            )
              .trim()
              .toLowerCase()
            return {
              candidateMongoId: mongoCandidateId,
              email: String(raw?.email || cand?.email || '')
                .trim()
                .toLowerCase(),
              phone: normPhone(raw?.phone || cand?.phone),
              businessCandidateId,
            }
          }),
        )
      })
      .catch(() => {
        if (!cancelled) setExistingOnTargetReq([])
      })
    return () => {
      cancelled = true
    }
  }, [targetReqId, (targetReq as any)?._id, (targetReq as any)?.reqCode])

  const isCandidateDupOnTarget = useCallback(
    (c: { id?: string; candidateId?: string; email?: string; phone?: string }) =>
      isDupOnRequirement(existingOnTargetReq, c),
    [existingOnTargetReq],
  )

  const filteredCandidates = existingCandidates.filter(c => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.candidateId.toLowerCase().includes(q) ||
      c.technology.toLowerCase().includes(q) ||
      c.skills.toLowerCase().includes(q) ||
      c.currentCompany.toLowerCase().includes(q) ||
      String(c.createdBy || '').toLowerCase().includes(q)
    )
  })

  const selectedCandidates = useMemo(
    () => existingCandidates.filter(c => selectedIds.has(c.id)),
    [existingCandidates, selectedIds],
  )

  const selectedDupCount = useMemo(
    () => selectedCandidates.filter(c => isCandidateDupOnTarget(c).isDuplicate).length,
    [selectedCandidates, isCandidateDupOnTarget],
  )

  const submittableSelected = useMemo(
    () => selectedCandidates.filter(c => !isCandidateDupOnTarget(c).isDuplicate),
    [selectedCandidates, isCandidateDupOnTarget],
  )

  const existingDupResult = useMemo(() => {
    if (!selectedCandidate) return { isDuplicate: false as const }
    return isCandidateDupOnTarget(selectedCandidate)
  }, [selectedCandidate, isCandidateDupOnTarget])

  const newDupResult = useMemo(() => {
    if (!newCandidateName) return { isDuplicate: false as const }
    return isCandidateDupOnTarget({ email: newEmail, phone: newPhone })
  }, [newCandidateName, newEmail, newPhone, isCandidateDupOnTarget])

  const toggleSelectCandidate = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    const item = existingCandidates.find(c => c.id === id) || null
    setSelectedCandidate(item)
  }

  const toggleSelectAllFiltered = (idsOnPage: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      const allSelected = idsOnPage.length > 0 && idsOnPage.every(id => next.has(id))
      if (allSelected) {
        idsOnPage.forEach(id => next.delete(id))
      } else {
        idsOnPage.forEach(id => next.add(id))
      }
      return next
    })
  }

  const handleResumeUpload = async (file: File) => {
    setResumeName(file.name)
    setParseError(null)
    setIsParsing(true)
    try {
      const res = await resumeParserService.parse(file)
      const d = res?.data
      if (d) {
        setNewCandidateName(d.candidateName || '')
        setNewEmail(d.email || '')
        setNewPhone(d.contactNumber || '')
        setNewExperience(d.totalExperience || '')
        setNewCompany(d.currentCompany || '')
        setNewSkills(d.skills || d.technologies || '')
      }
    } catch (err) {
      setParseError(apiErrorMessage(err))
    } finally {
      setIsParsing(false)
    }
  }

  /** Open the previous Submit-to-Lead / client-mail form for selected repository candidates. */
  const handleContinueToForwardForm = (e: React.FormEvent) => {
    e.preventDefault()
    const toForward = submittableSelected
    if (!toForward.length) return
    setForwardCandidates(toForward)
    setFlowStep('forward')
  }

  const handleBackToSelect = () => {
    setFlowStep('select')
  }

  const handleForwardSuccess = () => {
    setSelectedIds(new Set())
    setSelectedCandidate(null)
    setForwardCandidates([])
    setFlowStep('select')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('submissions_updated'))
    }
    onClose()
  }

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCandidateName || newDupResult.isDuplicate || isSubmitting) return
    setIsSubmitting(true)
    try {
      // Persist new candidate to Mongo, then open the same forward form as Path 1.
      const { createCandidateFromForm } = await import('../../services/candidatePayload')
      const saved: any = await createCandidateFromForm({
        name: newCandidateName,
        email: newEmail,
        phone: newPhone || `pending-${Date.now()}`,
        totalExperience: newExperience,
        company: newCompany,
        skills: newSkills,
      })
      const item: CandidateRepoItem = {
        id: String(saved?.id || saved?._id || `tmp-${Date.now()}`),
        name: saved?.name || newCandidateName,
        candidateId: String(saved?.candidateId || saved?.id || saved?._id || ''),
        email: saved?.email || newEmail,
        phone: saved?.phone || newPhone,
        technology: newSkills || '',
        skills: newSkills || '',
        totalExperience:
          saved?.totalExperienceYears != null
            ? `${saved.totalExperienceYears} Years`
            : newExperience || '',
        currentCompany: saved?.currentCompany || newCompany || '',
        status: saved?.status || 'Active',
      }
      setForwardCandidates([item])
      setFlowStep('forward')
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        window.alert(err?.message || apiErrorMessage(err) || 'Failed to save candidate')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    pathMode,
    setPathMode,
    flowStep,
    setFlowStep,
    forwardCandidates,
    handleContinueToForwardForm,
    handleBackToSelect,
    handleForwardSuccess,
    targetReqId,
    searchQuery,
    setSearchQuery,
    selectedIds,
    selectedCandidates,
    selectedDupCount,
    submittableSelected,
    toggleSelectCandidate,
    toggleSelectAllFiltered,
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
    isSubmitting,
    targetReq,
    existingDupResult,
    newDupResult,
    filteredCandidates,
    isCandidateDupOnTarget,
    setNewCandidateName,
    setNewEmail,
    setNewPhone,
    setNewExperience,
    setNewCompany,
    setNewSkills,
    handleResumeUpload,
    parseError,
    handleSubmitNew,
  }
}
