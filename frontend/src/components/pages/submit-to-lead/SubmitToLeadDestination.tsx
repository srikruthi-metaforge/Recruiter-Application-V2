import React from 'react'
import { SubmitToLeadRecipients } from './SubmitToLeadRecipients'
import { SubmitToLeadVm } from './useSubmitToLeadPage'
import { CLIENT_TRACKER_PRESETS } from './trackerPresets.data'

export function SubmitToLeadDestination({ vm }: { vm: SubmitToLeadVm }) {
  const {
    requirement,
    submitToLeadChecked,
    setSubmitToLeadChecked,
    forwardLoopChecked,
    setForwardLoopChecked,
    clientName,
    setClientName,
    handleClientChange,
    availableLeads,
    selectedLeadId,
    handleSelectLead,
  } = vm

  const selectLeadMode = () => {
    setSubmitToLeadChecked(true)
    setForwardLoopChecked(false)
  }

  const selectClientMode = () => {
    setSubmitToLeadChecked(false)
    setForwardLoopChecked(true)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Submission destination</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose where this candidate goes — Lead review first, or straight to the client.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={selectLeadMode}
            className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
              submitToLeadChecked && !forwardLoopChecked
                ? 'bg-blue-50/80 border-blue-600 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-extrabold text-slate-900 text-xs block">Submit to Lead</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Send for lead approval inside the app. The selected lead sees it on their Submissions page.
            </span>
          </button>

          <button
            type="button"
            onClick={selectClientMode}
            className={`p-4 rounded-2xl border-2 transition-all text-left cursor-pointer ${
              forwardLoopChecked
                ? 'bg-amber-50/70 border-amber-400 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="font-extrabold text-slate-900 text-xs block">Submit to Client</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              Forward in the client / DL email thread. Marks the submission as sent to client.
            </span>
          </button>
        </div>

        {submitToLeadChecked && !forwardLoopChecked && (
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
            <p className="text-[11px] text-slate-600">
              Leads are loaded from users with a Team Lead role. The chosen lead gets this submission for review.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Client</label>
            <select
              value={clientName || 'Other/Custom'}
              onChange={e => {
                const val = e.target.value
                if (handleClientChange) handleClientChange(val)
                else setClientName(val)
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              {Object.keys(CLIENT_TRACKER_PRESETS).map(preset => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Client name</label>
            <input
              type="text"
              value={clientName || requirement?.client || ''}
              onChange={e => {
                const value = e.target.value
                if (CLIENT_TRACKER_PRESETS[value]) handleClientChange(value)
                else setClientName(value)
              }}
              placeholder="e.g. LTTS"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      <SubmitToLeadRecipients vm={vm} />
    </div>
  )
}
