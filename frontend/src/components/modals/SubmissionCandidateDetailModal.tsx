import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Role } from '../../types'
import {
  PRESET_REJECTION_REASONS,
  SubmissionCandidateDetailModalProps,
} from './SubmissionCandidateDetailModal.data'
import { SubmissionCandidateDetailTabs } from './SubmissionCandidateDetailModal.tabs'
import { SubmissionCandidateDetailFields } from './SubmissionCandidateDetailModal.fields'
import { SubmissionCandidateRejectionForm } from './SubmissionCandidateDetailModal.rejection'

export { PRESET_REJECTION_REASONS }
export type { SubmissionCandidateDetailModalProps }

export function SubmissionCandidateDetailModal({
  submission,
  role = 'recruiter',
  onClose,
  onViewFullProfile,
  onBackToRequirement,
  rejectionReason,
  onSaveRejectionReason,
}: SubmissionCandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'interviews' | 'feedback' | 'activity' | 'communication' | 'offer'>('overview')
  const [reasonInput, setReasonInput] = useState(rejectionReason || submission?.rejectionReason || '')
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false)

  useEffect(() => {
    const current = rejectionReason || submission?.rejectionReason || ''
    setReasonInput(current)
    if (PRESET_REJECTION_REASONS.includes(current)) {
      setSelectedOption(current)
    } else if (current) {
      setSelectedOption('CUSTOM')
    } else {
      setSelectedOption('')
    }
  }, [rejectionReason, submission])

  if (!submission) return null

  const name = submission.candidateName || submission.candidate || 'PUNEETH K A'
  const email = `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`
  const phone = '+91 89045 52774'
  const exp = submission.experience || '2 Years 6 Months'
  const company = submission.currentCompany || 'TE Connectivity India Pvt. Ltd'
  const submittedBy = submission.submittedBy || 'Suresh kulkarni'
  const submittedOn = submission.submittedOn || submission.date || '10 Aug 2026, 17:07'
  const submissionId = submission.id?.startsWith('SUB-') ? submission.id : `SUB-${submission.id || '571'}`
  const status = submission.status || submission.stage || 'Submitted to Client'

  const handleSaveReason = () => {
    if (onSaveRejectionReason) {
      onSaveRejectionReason(submission.id, reasonInput)
    }
    setSavedSuccessMsg(true)
    setTimeout(() => setSavedSuccessMsg(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200/80 my-6 animate-in zoom-in-95 duration-150 font-sans text-slate-800">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close detail modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              {name}
            </h2>

            <div className="flex flex-wrap items-center gap-2.5 text-xs mt-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {status}
              </span>
              <span className="text-slate-600 font-medium">{email}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-medium">{phone}</span>
            </div>
          </div>
        </div>

        <SubmissionCandidateDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} role={role} />

        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <SubmissionCandidateDetailFields
                exp={exp}
                company={company}
                submittedBy={submittedBy}
                submittedOn={submittedOn}
                submissionId={submissionId}
                status={status}
              />
              <SubmissionCandidateRejectionForm
                savedSuccessMsg={savedSuccessMsg}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
                reasonInput={reasonInput}
                setReasonInput={setReasonInput}
                onSaveReason={handleSaveReason}
              />
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-xs font-semibold text-slate-600 capitalize">{activeTab} section</p>
              <p className="text-[11px] text-slate-400">
                Detailed candidate {activeTab} logs will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Submitted by {submittedBy}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl cursor-pointer transition-all text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
