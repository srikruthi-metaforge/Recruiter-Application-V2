import React from 'react'
import { SubmitToLeadRecipients } from './SubmitToLeadRecipients'
import { SubmitToLeadVm } from './useSubmitToLeadPage'

export function SubmitToLeadDestination({ vm }: { vm: SubmitToLeadVm }) {
  const {
    requirement,
    forwardLoopChecked,
    threadSubject,
    setThreadSubject,
    recruiterName,
    setRecruiterName,
    recruiterEmail,
    setRecruiterEmail,
    toRecipients,
    ccRecipients,
    newToInput,
    setNewToInput,
    newCcInput,
    setNewCcInput,
    handleAddToRecipient,
    handleAddCcRecipient,
    handleRemoveTo,
    handleRemoveCc,
  } = vm
  return (
    <>
      {/* 2. CARD 1: SUBMISSION DESTINATION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Submission destination</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Forward candidate(s) directly in the client email loop.
          </p>
        </div>

        {/* CHECKBOX CARD (Forward to client loop is DEFAULT & MANDATORY) */}
        <div className="grid grid-cols-1 gap-4">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0"
              />
              <div className="truncate">
                <span className="font-extrabold text-slate-900">Forward to client loop</span>
                <span className="text-slate-500 text-[11px] ml-1.5 truncate hidden sm:inline">(Reply in client/DL thread)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-[10px] font-extrabold uppercase tracking-wider">Mandatory Default</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-extrabold">1 Submission</span>
            </div>
          </div>
        </div>
      </div>
          <SubmitToLeadRecipients vm={vm} />

    </>
  )
}
