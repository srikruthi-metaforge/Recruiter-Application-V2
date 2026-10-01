import React from 'react'
import { AlertTriangle, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapReqs({ vm }: { vm: ClientGapVm }) {
  const {
    onSelectRequirement,
    toastMsg,
    openSections,
    activeTabSection,
    gapCurrentPage,
    setGapCurrentPage,
    gapPageSize,
    setGapPageSize,
    toggleSection,
    filteredRequirements,
    gapTotalPages,
    paginatedRequirements,
    metrics,
    zeroSubReqs,
    spoc,
  } = vm
  return (
    <>
      {/* 9. REQUIREMENT GAP ANALYSIS (ATTENTION NEEDED LIST) */}
      {(activeTabSection === 'all' || activeTabSection === 'reqGaps') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 transition-all">
          <div
            onClick={() => toggleSection('reqGaps')}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 cursor-pointer group"
          >
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 group-hover:text-[#6B3BF6] transition-colors">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Requirement Gap Analysis ({filteredRequirements.length} Reqs Monitored)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any requirement row below to inspect job details and assign recruiter bandwidth.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-rose-700 font-bold bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                {metrics.zeroSubReqs} Zero-Submission Gaps
              </span>
              {openSections.reqGaps ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {openSections.reqGaps && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">REQUIREMENT TITLE & ID</th>
                      <th className="py-3.5 px-4">STANDARDIZED DOMAIN</th>
                      <th className="py-3.5 px-4 text-center">POSITIONS</th>
                      <th className="py-3.5 px-4 text-center">SUBMISSIONS</th>
                      <th className="py-3.5 px-4">SPOC OWNER</th>
                      <th className="py-3.5 px-4">GAP DIAGNOSTIC FLAG</th>
                      <th className="py-3.5 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {paginatedRequirements.map(req => (
                      <tr
                        key={req.id}
                        onClick={() => onSelectRequirement && onSelectRequirement(req.id)}
                        className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 group-hover:text-[#6B3BF6] transition-colors">
                            {req.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{req.id}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                            {req.domain}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 tabular-nums">
                          {req.positions}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {req.submissions === 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                              0 Submissions
                            </span>
                          ) : (
                            <span className="font-extrabold text-[#2563EB] tabular-nums">
                              {req.submissions}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {req.spoc}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {req.submissions === 0 && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                🔴 Zero Submissions
                              </span>
                            )}
                            {req.hasMissingDomain && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                                🟡 Missing Domain
                              </span>
                            )}
                            {req.hasNonNumericPositions && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                                ⚪ Non-Numeric Pos
                              </span>
                            )}
                            {req.submissions > 0 && !req.hasMissingDomain && !req.hasNonNumericPositions && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                🟢 On Track
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (onSelectRequirement) onSelectRequirement(req.id)
                            }}
                            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] text-xs font-bold rounded-xl border border-purple-200 transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Req</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 10-ITEM PAGINATION FOOTER */}
              <PaginationFooter
                currentPage={gapCurrentPage}
                totalPages={gapTotalPages}
                totalItems={filteredRequirements.length}
                pageSize={gapPageSize}
                onPageChange={setGapCurrentPage}
                onPageSizeChange={size => {
                  setGapPageSize(size)
                  setGapCurrentPage(1)
                }}
                itemLabel="requirement gap items"
              />
            </div>
          )}
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
        )}
    </>
  )
}
