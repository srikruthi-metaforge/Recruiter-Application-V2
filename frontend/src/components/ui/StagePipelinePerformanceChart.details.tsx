import React from 'react'
import { Users } from 'lucide-react'
import { REQUIREMENT_STAGE_DETAILS } from './StagePipelinePerformanceChart.data'

export function StagePipelineDetailsTable() {
  return (
    <div className="pt-4 border-t border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#6B3BF6]" />
            <span>Requirement Stage Positions Breakdown</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Total position counts (openings) per active requirement across pipeline stages
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-extrabold">
          Total Positions Sourced: {REQUIREMENT_STAGE_DETAILS.reduce((acc, curr) => acc + curr.positions, 0)} Positions
        </span>
      </div>

      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">REQUIREMENT TITLE & ID</th>
              <th className="py-3 px-3">CLIENT</th>
              <th className="py-3 px-3">CURRENT STAGE</th>
              <th className="py-3 px-3 text-center bg-indigo-50/70 text-indigo-900 font-extrabold">TOTAL POSITIONS (OPENINGS)</th>
              <th className="py-3 px-3 text-center">SUBMISSIONS</th>
              <th className="py-3 px-3 text-center">PLACED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {REQUIREMENT_STAGE_DETAILS.map(req => (
              <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900">
                  <div>{req.title}</div>
                  <span className="text-[10px] text-slate-400 font-normal font-mono">{req.id}</span>
                </td>
                <td className="py-3 px-3 font-bold text-purple-700">{req.client}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {req.stage}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-black text-indigo-900 bg-indigo-50/40 text-sm">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 inline-block">
                    {req.positions} Openings
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-extrabold text-[#84CC16]">{req.submissions}</td>
                <td className="py-3 px-3 text-center font-extrabold text-amber-600">{req.placed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
