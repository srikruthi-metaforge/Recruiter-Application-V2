import React from 'react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { PageHeader } from '../../layout/PageHeader'
import { SubmissionCandidateDetailModal } from '../../modals/SubmissionCandidateDetailModal'
import { ScheduleInterviewModal } from '../../modals/ScheduleInterviewModal'
import { RequirementDetailOverview } from '../RequirementDetailOverview'
import { CreateJobDemandForm } from '../CreateJobDemandForm'
import { SubmissionsVm } from './useSubmissionsPage'

export function SubmissionsEdit({ vm }: { vm: SubmissionsVm }) {
  const {
    role,
    requirements,
    onUpdateRequirements,
    setSelectedReqDetail,
    setIsEditingReq,
    editingReq,
    setEditingReq,
    showToast,
  } = vm
  return (
    <>
    return (
      <CreateJobDemandForm
        userRole={role === 'superadmin' ? 'Super Admin View' : role === 'admin' ? 'Admin View' : 'Recruiter View'}
        mode="edit"
        initialData={editingReq}
        onCancel={() => {
          setIsEditingReq(false)
          setEditingReq(null)
        }}
        onSubmit={updatedReq => {
          setSelectedReqDetail(updatedReq)
          if (onUpdateRequirements && requirements.length > 0) {
            const updatedList = requirements.map(r => (r.id === updatedReq.id ? updatedReq : r))
            onUpdateRequirements(updatedList)
          }
          setIsEditingReq(false)
          setEditingReq(null)
          showToast('Requirement details updated successfully!')
        }}
      />
    )
    </>
  )
}
