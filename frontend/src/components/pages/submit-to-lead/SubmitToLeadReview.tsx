import React from 'react'
import { SubmitToLeadVm } from './useSubmitToLeadPage'

export function SubmitToLeadReview({ vm }: { vm: SubmitToLeadVm }) {
  const {
    leadEmail,
    setLeadEmail,
    introduction,
    setIntroduction,
  } = vm
  return (
    <>
      {/* 3. CARD 2: LEAD REVIEW EMAIL (COMPACT & SIMPLE) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">Lead review email</h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-[#6B3BF6] border border-purple-200">Default (1 Submission)</span>
          </div>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            ✓ Mandatory
          </span>
        </div>

        <div>
          <label className="block text-slate-700 font-bold text-xs mb-1">Lead email</label>
          <input
            type="email"
            value={leadEmail}
            onChange={e => setLeadEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none"
          />
        </div>



        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-700 font-bold text-xs">INTRODUCTION</label>
            <button onClick={() => setIntroduction('I hope you are doing well.')} className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">
              Reset to default
            </button>
          </div>
          <textarea
            rows={4}
            value={introduction}
            onChange={e => setIntroduction(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none leading-relaxed"
          />
        </div>
      </div>



    </>
  )
}
