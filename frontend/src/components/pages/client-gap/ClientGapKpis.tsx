import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapKpis({ vm }: { vm: ClientGapVm }) {
  const {
    clientName,
    openSections,
    activeTabSection,
    toggleSection,
    metrics,
    totalReqs,
    totalPositions,
    totalSubmissions,
    zeroSubReqs,
    missingDomainReqs,
    nonNumericPositions,
    totalInterviews,
    finalSelects,
    l1Rejects,
    awaitingPending,
    coveragePct,
  } = vm
  return (
    <>
      {/* 3. KEY PERFORMANCE INDICATORS TABLE (EXACT MATCH TO EXCEL ANALYSIS) */}
      {(activeTabSection === 'all' || activeTabSection === 'kpi') && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all">
          {/* Navy Header Banner with Toggle Arrow */}
          <div
            onClick={() => toggleSection('kpi')}
            className="bg-[#1B2A4A] hover:bg-[#15223c] text-white px-6 py-3.5 font-bold text-sm sm:text-base tracking-wide flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <span>{clientName} – MetaForge Delivery Gap Analysis</span>
              <span className="text-xs font-mono font-normal opacity-80 hidden sm:inline">KPI Summary Table</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-md font-mono">
                {openSections.kpi ? 'Click to Collapse' : 'Click to Expand'}
              </span>
              {openSections.kpi ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>

          {openSections.kpi && (
            <div className="overflow-x-auto animate-in fade-in duration-150">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6 w-2/3">KPI</th>
                    <th className="py-3 px-6 w-1/3 text-right">VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Requirements</td>
                    <td className="py-3 px-6 text-right font-extrabold text-slate-900 tabular-nums">{metrics.totalReqs}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Total Positions</td>
                    <td className="py-3 px-6 text-right font-extrabold text-purple-900 tabular-nums">{metrics.totalPositions}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Total Submissions</td>
                    <td className="py-3 px-6 text-right font-extrabold text-[#2563EB] tabular-nums">{metrics.totalSubmissions}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Submission Coverage</td>
                    <td className="py-3 px-6 text-right font-extrabold tabular-nums">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                          metrics.coveragePct >= 50
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : metrics.coveragePct >= 25
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}
                      >
                        {metrics.coveragePct}%
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Requirements with 0 submissions</td>
                    <td className="py-3 px-6 text-right font-extrabold text-rose-700 tabular-nums">{metrics.zeroSubReqs}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Requirements with missing/unusable domain</td>
                    <td className="py-3 px-6 text-right font-extrabold text-amber-700 tabular-nums">{metrics.missingDomainReqs}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Requirements with non-numeric positions</td>
                    <td className="py-3 px-6 text-right font-extrabold text-slate-700 tabular-nums">{metrics.nonNumericPositions}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Candidate interview records</td>
                    <td className="py-3 px-6 text-right font-extrabold text-slate-900 tabular-nums">{metrics.totalInterviews}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Final selects</td>
                    <td className="py-3 px-6 text-right font-extrabold text-emerald-700 tabular-nums">{metrics.finalSelects}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">L1 rejects</td>
                    <td className="py-3 px-6 text-right font-extrabold text-rose-700 tabular-nums">{metrics.l1Rejects}</td>
                  </tr>
                  <tr className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-6 font-bold text-slate-900">Awaiting / pending records</td>
                    <td className="py-3 px-6 text-right font-extrabold text-amber-700 tabular-nums">{metrics.awaitingPending}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </>
  )
}
