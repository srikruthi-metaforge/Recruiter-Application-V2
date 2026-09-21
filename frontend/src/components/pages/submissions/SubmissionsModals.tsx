import React from 'react'
import { CheckCircle } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { PageHeader } from '../../layout/PageHeader'
import { SubmissionCandidateDetailModal } from '../../modals/SubmissionCandidateDetailModal'
import { ScheduleInterviewModal } from '../../modals/ScheduleInterviewModal'
import { RequirementDetailOverview } from '../RequirementDetailOverview'
import { CreateJobDemandForm } from '../CreateJobDemandForm'
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
            reqId: 'REQ-2026-05',
            req: selectedSub.requirement,
            client: selectedSub.currentCompany,
            experience: selectedSub.experience,
            recruiter: selectedSub.submittedBy,
            date: selectedSub.submittedOn,
            stage: selectedSub.status,
            email: 'candidate@email.com',
            phone: '+91 98765 43210',
            location: 'Bangalore, India',
            noticePeriod: '30 Days',
            currentCtc: '14 LPA',
            expectedCtc: '18 LPA',
            skills: ['Java', 'Spring Boot', 'Microservices', 'SQL'],
          }}
          rejectionReason={reasons[selectedSub.id] || selectedSub.rejectionReason}
          onSaveRejectionReason={(id, newReason) => {
            setReasons(prev => ({ ...prev, [id]: newReason }))
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
