import React from 'react'
import { SubmitToLeadVm } from './useSubmitToLeadPage'

export function SubmitToLeadCandidates({ vm }: { vm: SubmitToLeadVm }) {
  const {
    requirement,
  } = vm
  return (
    <>
      {/* 5. CARD 4: ATTACH CANDIDATES */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Attach Candidates</h3>
            <p className="text-xs text-slate-500">Search and attach candidates for this requirement.</p>
          </div>
        </div>



        {/* ATTACHED CANDIDATES LIST */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-extrabold text-slate-900 block">Attached Candidates (1 / 1)</span>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-slate-900 text-xs">Candidate (draft)</h4>
                <span className="text-[10px] font-mono text-slate-400">18016</span>
                <span className="text-[10px] text-blue-700 font-semibold">• pritishmalik8@gmail.com</span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Resume on file: <span className="underline">PritishMalikImmediateJoiner[11y_0m].pdf</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
                Replace resume
              </button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                &times;
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
