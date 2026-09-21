import React from 'react'
import {
  PieChart as PieIcon,
  BarChart3,
  Download,
} from 'lucide-react'
import { InteractiveTrendVisualizer } from './InteractiveTrendVisualizer'
import { SUB_VS_NON_SUB_SEGMENTS, RECRUITER_DUAL_BAR_ITEMS } from './AnalyticsReports.data'
import { SVGDonutChart, DualBarChart } from './AnalyticsReports.charts'
import { AnalyticsReportsPocPanel, AnalyticsReportsTimeline } from './AnalyticsReports.panels'

export function AnalyticsReports({ role }: { role?: string }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
              <PieIcon className="w-3 h-3 text-amber-400" /> Enterprise Analytics Suite
            </span>
            <span className="text-[10px] font-mono text-slate-400">Real-Time Data Engine</span>
          </div>
          <h2 className="text-xl font-bold font-sans tracking-tight">Recruiter & Client POC Performance Diagrams</h2>
          <p className="text-xs text-slate-300 font-body mt-0.5">
            Visual diagrams covering Submissions vs Non-Submissions, Time-to-First-Submission SLA, and Client POC metrics.
          </p>
        </div>

        {role !== 'recruiter' && role !== 'lead' && role !== 'admin' && (
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-semibold rounded-xl shadow-md transition-all flex items-center gap-2 self-start md:self-auto">
            <Download className="w-4 h-4" /> Export Analytics (PDF/CSV)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-blue-600" /> Requirements: Submissions VS Non-Submission
                </h3>
                <p className="text-xs text-slate-500 font-mono">Job openings coverage breakdown</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                83.3% Active Coverage
              </span>
            </div>

            <div className="py-4">
              <SVGDonutChart segments={SUB_VS_NON_SUB_SEGMENTS} size={190} />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center text-xs font-mono">
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Active Submissions</p>
              <p className="text-lg font-bold text-blue-600">15 Reqs (83%)</p>
            </div>
            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Zero Submissions (Critical)</p>
              <p className="text-lg font-bold text-rose-600">3 Reqs (17%)</p>
            </div>
          </div>
        </div>

        <InteractiveTrendVisualizer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" /> Recruiter Performance: Reqs VS Submissions
              </h3>
              <p className="text-xs text-slate-500 font-mono">Assigned job orders vs candidate output per recruiter</p>
            </div>
          </div>

          <DualBarChart items={RECRUITER_DUAL_BAR_ITEMS} />
        </div>

        <AnalyticsReportsPocPanel />
      </div>

      <AnalyticsReportsTimeline />
    </div>
  )
}
