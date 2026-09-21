import React from 'react'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapDomains({ vm }: { vm: ClientGapVm }) {
  const {
    clientName,
    openSections,
    activeTabSection,
    toggleSection,
    zeroSubReqs,
    domainAnalysisRows,
    coverage,
  } = vm
  return (
    <>
      {/* 5. STANDARDIZED DOMAIN ANALYSIS TABLE */}
      {(activeTabSection === 'all' || activeTabSection === 'domainTable') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 transition-all">
          <div
            onClick={() => toggleSection('domainTable')}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 cursor-pointer group"
          >
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 group-hover:text-[#6B3BF6] transition-colors">
                <Layers className="w-5 h-5 text-[#6B3BF6]" />
                <span>Standardized Domain Delivery Analysis ({domainAnalysisRows.length} Active Domains)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Requirements, open headcount, submissions, coverage percentage, and zero-submission count per domain.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Auto-calculated from {clientName} job demand records
              </span>
              {openSections.domainTable ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {openSections.domainTable && (
            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl animate-in fade-in duration-150">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">STANDARDIZED DOMAIN</th>
                    <th className="py-3.5 px-4 text-center">REQUIREMENTS</th>
                    <th className="py-3.5 px-4 text-center">POSITIONS</th>
                    <th className="py-3.5 px-4 text-center">SUBMISSIONS</th>
                    <th className="py-3.5 px-4 text-center">COVERAGE %</th>
                    <th className="py-3.5 px-4 text-center">ZERO-SUBMISSION REQS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {domainAnalysisRows.map(row => (
                    <tr key={row.domain} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#6B3BF6]" />
                        <span>{row.domain}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-800 tabular-nums">
                        {row.requirements}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-purple-900 tabular-nums">
                        {row.positions}
                      </td>

                      <td className="py-3.5 px-4 text-center font-extrabold text-[#2563EB] tabular-nums">
                        {row.submissions}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold border tabular-nums ${
                            row.coverage >= 50
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : row.coverage >= 25
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {row.coverage}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {row.zeroSubReqs > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                            {row.zeroSubReqs} Reqs
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
