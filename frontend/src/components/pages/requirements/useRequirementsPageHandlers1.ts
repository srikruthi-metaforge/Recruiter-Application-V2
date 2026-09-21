import { useState } from 'react'
import { Requirement } from '../../../types'
import type { RequirementsVmState } from './useRequirementsPageState'

export function useRequirementsPageHandlers1(s: RequirementsVmState) {
  const {
    role, onUpdateRequirements, onAddActivityLog,
    onNavigateToDashboard, localRequirements, setLocalRequirements, selectedReqForDetail,
    setSelectedReqForDetail, selectedReqIds, setSelectedReqIds, setIsAssignModalOpen,
    isAssignMyselfChecked, setIsAssignMyselfChecked, selectedRecruiterNames, setSelectedRecruiterNames,
    setRecruiterSearchQuery, currentUserName, showToast
  } = s

  const handleSingleSelfAssign = (req: Requirement) => {
    const updated = localRequirements.map(r =>
      r.id === req.id
        ? { ...r, owner: currentUserName, assignmentStatus: 'Assigned' as const }
        : r
    )
    setLocalRequirements(updated)
    onUpdateRequirements?.(updated)
    showToast(`Successfully assigned requirement ${req.id} to ${currentUserName} (Myself)`)

    if (onNavigateToDashboard) {
      setTimeout(() => {
        onNavigateToDashboard()
      }, 400)
    }
  }

  const handleSelfAssign = () => {
    if (selectedReqIds.size === 0) return
    const count = selectedReqIds.size
    const updated = localRequirements.map(r =>
      selectedReqIds.has(r.id)
        ? { ...r, owner: currentUserName, assignmentStatus: 'Assigned' as const }
        : r
    )
    setLocalRequirements(updated)
    onUpdateRequirements?.(updated)
    setSelectedReqIds(new Set())
    showToast(`Successfully assigned ${count} requirement(s) to ${currentUserName} (Myself)`)

    if (onNavigateToDashboard) {
      setTimeout(() => {
        onNavigateToDashboard()
      }, 400)
    }
  }

  const handleConfirmModalAssignment = () => {
    const assignees: string[] = []
    if (isAssignMyselfChecked) {
      assignees.push(currentUserName)
    }
    selectedRecruiterNames.forEach(name => assignees.push(name))

    if (assignees.length === 0) return

    const assigneesText = assignees.join(', ')
    const updated = localRequirements.map(r =>
      selectedReqIds.has(r.id) || (selectedReqForDetail && r.id === selectedReqForDetail.id)
        ? { ...r, owner: assigneesText, assignmentStatus: 'Assigned' as const, submissions: r.submissions || 7 }
        : r
    )

    setLocalRequirements(updated)
    onUpdateRequirements?.(updated)

    if (selectedReqForDetail) {
      setSelectedReqForDetail({
        ...selectedReqForDetail,
        owner: assigneesText,
        assignmentStatus: 'Assigned',
        submissions: selectedReqForDetail.submissions || 7,
      })
    }

    const assignedToMyself = isAssignMyselfChecked || assignees.some(a => a.toLowerCase().includes(currentUserName.toLowerCase()) || a.toLowerCase().includes('harish'))

    setSelectedReqIds(new Set())
    setIsAssignModalOpen(false)
    setSelectedRecruiterNames(new Set())
    setIsAssignMyselfChecked(true)
    setRecruiterSearchQuery('')

    showToast(`Successfully assigned ${assignees.length} recruiter(s)`)

    onAddActivityLog?.({
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      userName: currentUserName,
      userEmail: 'user@metaforgeit.com',
      userRole: role as any,
      userAvatar: currentUserName.charAt(0),
      action: `Assigned Requirement(s) to ${assigneesText}`,
      category: 'Requirements',
      targetEntity: `Requirement Assignment`,
      ipAddress: '192.168.1.45',
      status: 'Success',
      details: `Assigned requirement workload to ${assigneesText}.`,
    })

    if (assignedToMyself && onNavigateToDashboard) {
      setTimeout(() => {
        onNavigateToDashboard()
      }, 400)
    }
  }

  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
  const [selectedReqForRevoke, setSelectedReqForRevoke] = useState<Requirement | null>(null)

  const handleOpenRevoke = (req: Requirement) => {
    setSelectedReqForRevoke(req)
    setIsRevokeModalOpen(true)
  }

  return {
    handleSingleSelfAssign, handleSelfAssign, handleConfirmModalAssignment, handleOpenRevoke,
    isRevokeModalOpen, setIsRevokeModalOpen, selectedReqForRevoke
  }
}
