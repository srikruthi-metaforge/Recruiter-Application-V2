import React from 'react'
import { FileText } from 'lucide-react'
import { DetailLogItem } from './MonthlyTimelinePerformanceChart.data'

export function MonthlyTimelineLogs({ logs }: { logs: DetailLogItem[] }) {
  return (
    <div className="pt-4 border-t border-slate-100 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6B3BF6]" />
            <span>Monthly Requirement Positions Log</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Breakdown of total positions count (openings) for monthly received requirements
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-extrabold">
          Total Logged Positions: {logs.reduce((acc, curr) => acc + (curr.positions || 0), 0)} Positions
        </span>
      </div>

      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">REQ ID & SUBJECT</th>
              <th className="py-3 px-3">RECRUITER</th>
              <th className="py-3 px-3">CLIENT POC</th>
              <th className="py-3 px-3 text-center bg-indigo-50/70 text-indigo-900 font-extrabold">POSITIONS (OPENINGS)</th>
              <th className="py-3 px-3">RECEIVED ON</th>
              <th className="py-3 px-3">SUBMITTED ON</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-bold text-slate-900">
                  <div>{log.subject}</div>
                  <span className="text-[10px] text-slate-400 font-normal font-mono">{log.id}</span>
                </td>
                <td className="py-3 px-3 font-bold text-purple-700">{log.recruiter}</td>
                <td className="py-3 px-3 text-slate-600">{log.clientPOC}</td>
                <td className="py-3 px-3 text-center font-black text-indigo-900 bg-indigo-50/40 text-sm">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 inline-block">
                    {log.positions} Openings
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-600">{log.receivedDate} ({log.receivedTime})</td>
                <td className="py-3 px-3 text-emerald-700 font-bold">{log.submittedDate} ({log.submittedTime})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
