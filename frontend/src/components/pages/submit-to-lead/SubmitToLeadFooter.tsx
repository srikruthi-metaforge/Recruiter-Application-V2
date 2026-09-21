import React from 'react'
import { Send, ShieldAlert } from 'lucide-react'
import { SubmitToLeadVm } from './useSubmitToLeadPage'

export function SubmitToLeadFooter({ vm }: { vm: SubmitToLeadVm }) {
  const {
    requirement,
    forwardLoopChecked,
    confirmForwardChecked,
    setConfirmForwardChecked,
    toastMsg,
    currentReqId,
    isLeadApproved,
    hasDuplicateSubmission,
    firstDuplicate,
    handleSubmitFinal,
  } = vm
  return (
    <>
      {/* 7. CONFIRMATION CHECKBOX (Only shown after Forward to client loop is approved & checked) */}
      {isLeadApproved && forwardLoopChecked && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmForwardChecked}
              onChange={e => setConfirmForwardChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-amber-950">
              I confirm these candidates should be forwarded in the original client requirement email thread.
            </span>
          </label>
          <p className="text-[10px] text-slate-500 pl-7">
            One submission will be recorded; lead email and client thread forward for: <strong>{requirement?.client || 'Client Account'}</strong>
          </p>
        </div>
      )}

      {/* DUPLICATE SUBMISSION BANNER IN PAGE */}
      {hasDuplicateSubmission && firstDuplicate && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-rose-900 text-xs uppercase tracking-wide bg-rose-600 text-white px-2 py-0.5 rounded-md">
                Duplicate Submission
              </span>
              <span className="text-xs font-bold text-rose-800">Submission Blocked</span>
            </div>
          </div>
          <p className="text-xs text-rose-950 font-medium leading-relaxed">
            Candidate <strong>{firstDuplicate.candidateName}</strong> has already been submitted for this requirement (<strong>{currentReqId}</strong>) by another vendor/recruiter.
          </p>
          <div className="text-[11px] text-rose-900 bg-rose-100/80 p-2.5 rounded-xl border border-rose-200/80 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
            <span>Submitted By: <strong>{firstDuplicate.existingSubmission?.recruiter || 'External Vendor'}</strong></span>
            <span>Date: <strong>{firstDuplicate.existingSubmission?.date}</strong></span>
            <span>Status: <strong>{firstDuplicate.existingSubmission?.stage}</strong></span>
            <span>Reason: <em>{firstDuplicate.matchReason}</em></span>
          </div>
        </div>
      )}

      {/* 8. STICKY BOTTOM ACTION BAR */}
      <div className={`sticky bottom-4 z-30 border backdrop-blur-md py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-between gap-4 mt-6 ${
        hasDuplicateSubmission
          ? 'bg-rose-50/95 border-rose-300'
          : 'bg-white/95 border-slate-200/90'
      }`}>
        <span className="text-xs font-bold text-slate-700">
          {hasDuplicateSubmission ? (
            <span className="text-rose-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Duplicate Candidate Submission — Cannot forward to Client.</span>
            </span>
          ) : (
            <span>Forward candidate(s) in the client email loop.</span>
          )}
        </span>

        <button
          onClick={handleSubmitFinal}
          disabled={hasDuplicateSubmission}
          className={`px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 ${
            hasDuplicateSubmission
              ? 'bg-rose-300 text-rose-900 cursor-not-allowed border border-rose-300 shadow-none'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer active:scale-98'
          }`}
        >
          {hasDuplicateSubmission ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Duplicate Submission - Blocked</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Forward to Client</span>
            </>
          )}
        </button>
      </div>

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </>
  )
}
