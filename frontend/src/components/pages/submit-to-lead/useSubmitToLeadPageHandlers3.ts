import React, { useMemo } from 'react'
import { createOrUpdateForwardRequest, approveForwardRequest, rejectForwardRequest } from '../../../data/forwardRequestsStore'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'
import type { SubmitToLeadVmState } from './useSubmitToLeadPageState'

export function useSubmitToLeadPageHandlers3(s: SubmitToLeadVmState & Record<string, any>) {
  const {
    requirement, onBack, onSubmitSuccess, columnList,
    hiddenColumns, currentReqId, trackerRows, setTrackerRows, showToast
  } = s

  const handleUpdateCell = (rowIndex: number, colName: string, value: string) => {
    setTrackerRows((prev: Record<string, string>[]) => {
      const next = [...prev]
      next[rowIndex] = { ...next[rowIndex], [colName]: value }
      return next
    })
  }

  const handleAddTrackerRow = () => {
    const newRow: Record<string, string> = {}
    columnList.forEach(col => {
      if (col === 'Sl.No') newRow[col] = String(trackerRows.length + 1)
      else if (col === 'Vendor Name') newRow[col] = 'MetaForge'
      else newRow[col] = ''
    })
    setTrackerRows([...trackerRows, newRow])
    showToast('New editable row added to submission tracker!')
  }

  // Duplicate Check computation for attached candidates / tracker rows
  const duplicateCheckResults = useMemo(() => {
    if (!trackerRows || trackerRows.length === 0) return []
    return trackerRows.map((row: Record<string, string>) => {
      const candidateName = row['Candidate Name'] || row['Full Name of the candidate'] || row['First Name']
      const email = row['Email id'] || row['Mail ID'] || row['Email ID']
      const phone = row['Contact Number'] || row['MOBILE NO'] || row['Candidate Mobile Number']
      const candidateId = row['Sl No'] || row['RV ID']
      return {
        row,
        candidateName: candidateName || 'Selected Candidate',
        ...checkDuplicateSubmission(currentReqId, {
          email,
          phone,
          candidateId,
          name: candidateName,
        }),
      }
    })
  }, [trackerRows, currentReqId])

  const hasDuplicateSubmission = duplicateCheckResults.some((r: any) => r.isDuplicate)
  const firstDuplicate = duplicateCheckResults.find((r: any) => r.isDuplicate)

  const handleSubmitFinal = () => {
    if (hasDuplicateSubmission && firstDuplicate) {
      showToast(`⚠️ Duplicate Submission: Candidate "${firstDuplicate.candidateName}" has already been submitted for this requirement. Cannot submit!`)
      return
    }
    showToast(`Forwarded candidate to client loop (${requirement?.client || 'Client Account'}) — Recorded submission successfully!`)
    if (onSubmitSuccess) {
      setTimeout(() => onSubmitSuccess(), 1200)
    } else {
      setTimeout(() => onBack(), 1200)
    }
  }

  const visibleColumns = columnList.filter(col => !hiddenColumns.has(col))

  return {
    handleUpdateCell, handleAddTrackerRow, duplicateCheckResults, hasDuplicateSubmission,
    firstDuplicate, handleSubmitFinal, visibleColumns
  }
}
