import React, { useState } from 'react'
import { createOrUpdateForwardRequest, approveForwardRequest, rejectForwardRequest } from '../../../data/forwardRequestsStore'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'
import type { SubmitToLeadVmState } from './useSubmitToLeadPageState'

export function useSubmitToLeadPageHandlers1(s: SubmitToLeadVmState) {
  const {
    selectedCandidates, requirement, columnList, setColumnList,
    setDraggedColIndex, dragOverColIndex, setDragOverColIndex, selectedColIndex,
    setSelectedColIndex, isDraggingRef, draggedColIndexRef, showToast
  } = s
  const handleDragStart = (e: React.DragEvent, index: number) => {
    isDraggingRef.current = true
    draggedColIndexRef.current = index
    setDraggedColIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColIndex !== index) {
      setDragOverColIndex(index)
    }
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColIndex !== index) {
      setDragOverColIndex(index)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()

    const rawData = e.dataTransfer.getData('text/plain')
    let fromIndex = draggedColIndexRef.current

    if (fromIndex === null && rawData) {
      const parsed = parseInt(rawData, 10)
      if (!isNaN(parsed)) fromIndex = parsed
    }

    if (fromIndex !== null && !isNaN(fromIndex) && fromIndex !== dropIndex) {
      const colName = columnList[fromIndex]
      setColumnList(prev => {
        const next = [...prev]
        const [movedItem] = next.splice(fromIndex!, 1)
        next.splice(dropIndex, 0, movedItem)
        return next
      })
      showToast(`Placed "${colName}" at position ${dropIndex + 1}!`)
    }

    draggedColIndexRef.current = null
    setDraggedColIndex(null)
    setDragOverColIndex(null)
  }

  const handleDragEnd = () => {
    draggedColIndexRef.current = null
    setDraggedColIndex(null)
    setDragOverColIndex(null)
    setTimeout(() => {
      isDraggingRef.current = false
    }, 200)
  }

  const handleChipClick = (index: number) => {
    if (isDraggingRef.current) return

    if (selectedColIndex === null) {
      setSelectedColIndex(index)
      showToast(`Picked up "${columnList[index]}" — click target position to place it!`)
    } else if (selectedColIndex === index) {
      setSelectedColIndex(null)
    } else {
      setColumnList(prev => {
        const next = [...prev]
        const [moved] = next.splice(selectedColIndex, 1)
        next.splice(index, 0, moved)
        return next
      })
      showToast(`Placed column at position ${index + 1}!`)
      setSelectedColIndex(null)
    }
  }

  const moveColumnLeft = (index: number) => {
    if (index <= 0) return
    setColumnList(prev => {
      const next = [...prev]
      const [col] = next.splice(index, 1)
      next.splice(index - 1, 0, col)
      return next
    })
  }

  const moveColumnRight = (index: number) => {
    if (index >= columnList.length - 1) return
    setColumnList(prev => {
      const next = [...prev]
      const [col] = next.splice(index, 1)
      next.splice(index + 1, 0, col)
      return next
    })
  }

  // Tracker Table Rows (100% Manually Editable)
  const [trackerRows, setTrackerRows] = useState<Record<string, string>[]>(() => {
    if (selectedCandidates && selectedCandidates.length > 0) {
      return selectedCandidates.map((c, idx) => ({
        'Sl No': String(idx + 1),
        'Submission Date': '19/08/2026',
        'Skillset': requirement?.skills?.join(', ') || 'QA Lead, Selenium, Automation Frameworks',
        'Candidate Name': c.name || 'Priyanka Sharma',
        'Contact Number': c.phone || '+91 98210 44905',
        'Email id': c.email || 'priyanka.sharma@gmail.com',
        'Total Yrs of Exp': c.totalExperience || '11 Years 3 Months',
        'Relevant Exp': c.relevantExperience || '9 Years',
        'Current Company': c.currentCompany || 'Cognizant Technology Solutions',
        'Current CTC': c.currentCtc || '18.5 LPA',
        'Expected CTC/Rate card': c.expectedCtc || '25 LPA',
        'Notice period': c.noticePeriod || '30 Days',
        'Current Location': c.currentLocation || 'Bangalore',
        'Preferred Location': c.preferredLocation || 'Bangalore / Hybrid',
        'Availability for Interview': c.interviewAvailability || 'Available weekdays after 4 PM',
        'Reason': c.reasonForChange || 'Career Advancement & Technical Leadership',
        'Offer in Hand': c.offerInHand || 'Yes (28 LPA from Capgemini)',
        'Linkedin URL': 'https://linkedin.com/in/priyanka-sharma',
      }))
    }
    return [
      {
        'Sl No': '1',
        'Submission Date': '19/08/2026',
        'Skillset': requirement?.skills?.join(', ') || 'QA Lead, Selenium, Test Management',
        'Candidate Name': 'Priyanka Sharma',
        'Contact Number': '+91 98210 44905',
        'Email id': 'priyanka.sharma@gmail.com',
        'Total Yrs of Exp': '11 Years 3 Months',
        'Relevant Exp': '9 Years',
        'Current Company': 'Cognizant Technology Solutions',
        'Current CTC': '18.5 LPA',
        'Expected CTC/Rate card': '25 LPA',
        'Notice period': '30 Days',
        'Current Location': 'Bangalore',
        'Preferred Location': 'Bangalore / Hybrid',
        'Availability for Interview': 'Available weekdays after 4 PM',
        'Reason': 'Career Advancement',
        'Offer in Hand': 'Yes (28 LPA from Capgemini)',
        'Linkedin URL': 'https://linkedin.com/in/priyanka-sharma',
      },
    ]
  })

  return {
    handleDragStart, handleDragEnter, handleDragOver, handleDrop,
    handleDragEnd, handleChipClick, moveColumnLeft, moveColumnRight,
    trackerRows, setTrackerRows
  }
}
