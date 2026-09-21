import { Requirement } from '../../../types'
import type { RequirementsVmState } from './useRequirementsPageState'

export function useRequirementsPageHandlers2(s: RequirementsVmState) {
  const {
    role, onUpdateRequirements, onAddActivityLog,
    localRequirements, setLocalRequirements, selectedReqForDetail, setSelectedReqForDetail,
    currentUserName, showToast
  } = s

  const handleConfirmRevoke = (reqId: string, reason: string, isDirectRevoke: boolean) => {
    const target = localRequirements.find(r => r.id === reqId)
    const oldOwner = target?.owner || 'Assigned Recruiter'

    let updated: Requirement[]
    if (isDirectRevoke) {
      updated = localRequirements.map(r =>
        r.id === reqId
          ? {
              ...r,
              owner: 'Unassigned',
              assignmentStatus: 'Unassigned' as const,
              revokeRequested: false,
              revokeReason: undefined,
              revokeRequestedBy: undefined,
              revokeRequestedAt: undefined,
            }
          : r
      )
      showToast(`Requirement ${reqId} revoked successfully and reverted to Unassigned state.`)
      onAddActivityLog?.({
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        userName: currentUserName,
        userEmail: 'user@metaforgeit.com',
        userRole: role as any,
        userAvatar: currentUserName.charAt(0),
        action: `Revoked Requirement ${reqId} & Reverted to Unassigned`,
        category: 'Requirements',
        targetEntity: `Requirement ${reqId}`,
        targetId: reqId,
        clientName: target?.client,
        ipAddress: '192.168.1.45',
        status: 'Success',
        details: `Reason for revocation: ${reason}. Previous owner was ${oldOwner}. Reverted requirement to Unassigned state.`,
      })
    } else {
      updated = localRequirements.map(r =>
        r.id === reqId
          ? {
              ...r,
              revokeRequested: true,
              revokeReason: reason,
              revokeRequestedBy: currentUserName,
              revokeRequestedAt: 'Just now',
            }
          : r
      )
      showToast(`Revoke permission request for ${reqId} submitted to Team Lead / Admin for approval.`)
      onAddActivityLog?.({
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        userName: currentUserName,
        userEmail: 'user@metaforgeit.com',
        userRole: role as any,
        userAvatar: currentUserName.charAt(0),
        action: `Requested Revoke Permission for Requirement ${reqId}`,
        category: 'Requirements',
        targetEntity: `Requirement ${reqId}`,
        targetId: reqId,
        clientName: target?.client,
        ipAddress: '192.168.1.45',
        status: 'Warning',
        details: `Reason for revoke request: ${reason}. Pending approval from Team Lead / Admin.`,
      })
    }

    setLocalRequirements(updated)
    onUpdateRequirements?.(updated)
    if (selectedReqForDetail && selectedReqForDetail.id === reqId) {
      const updatedReq = updated.find(r => r.id === reqId) || null
      setSelectedReqForDetail(updatedReq)
    }
  }

  const handleGrantRevokeApproval = (reqId: string) => {
    const target = localRequirements.find(r => r.id === reqId)
    const requester = target?.revokeRequestedBy || 'Recruiter'
    const reason = target?.revokeReason || 'Revoke request approved'

    const updated = localRequirements.map(r =>
      r.id === reqId
        ? {
            ...r,
            owner: 'Unassigned',
            assignmentStatus: 'Unassigned' as const,
            revokeRequested: false,
            revokeReason: undefined,
            revokeRequestedBy: undefined,
            revokeRequestedAt: undefined,
          }
        : r
    )

    setLocalRequirements(updated)
    onUpdateRequirements?.(updated)
    showToast(`Granted revoke approval for ${reqId}. Requirement reverted to Unassigned state.`)

    onAddActivityLog?.({
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      userName: currentUserName,
      userEmail: 'user@metaforgeit.com',
      userRole: role as any,
      userAvatar: currentUserName.charAt(0),
      action: `Approved Revoke Permission for Requirement ${reqId} (Reverted to Unassigned)`,
      category: 'Requirements',
      targetEntity: `Requirement ${reqId}`,
      targetId: reqId,
      clientName: target?.client,
      ipAddress: '192.168.1.45',
      status: 'Success',
      details: `Revoke permission granted by ${currentUserName} for request by ${requester}. Reason: ${reason}. Requirement reverted to Unassigned.`,
    })
  }

  const handleDeclineRevokeRequest = (reqId: string) => {
    const target = localRequirements.find(r => r.id === reqId)
    const requester = target?.revokeRequestedBy || 'Recruiter'

    const updated = localRequirements.map(r =>
      r.id === reqId
        ? {
            ...r,
            revokeRequested: false,
            revokeReason: undefined,
            revokeRequestedBy: undefined,
            revokeRequestedAt: undefined,
          }
        : r
    )

    setLocalRequirements(updated)
    onUpdateRequirements?.(updated)
    showToast(`Declined revoke request for ${reqId}.`)

    onAddActivityLog?.({
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      userName: currentUserName,
      userEmail: 'user@metaforgeit.com',
      userRole: role as any,
      userAvatar: currentUserName.charAt(0),
      action: `Declined Revoke Request for Requirement ${reqId}`,
      category: 'Requirements',
      targetEntity: `Requirement ${reqId}`,
      targetId: reqId,
      clientName: target?.client,
      ipAddress: '192.168.1.45',
      status: 'Warning',
      details: `Revoke request from ${requester} for requirement ${reqId} was declined by ${currentUserName}.`,
    })
  }

  return {
    handleConfirmRevoke, handleGrantRevokeApproval, handleDeclineRevokeRequest
  }
}
