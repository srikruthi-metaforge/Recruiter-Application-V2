import React, { useMemo, useRef } from 'react'
import { addSubmissionToStore } from '../../../data/submissionsStore'
import { workspaceService } from '../../../services/workspace.service'
import { ApiError } from '../../../lib/api'
import { hasCapability } from '../../../store/session'
import { applyBillRate, buildTrackerRow } from './trackerPresets.data'
import type { SubmitToLeadVmState } from './useSubmitToLeadPageState'

function rowValue(row: Record<string, string>, names: string[]): string {
  for (const name of names) {
    if (row[name]) return row[name]
  }
  return ''
}

function normPhone(phone?: string | null): string {
  const digits = String(phone || '').replace(/[^\d]/g, '')
  return digits.length > 10 ? digits.slice(-10) : digits
}

export function useSubmitToLeadPageHandlers3(s: SubmitToLeadVmState & Record<string, any>) {
  const {
    requirement, onBack, onSubmitSuccess, columnList, hiddenColumns,
    currentReqId, trackerRows, setTrackerRows, showToast, submissionTick,
    selectedCandidates, clientName, toRecipients, ccRecipients, threadSubject, recruiterName,
    recruiterEmail, emailGreeting, introduction, headerColor, existingOnThisRequirement,
  } = s
  const submittingRef = useRef(false)

  const handleUpdateCell = (rowIndex: number, colName: string, value: string) => {
    setTrackerRows((prev: Record<string, string>[]) => {
      const next = [...prev]
      next[rowIndex] = applyBillRate({ ...next[rowIndex], [colName]: value }, colName)
      return next
    })
  }

  const handleAddTrackerRow = () => {
    const row = buildTrackerRow(columnList, {}, trackerRows.length, { requirement, recruiterName })
    setTrackerRows([...trackerRows, row])
    showToast('New editable row added to submission tracker!')
  }

  // Duplicate only if this candidate is already on THIS requirement (from server-scoped list).
  const duplicateCheckResults = useMemo(() => {
    const existing = Array.isArray(existingOnThisRequirement) ? existingOnThisRequirement : []
    const candidateList = Array.isArray(selectedCandidates) ? selectedCandidates : []
    return candidateList.map((cand: any, index: number) => {
      const row = trackerRows?.[index] || {}
      const candidateName =
        cand.name || rowValue(row, ['Candidate Name', 'Name of Candidate', 'Full Name of Candidate', 'First Name'])
      const email = String(cand.email || rowValue(row, ['Email ID', 'Mail ID']) || '')
        .trim()
        .toLowerCase()
      const phone = normPhone(cand.phone || rowValue(row, ['Contact Number', 'Mobile No', 'Candidate Mobile Number']))
      const mongoId = String(cand.id || cand._id || '')
        .trim()
        .toLowerCase()
      const businessId = String(cand.candidateId || '')
        .trim()
        .toLowerCase()

      const unreliableBiz = (code?: string) => {
        const c = String(code || '').trim().toUpperCase()
        return !c || c === 'CAND-10000' || c === 'CAND-00000' || c === 'CAND-0' || c === '10000'
      }
      const hit = existing.find((ex: any) => {
        if (mongoId && /^[a-f\d]{24}$/i.test(mongoId) && ex.candidateMongoId === mongoId) return true
        if (email && ex.email && email === ex.email) return true
        if (phone.length >= 7 && ex.phone && phone === ex.phone) return true
        if (
          businessId &&
          ex.businessCandidateId &&
          businessId === ex.businessCandidateId &&
          !unreliableBiz(businessId) &&
          !unreliableBiz(ex.businessCandidateId)
        ) {
          return true
        }
        return false
      })

      return {
        candidate: cand,
        row,
        candidateName: candidateName || 'Selected Candidate',
        isDuplicate: Boolean(hit),
        matchReason: hit
          ? 'Already linked to this requirement'
          : undefined,
        existingSubmission: hit
          ? {
              recruiter: hit.recruiter,
              date: hit.date,
              stage: hit.stage,
              candidate: hit.name,
            }
          : undefined,
      }
    })
  }, [selectedCandidates, trackerRows, existingOnThisRequirement, submissionTick])

  const hasDuplicateSubmission = duplicateCheckResults.some((r: any) => r.isDuplicate)
  const firstDuplicate = duplicateCheckResults.find((r: any) => r.isDuplicate)
  const validCandidateResults = useMemo(() => duplicateCheckResults.filter((r: any) => !r.isDuplicate), [duplicateCheckResults])
  const validCandidatesToSubmit = useMemo(() => validCandidateResults.map((r: any) => r.candidate), [validCandidateResults])
  const allCandidatesAreDuplicates = useMemo(() => duplicateCheckResults.length > 0 && duplicateCheckResults.every((r: any) => r.isDuplicate), [duplicateCheckResults])

  const handleSubmitFinal = async (mode: 'lead' | 'client' = 'client') => {
    if (submittingRef.current) return

    if (!hasCapability('submitToClients')) {
      showToast('Permission Restricted: Super Admin has disabled submissions for your account.')
      return
    }

    if (!s.confirmForwardChecked) {
      showToast('Please check the confirmation checkbox before submitting.')
      return
    }

    if (!validCandidatesToSubmit.length) {
      showToast('The candidate is already submitted for this requirement.')
      return
    }

    const toLead = mode === 'lead'
    const selectedLeadId = String(s.selectedLeadId || '').trim()
    const selectedLead = (Array.isArray(s.availableLeads) ? s.availableLeads : []).find(
      (l: { id: string }) => l.id === selectedLeadId,
    )

    if (toLead && !selectedLeadId) {
      showToast('Select a lead from the dropdown before submitting to lead.')
      return
    }

    const uniqueEmails = (emails: string[]) => [...new Set(
      emails.map((email: string) => String(email || '').trim().toLowerCase()).filter((email: string) => email.includes('@'))
    )]

    // Client TO/CC only when submitting to client (email thread).
    const clientEmails = !toLead ? uniqueEmails(Array.isArray(toRecipients) ? toRecipients : []) : []
    const rawLeadEmails = Array.isArray(s.leadEmails) && s.leadEmails.length > 0
      ? s.leadEmails
      : (s.leadEmail ? String(s.leadEmail).split(',') : [])
    const leadEmails = uniqueEmails([
      ...(selectedLead?.email ? [selectedLead.email] : []),
      ...rawLeadEmails,
    ])

    if (toLead && !leadEmails.length) {
      showToast('Selected lead has no email. Pick another lead or add a lead email.')
      return
    }
    if (!toLead && !clientEmails.length && !leadEmails.length) {
      showToast('Add a client or lead email recipient before submitting.')
      return
    }

    const reqCode =
      String((requirement as any)?.reqCode || '').trim() ||
      String(requirement?.id || currentReqId || '').replace(/\s*\([^()]*\)\s*$/, '').trim()
    const requirementMongoId = String((requirement as any)?._id || '').trim() || undefined
    if (!reqCode && !requirementMongoId) {
      showToast('This submission is missing a requirement.')
      return
    }

    const stage = toLead ? 'Submitted to Lead' : 'Submitted to Client'
    // Keep destination UI in sync with the button that was clicked.
    if (toLead) {
      s.setSubmitToLeadChecked?.(true)
      s.setForwardLoopChecked?.(false)
    } else {
      s.setSubmitToLeadChecked?.(false)
      s.setForwardLoopChecked?.(true)
    }

    submittingRef.current = true
    const targetClient = clientName || requirement?.client || ''
    const ccEmails = uniqueEmails(!toLead && Array.isArray(ccRecipients) ? ccRecipients : [])
      .filter((email: string) => !clientEmails.includes(email) && !leadEmails.includes(email))

    try {
      const columns = columnList.filter((col: string) => !hiddenColumns.has(col))
      const rowsForEmail = validCandidateResults
        .map((result: any) => result.row)
        .filter((row: Record<string, string>) => row && Object.keys(row).length > 0)
      const validCandidateIds = validCandidatesToSubmit.map((c: any) => c.id).filter(Boolean)
      let savedCount = 0
      let emailAttached = false
      let blockedCount = duplicateCheckResults.length - validCandidatesToSubmit.length

      for (let i = 0; i < validCandidatesToSubmit.length; i++) {
        const candObj = validCandidatesToSubmit[i]
        const row = validCandidateResults[i]?.row || {}
        // Lead path is in-app only (notification + lead inbox). Client path may email.
        const includeEmail = !toLead && !emailAttached
        try {
          const saved: any = await workspaceService.createSubmission({
            candidateId: candObj.id,
            candidateIds: includeEmail ? validCandidateIds : undefined,
            req: reqCode,
            reqCode,
            requirementId: requirementMongoId || requirement?._id || undefined,
            candidate: candObj.name || rowValue(row, ['Candidate Name', 'Name of Candidate', 'Full Name of Candidate']),
            email: candObj.email || rowValue(row, ['Email ID', 'Mail ID']),
            phone: candObj.phone || rowValue(row, ['Contact Number', 'Mobile No', 'Candidate Mobile Number']),
            experience: candObj.totalExperience || rowValue(row, ['Total Yrs of Exp', 'Total Experience', 'Total Exp']),
            client: targetClient,
            stage,
            leadId: selectedLeadId || undefined,
            clientEmails: includeEmail ? clientEmails : undefined,
            // Do not attach leadEmails on lead-review path — that previously forced
            // outbound mail and confused "submit to lead" with client email send.
            leadEmail: includeEmail && leadEmails.length > 0 ? leadEmails[0] : undefined,
            leadEmails: includeEmail && leadEmails.length ? leadEmails : undefined,
            ccEmails: includeEmail ? ccEmails : undefined,
            emailSubject: includeEmail ? threadSubject : undefined,
            trackerColumns: includeEmail ? columns : undefined,
            trackerRows: includeEmail ? rowsForEmail : undefined,
            trackerHeaderColor: includeEmail ? headerColor : undefined,
            emailGreeting: includeEmail ? emailGreeting : undefined,
            emailIntroduction: includeEmail ? introduction : undefined,
            recruiterName: includeEmail ? recruiterName : undefined,
            recruiterEmail: includeEmail ? recruiterEmail : undefined,
          } as any)
          if (includeEmail) emailAttached = true
          savedCount += 1
          const savedStage = String(saved?.stage || stage)
          addSubmissionToStore({
            id: saved?.id || saved?.submissionId || `${reqCode}-${candObj.id}`,
            candidate: candObj.name || '',
            candidateId: candObj.id || '',
            req: reqCode,
            reqCode,
            requirementId: requirementMongoId || requirement?._id || '',
            client: saved?.client || targetClient,
            date: saved?.date || new Date().toLocaleDateString('en-GB'),
            stage: savedStage,
            match: saved?.match || '',
            recruiter: saved?.recruiter || recruiterName || '',
            email: candObj.email || '',
            phone: candObj.phone || '',
            experience: candObj.totalExperience || '',
            leadId: saved?.leadId || selectedLeadId || undefined,
          } as any)
        } catch (err) {
          if (err instanceof ApiError && err.status === 409) {
            blockedCount += 1
            continue
          }
          throw err
        }
      }

      if (!savedCount) {
        showToast('The candidate is already submitted for this requirement.')
        return
      }

      let msg = toLead
        ? `Sent ${savedCount} candidate(s) to lead${selectedLead ? ` ${selectedLead.name}` : ''} — they will see it under Submissions (Submitted to Lead).`
        : `Submitted ${savedCount} candidate(s) to client successfully.`
      if (blockedCount > 0) msg += ` (${blockedCount} duplicate candidate(s) excluded).`
      showToast(msg)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissions_updated'))
        window.dispatchEvent(new CustomEvent('notifications_updated'))
      }

      if (onSubmitSuccess) setTimeout(() => onSubmitSuccess(), 1200)
      else setTimeout(() => onBack(), 1200)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'The submission could not be saved or emailed.'
      showToast(message)
    } finally {
      submittingRef.current = false
    }
  }

  const visibleColumns = columnList.filter((col: string) => !hiddenColumns.has(col))

  return {
    handleUpdateCell, handleAddTrackerRow, duplicateCheckResults, hasDuplicateSubmission,
    firstDuplicate, validCandidateResults, validCandidatesToSubmit, allCandidatesAreDuplicates,
    handleSubmitFinal, visibleColumns
  }
}

