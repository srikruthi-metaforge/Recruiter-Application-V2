import React from 'react'
import { ScheduleInterviewModal } from '../../modals/ScheduleInterviewModal'
import { SubmitCandidateModal } from '../../modals/SubmitCandidateModal'
import { workspaceService } from '../../../services/workspace.service'
import { apiErrorMessage } from '../../../services/candidatePayload'
import { RequirementDetailVm } from './useRequirementDetailOverview'

export function ReqDetailModals({ vm }: { vm: RequirementDetailVm }) {
  const {
    requirement,
    toastMsg,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    schedulingCandidateRow,
    setSchedulingCandidateRow,
    isAddCandidateModalOpen,
    setIsAddCandidateModalOpen,
    currentUserName,
    showToast,
    reloadReqSubmissions,
  } = vm
  return (
    <>
      {/* SCHEDULE INTERVIEW MODAL */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        initialSubmission={schedulingCandidateRow?.name || schedulingCandidateRow?.submissionId || ''}
        submissionId={schedulingCandidateRow?.submissionId || (schedulingCandidateRow?.id && schedulingCandidateRow.id.match(/^[0-9a-fA-F]{24}$/) ? schedulingCandidateRow.id : undefined)}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setSchedulingCandidateRow(null)
        }}
        onScheduleSuccess={(data: any) => {
          const emailNotice = data?.emailSent ? ' Invite email sent.' : ''
          const waNotice = data?.whatsappSent ? ' WhatsApp link opened.' : ''
          showToast(`Interview successfully scheduled for ${schedulingCandidateRow?.name || data?.candidateName || 'candidate'}!${emailNotice}${waNotice}`)
          setIsScheduleModalOpen(false)
          setSchedulingCandidateRow(null)
        }}
      />


      {/* ADD CANDIDATE MODAL (fallback when parent does not open App modal) */}
      <SubmitCandidateModal
        isOpen={isAddCandidateModalOpen}
        onClose={() => setIsAddCandidateModalOpen(false)}
        requirements={[requirement]}
        selectedReqId={(requirement as any)._id || requirement.id}
        currentRecruiterName={currentUserName}
        onSubmit={async (newSub) => {
          try {
            await workspaceService.createSubmission({
              ...newSub,
              requirementId: (requirement as any)._id || (newSub as any).requirementId,
              reqCode: (requirement as any).reqCode || (newSub as any).reqCode,
              req: (requirement as any).reqCode || newSub.req,
            } as any)
            showToast(`Candidate ${newSub.candidate} successfully submitted for ${(requirement as any).reqCode || requirement.id}!`)
            setIsAddCandidateModalOpen(false)
            await reloadReqSubmissions?.()
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('submissions_updated'))
            }
          } catch (err) {
            showToast(apiErrorMessage(err) || 'Failed to submit candidate')
            throw err
          }
        }}
      />

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
        )}
    </>
  )
}
