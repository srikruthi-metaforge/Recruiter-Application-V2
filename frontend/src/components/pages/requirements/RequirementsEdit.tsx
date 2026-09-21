import React from 'react'
import { CreateJobDemandForm } from '../CreateJobDemandForm'
import { RequirementsVm } from './useRequirementsPage'

export function RequirementsEdit({ vm }: { vm: RequirementsVm }) {
  const {
    onUpdateRequirements,
    localRequirements,
    setLocalRequirements,
    setSelectedReqForDetail,
    showToast,
    setIsEditingDemand,
    editingReq,
    setEditingReq,
    roleLabel,
  } = vm
  return (
    <CreateJobDemandForm
      userRole={roleLabel}
      mode="edit"
      initialData={editingReq || undefined}
      onCancel={() => setIsEditingDemand(false)}
      onSubmit={updatedReq => {
        const updatedList = localRequirements.map(r =>
          r.id === updatedReq.id ? updatedReq : r
        )
        setLocalRequirements(updatedList)
        onUpdateRequirements?.(updatedList)
        setSelectedReqForDetail(updatedReq)
        setIsEditingDemand(false)
        setEditingReq(null)
        showToast('Requirement details updated successfully!')
      }}
    />
  )
}
