import React from 'react'
import { ScheduleInterviewModal } from '../../modals/ScheduleInterviewModal'
import { SubmitCandidateModal } from '../../modals/SubmitCandidateModal'
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
  } = vm
  return (
    <>
      {/* SCHEDULE INTERVIEW MODAL */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setSchedulingCandidateRow(null)
        }}
        onScheduleSuccess={() => {
          showToast(`Interview successfully scheduled for ${schedulingCandidateRow?.name || 'candidate'}!`)
          setIsScheduleModalOpen(false)
          setSchedulingCandidateRow(null)
        }}
      />

      {/* ADD CANDIDATE MODAL (IN-PLACE RECRUITER WORKFLOW) */}
      <SubmitCandidateModal
        isOpen={isAddCandidateModalOpen}
        onClose={() => setIsAddCandidateModalOpen(false)}
        requirements={[requirement]}
        selectedReqId={requirement.id}
        currentRecruiterName={currentUserName}
        onSubmit={(newSub) => {
          showToast(`Candidate ${newSub.candidate} successfully submitted to client for ${requirement.id}!`)
          setIsAddCandidateModalOpen(false)
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
