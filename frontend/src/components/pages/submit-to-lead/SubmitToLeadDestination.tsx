import React from 'react'
import { Send, UserCheck } from 'lucide-react'
import { SubmitToLeadRecipients } from './SubmitToLeadRecipients'
import { SubmitToLeadVm } from './useSubmitToLeadPage'
import { CLIENT_TRACKER_PRESETS } from './trackerPresets.data'

export function SubmitToLeadDestination({ vm }: { vm: SubmitToLeadVm }) {
  const {
    requirement,
    submitToLeadChecked,
    forwardLoopChecked,
    clientName,
    setClientName,
    handleClientChange,
    availableLeads,
    selectedLeadId,
    handleSelectLead,
    isLeadApproved,
    isApprovalRequested,
    isLeadOrAdmin,
    canSubmitToClient,
    handleRequestClientSubmitApproval,
  } = vm

  const selectLeadMode = () => {
    vm.setSubmitToLeadChecked(true)
    // Keep client checked if already approved — both options can stay enabled.
    if (!canSubmitToClient) {
      vm.setForwardLoopChecked(false)
    }
  }

  const selectClientMode = () => {
    if (!canSubmitToClient) return
    vm.setForwardLoopChecked(true)
    // Lead option stays available (Scenario-2: both can be enabled).
    vm.setSubmitToLeadChecked(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Submission destination</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Default is <strong>Submit to Lead</strong>. Direct client submit stays disabled until Lead / Admin / Super Admin approval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={selectLeadMode}
            className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
              submitToLeadChecked && !forwardLoopChecked
                ? 'bg-blue-50/80 border-blue-600 shadow-2xs'
                : submitToLeadChecked
                  ? 'bg-blue-50/40 border-blue-300'
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-extrabold text-slate-900 text-xs block flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Submit to Lead
              <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wide bg-blue-600 text-white px-1.5 py-0.5 rounded">
                Default
              </span>
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Send for lead review in the app. Lead can then submit to the client (counts for you).
            </span>
          </button>

          <button
            type="button"
            onClick={selectClientMode}
            disabled={!canSubmitToClient}
            title={
              canSubmitToClient
                ? 'Submit directly to client (approved)'
                : 'Request approval from Lead / Admin / Super Admin first'
            }
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              !canSubmitToClient
                ? 'bg-slate-100/80 border-slate-200 opacity-70 cursor-not-allowed'
                : forwardLoopChecked
                  ? 'bg-amber-50/70 border-amber-400 shadow-2xs cursor-pointer'
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 cursor-pointer'
            }`}
          >
            <span className="font-extrabold text-slate-900 text-xs block flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-600" />
              Submit to Client
              {!canSubmitToClient && (
                <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wide bg-slate-400 text-white px-1.5 py-0.5 rounded">
                  Disabled
                </span>
              )}
              {canSubmitToClient && (
                <span className="ml-auto text-[9px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                  Approved
                </span>
              )}
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              {canSubmitToClient
                ? 'Approved — you can submit the candidate profile directly to the client.'
                : 'Disabled by default. Request approval below to unlock this option.'}
            </span>
          </button>
        </div>

        {!isLeadOrAdmin && (
          <div
            className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isLeadApproved
                ? 'border-emerald-200 bg-emerald-50/50'
                : isApprovalRequested
                  ? 'border-amber-200 bg-amber-50/60'
                  : 'border-slate-200 bg-slate-50/80'
            }`}
          >
            <div className="text-xs space-y-0.5">
              <p className="font-extrabold text-slate-900">Client submit approval</p>
              <p className="text-slate-600 font-medium">
                {isLeadApproved
                  ? 'Approved — Submit to Lead and Submit to Client are both available.'
                  : isApprovalRequested
                    ? 'Pending — waiting for Lead / Admin / Super Admin approval.'
                    : 'Request approval to enable Submit to Client for this requirement.'}
              </p>
            </div>
            {!isLeadApproved && (
              <button
                type="button"
                onClick={handleRequestClientSubmitApproval}
                disabled={isApprovalRequested}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl shrink-0 ${
                  isApprovalRequested
                    ? 'bg-amber-100 text-amber-800 border border-amber-200 cursor-not-allowed'
                    : 'bg-[#6B3BF6] hover:bg-[#5833E0] text-white shadow-sm cursor-pointer'
                }`}
              >
                {isApprovalRequested ? 'Approval Requested' : 'Request Approval'}
              </button>
            )}
          </div>
        )}

        {submitToLeadChecked && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
            <label className="block text-slate-800 font-bold text-xs">Select lead</label>
            <select
              value={selectedLeadId || ''}
              onChange={e => handleSelectLead(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              {(availableLeads || []).length === 0 ? (
                <option value="">No leads found in database</option>
              ) : (
                <>
                  <option value="" disabled>
                    Choose a lead…
                  </option>
                  {(availableLeads || []).map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.email})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}

        {forwardLoopChecked && canSubmitToClient && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-800 font-bold text-xs mb-1.5">Client tracker preset</label>
              <select
                value={clientName}
                onChange={e => {
                  setClientName(e.target.value)
                  handleClientChange?.(e.target.value)
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-amber-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {Object.keys(CLIENT_TRACKER_PRESETS).map(preset => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </select>
            </div>
            <SubmitToLeadRecipients vm={vm} />
          </div>
        )}

        {!requirement && (
          <p className="text-[11px] text-rose-600 font-bold">No requirement selected for this submission.</p>
        )}
      </div>
    </div>
  )
}
