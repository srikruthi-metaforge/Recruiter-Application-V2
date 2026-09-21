import React from 'react'
import { UserCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapSpoc({ vm }: { vm: ClientGapVm }) {
  const {
    clientName,
    openSections,
    activeTabSection,
    toggleSection,
    metrics,
    zeroSubReqs,
    coverage,
    spocAnalysisRows,
    spoc,
  } = vm
  return (
    <>
      {/* 7. SPOC / OWNERSHIP ANALYSIS SECTION */}
      {(activeTabSection === 'all' || activeTabSection === 'spocTable') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 transition-all">
          <div
            onClick={() => toggleSection('spocTable')}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 cursor-pointer group"
          >
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 group-hover:text-[#6B3BF6] transition-colors">
                <UserCheck className="w-5 h-5 text-[#6B3BF6]" />
                <span>SPOC / Account Ownership Delivery Analysis</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of single point of contacts assigned to {clientName} requirements and their coverage metrics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#6B3BF6] font-bold">
                {spocAnalysisRows.length} Active SPOC Owners
              </span>
              {openSections.spocTable ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {openSections.spocTable && (
            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl animate-in fade-in duration-150">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">SPOC OWNER</th>
                    <th className="py-3.5 px-4 text-center">ASSIGNED REQS</th>
                    <th className="py-3.5 px-4 text-center">POSITIONS</th>
                    <th className="py-3.5 px-4 text-center">SUBMISSIONS</th>
                    <th className="py-3.5 px-4 text-center">COVERAGE %</th>
                    <th className="py-3.5 px-4 text-center">ZERO-SUB REQS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {spocAnalysisRows.map(sRow => (
                    <tr key={sRow.spoc} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-[#6B3BF6] font-bold flex items-center justify-center text-xs">
                          {sRow.spoc.substring(0, 1)}
                        </div>
                        <span>SPOC: {sRow.spoc}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-800 tabular-nums">
                        {sRow.requirements}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-purple-900 tabular-nums">
                        {sRow.positions}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-[#2563EB] tabular-nums">
                        {sRow.submissions}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold border tabular-nums ${
                            sRow.coverage >= 50
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : sRow.coverage >= 25
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {sRow.coverage}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {sRow.zeroSubReqs > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                            {sRow.zeroSubReqs} Reqs
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 tabular-nums">
                            0
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </>
  )
}
