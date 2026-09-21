import React from 'react'
import { Building2, Clock, Zap } from 'lucide-react'
import { MOCK_CLIENT_POCS, MOCK_FIRST_SUB_TIMELINE } from './AnalyticsReports.data'

export function AnalyticsReportsPocPanel() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Client POC-Wise Performance Analysis
            </h3>
            <p className="text-xs text-slate-500 font-mono">Requirements and submission yield per Client POC</p>
          </div>
          <span className="text-xs font-mono text-slate-400">6 Key Client Accounts</span>
        </div>

        <div className="space-y-3">
          {MOCK_CLIENT_POCS.map((poc, i) => (
            <div
              key={i}
              className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs font-mono">
                  {poc.pocName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 font-sans">{poc.pocName}</p>
                  <p className="text-[10px] font-mono text-slate-400">Client: {poc.client}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-[9px] font-mono text-slate-400">REQS</p>
                  <p className="text-xs font-bold font-mono text-indigo-600">{poc.reqs}</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-slate-400">SUBS</p>
                  <p className="text-xs font-bold font-mono text-blue-600">{poc.submissions}</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold rounded border border-emerald-200">
                  {poc.conversion}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AnalyticsReportsTimeline() {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-sans flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" /> First Submission Speed Analysis (Requirement Date/Time VS First Candidate)
          </h3>
          <p className="text-xs text-slate-500 font-mono">SLA calculation measuring time elapsed from job creation timestamp to first submission</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold">
          <Zap className="w-3.5 h-3.5" /> Average Turnaround: 4.8 Hours
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/60 font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-3 px-4">Req ID & Job Title</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Requirement Created (Date & Time)</th>
              <th className="py-3 px-4">First Submission Timestamp</th>
              <th className="py-3 px-4 text-center">Calculated Turnaround SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_FIRST_SUB_TIMELINE.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-[10px] font-mono text-slate-400 mr-2">{item.reqId}</span>
                  <span className="font-bold text-slate-900 font-sans">{item.title}</span>
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">{item.client}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{item.reqTime}</td>
                <td className="py-3 px-4 font-mono text-blue-600 font-semibold">{item.firstSubTime}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${item.speedClass}`}>
                    ⚡ {item.turnaround}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
