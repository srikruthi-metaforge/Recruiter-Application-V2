import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { AddCandidateBasicFields } from './AddCandidateBasicFields'
import { AddCandidateVm } from './useAddCandidatePage'

export function AddCandidateBasic({ vm }: { vm: AddCandidateVm }) {
  const {
    requirements,
    candidateName,
    contactNumber,
    email,
    targetReqId,
    setTargetReqId,
    dupCheckResult,
  } = vm
  return (
    <>
        {/* SECTION 2: BASIC INFO CARD (MATCHING SCREENSHOT 1) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Basic Info</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target requirement & candidate contact details for submission validation.
              </p>
            </div>
            {/* Requirement Selector for Submission Check */}
            <div className="flex items-center gap-2 bg-purple-50/70 p-2 rounded-xl border border-purple-200">
              <label className="text-xs font-bold text-purple-900 whitespace-nowrap">Target Requirement:</label>
              <select
                value={targetReqId}
                onChange={e => setTargetReqId(e.target.value)}
                className="px-3 py-1 text-xs font-bold bg-white border border-purple-300 rounded-lg text-purple-950 focus:outline-none cursor-pointer"
              >
                {requirements.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.title} ({r.client})
                  </option>
                ))}
                {!requirements.some(r => r.id === 'REQ-001') && (
                  <option value="REQ-001">REQ-001 — Senior React Developer (Accenture)</option>
                )}
                {!requirements.some(r => r.id === 'REQ-002') && (
                  <option value="REQ-002">REQ-002 — Java Architect (Goldman Sachs)</option>
                )}
                {!requirements.some(r => r.id === 'REQ-006') && (
                  <option value="REQ-006">REQ-006 — Python ML Engineer (Tesla)</option>
                )}
              </select>
            </div>
          </div>

          {/* DUPLICATE SUBMISSION ALERT BANNER */}
          {dupCheckResult.isDuplicate && dupCheckResult.existingSubmission && (
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
                Candidate <strong>{candidateName || 'Entered Candidate'}</strong> ({email || contactNumber}) has already been submitted for target requirement <strong>{targetReqId}</strong>.
              </p>
              <div className="text-[11px] text-rose-900 bg-rose-100/80 p-2.5 rounded-xl border border-rose-200/80 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                <span>Submitted By: <strong>{dupCheckResult.existingSubmission.recruiter || 'External Recruiter'}</strong></span>
                <span>Date: <strong>{dupCheckResult.existingSubmission.date}</strong></span>
                <span>Status: <strong>{dupCheckResult.existingSubmission.stage}</strong></span>
                <span>Reason: <em>{dupCheckResult.matchReason}</em></span>
              </div>
            </div>
          )}

          <AddCandidateBasicFields vm={vm} />
        </div>
    </>
  )
}
