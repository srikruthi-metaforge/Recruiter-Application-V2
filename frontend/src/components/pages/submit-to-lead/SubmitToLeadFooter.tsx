import React from 'react'
import { Send, UserCheck, ShieldAlert } from 'lucide-react'
import { SubmitToLeadVm } from './useSubmitToLeadPage'
import { hasCapability } from '../../../store/session'

export function SubmitToLeadFooter({ vm }: { vm: SubmitToLeadVm }) {
  const {
    requirement,
    confirmForwardChecked,
    toastMsg,
    currentReqId,
    hasDuplicateSubmission,
    firstDuplicate,
    handleSubmitFinal,
    selectedCandidates,
    validCandidatesToSubmit,
    allCandidatesAreDuplicates,
    duplicateCheckResults,
    submitToLeadChecked,
    forwardLoopChecked,
    selectedLeadId,
    availableLeads,
    setSubmitToLeadChecked,
    setForwardLoopChecked,
  } = vm

  const canSubmit = hasCapability('submitToClients')
  const count = Array.isArray(selectedCandidates) ? selectedCandidates.length : 0
  const validCount = Array.isArray(validCandidatesToSubmit)
    ? validCandidatesToSubmit.length
    : allCandidatesAreDuplicates
      ? 0
      : count
  const blockedCount = Array.isArray(duplicateCheckResults)
    ? duplicateCheckResults.length - validCount
    : 0
  const selectedLead = (availableLeads || []).find((l: { id: string }) => l.id === selectedLeadId)

  // Destination cards drive the mode; one primary CTA matches the selection.
  const leadMode = Boolean(submitToLeadChecked && !forwardLoopChecked)
  const clientMode = Boolean(forwardLoopChecked) || !leadMode

  const baseDisabled =
    !confirmForwardChecked || allCandidatesAreDuplicates || validCount === 0 || !canSubmit
  const leadDisabled = baseDisabled || !selectedLeadId
  const clientDisabled = baseDisabled

  const submitLead = () => {
    setSubmitToLeadChecked?.(true)
    setForwardLoopChecked?.(false)
    handleSubmitFinal('lead')
  }

  const submitClient = () => {
    setSubmitToLeadChecked?.(false)
    setForwardLoopChecked?.(true)
    handleSubmitFinal('client')
  }

  return (
    <div className="space-y-6 pt-2">
      {hasDuplicateSubmission && firstDuplicate && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-rose-900 text-xs uppercase tracking-wide bg-rose-600 text-white px-2 py-0.5 rounded-md">
                Duplicate Submission
              </span>
              <span className="text-xs font-bold text-rose-800">Already submitted for this requirement</span>
            </div>
          </div>
          <p className="text-xs text-rose-950 font-medium leading-relaxed">
            Candidate <strong>{firstDuplicate.candidateName}</strong> is already linked to this requirement (
            <strong>{(requirement as any)?.reqCode || currentReqId}</strong>
            ).
          </p>
        </div>
      )}

      <div
        className={`sticky bottom-4 z-30 border backdrop-blur-md py-3.5 px-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
          hasDuplicateSubmission
            ? 'bg-rose-50/95 border-rose-300'
            : 'bg-white/95 border-slate-200/90'
        }`}
      >
        <span className="text-xs font-bold text-slate-700">
          {allCandidatesAreDuplicates ? (
            <span className="text-rose-700 font-extrabold">
              All selected candidate(s) are already submitted. Submission is blocked.
            </span>
          ) : leadMode ? (
            <span>
              Ready to send {validCount} candidate(s) to lead
              {selectedLead ? (
                <>
                  {' '}
                  <strong className="text-slate-900">{selectedLead.name}</strong>
                </>
              ) : (
                ' — select a lead above'
              )}
              {blockedCount > 0 ? ` (${blockedCount} duplicate blocked)` : ''}.
            </span>
          ) : (
            <span>
              Ready to submit {validCount} candidate(s) to the client
              {blockedCount > 0 ? ` (${blockedCount} duplicate blocked)` : ''}.
            </span>
          )}
          {!canSubmit ? (
            <span className="block text-[11px] text-rose-700 font-bold mt-0.5">
              Access Restricted: Super Admin has disabled submissions for your account.
            </span>
          ) : !confirmForwardChecked && !allCandidatesAreDuplicates ? (
            <span className="block text-[11px] text-amber-700 font-normal mt-0.5">
              Check the confirmation checkbox above before submitting.
            </span>
          ) : null}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={submitLead}
            disabled={leadDisabled}
            title={
              !selectedLeadId
                ? 'Select a lead from the dropdown first'
                : 'Submit to Lead for in-app review'
            }
            className={`px-5 py-2.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 ${
              leadDisabled
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                : leadMode
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg cursor-pointer active:scale-98'
                  : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 cursor-pointer'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Submit to Lead</span>
          </button>
          <button
            type="button"
            onClick={submitClient}
            disabled={clientDisabled}
            title="Submit directly to client"
            className={`px-5 py-2.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 ${
              clientDisabled
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60'
                : clientMode && !leadMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg cursor-pointer active:scale-98'
                  : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50 cursor-pointer'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Submit to Client</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
