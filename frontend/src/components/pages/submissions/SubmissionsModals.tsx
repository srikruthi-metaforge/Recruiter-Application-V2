import React from 'react'
import { CheckCircle } from 'lucide-react'
import { SubmissionCandidateDetailModal } from '../../modals/SubmissionCandidateDetailModal'
import { ScheduleInterviewModal } from '../../modals/ScheduleInterviewModal'
import { SubmissionsVm } from './useSubmissionsPage'

export function SubmissionsModals({ vm }: { vm: SubmissionsVm }) {
  const {
    role,
    selectedSub,
    setSelectedSub,
    toastMsg,
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    targetSubForInterview,
    setTargetSubForInterview,
    reasons,
    setReasons,
    handleScheduleSuccess,
    handleUpdateStage,
    handleLeadApproval,
    handleForwardClient,
  } = vm
  return (
    <>
      {/* Candidate Detail Modal */}
      {selectedSub && (
        <SubmissionCandidateDetailModal
          role={role}
          submission={{
            id: selectedSub.id,
            candidate: selectedSub.candidateName,
            candidateName: selectedSub.candidateName,
            reqId: selectedSub.reqId || '',
            req: selectedSub.requirement,
            requirement: selectedSub.requirement,
            client: selectedSub.clientName || selectedSub.currentCompany,
            clientName: selectedSub.clientName || 'Accenture',
            experience: selectedSub.experience,
            currentCompany: selectedSub.currentCompany,
            recruiter: selectedSub.submittedBy,
            submittedBy: selectedSub.submittedBy,
            date: selectedSub.submittedOn,
            submittedOn: selectedSub.submittedOn,
            stage: selectedSub.status,
            status: selectedSub.status,
            rejectionReason: selectedSub.rejectionReason,
            email: selectedSub.email || '',
            phone: selectedSub.phone || '',
            location: selectedSub.location || '',
            noticePeriod: selectedSub.noticePeriod || '',
            currentCtc: selectedSub.currentSalary || '',
            currentSalary: selectedSub.currentSalary || '',
            expectedCtc: selectedSub.expectedSalary || '',
            expectedSalary: selectedSub.expectedSalary || '',
            skills: selectedSub.skills || [],
            raw: selectedSub.raw,
          }}
          rejectionReason={reasons[selectedSub.id] || selectedSub.rejectionReason}
          onSaveRejectionReason={(id, newReason) => {
            setReasons(prev => ({ ...prev, [id]: newReason }))
          }}
          onUpdateStage={async (id, stage, notes) => {
            await handleUpdateStage(id, stage, notes)
            if (stage !== 'Rejected') {
              setReasons(prev => {
                const next = { ...prev }
                delete next[id]
                return next
              })
            }
          }}
          onLeadApproval={handleLeadApproval}
          onForwardClient={async (id, notes) => {
            await handleForwardClient(id, notes)
            setReasons(prev => {
              const next = { ...prev }
              delete next[id]
              return next
            })
          }}
          onClose={() => setSelectedSub(null)}
        />
      )}


      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        initialSubmission={targetSubForInterview ? `${targetSubForInterview.candidateName} — ${targetSubForInterview.requirement}` : undefined}
        onClose={() => {
          setIsScheduleModalOpen(false)
          setTargetSubForInterview(null)
        }}
        onScheduleSuccess={handleScheduleSuccess}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 border border-slate-800">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  )
}
