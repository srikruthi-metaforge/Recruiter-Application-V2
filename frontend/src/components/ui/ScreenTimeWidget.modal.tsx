import React from 'react'
import { Clock, Activity, ShieldCheck, X, BarChart2 } from 'lucide-react'
import { formatDuration, formatDurationShort, ScreenTimeRecord } from '../../utils/screenTimeTracker'

export function ScreenTimeModal({
  currentUserName,
  currentUserRole,
  record,
  activeRatio,
  onClose,
}: {
  currentUserName: string
  currentUserRole: string
  record: ScreenTimeRecord
  activeRatio: number
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 font-sans">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6B3BF6]/10 text-[#6B3BF6] flex items-center justify-center font-extrabold text-base border border-[#6B3BF6]/20">
              <Clock className="w-5 h-5 text-[#6B3BF6]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recruiter Screen Time Tracking</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                User: <strong className="text-slate-800 font-bold">{currentUserName}</strong> ({currentUserRole})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#6B3BF6] shrink-0 mt-0.5" />
            <p className="text-xs text-purple-950 font-medium leading-relaxed">
              <strong>Notice of Usage & Performance Tracking:</strong> Application screen time is recorded for individual recruiter performance evaluations, attendance verification, and workload analysis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Active Screen Time</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {formatDuration(record.activeSeconds)}
              </div>
              <div className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {activeRatio}% Active Ratio
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Idle / Inactive Time</span>
              </div>
              <div className="text-2xl font-black text-slate-700 font-mono">
                {formatDuration(record.idleSeconds)}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Pauses after 60s inactivity
              </div>
            </div>
          </div>

          <div className="border border-slate-200/80 rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-[#6B3BF6]" />
                Weekly Usage Timeline
              </h3>
              <span className="text-[11px] font-bold text-[#6B3BF6]">This Week</span>
            </div>
            <div className="space-y-2">
              {[
                { day: 'Mon', hours: '6h 30m', pct: 85 },
                { day: 'Tue', hours: '7h 15m', pct: 92 },
                { day: 'Wed (Today)', hours: formatDurationShort(record.activeSeconds), pct: activeRatio },
                { day: 'Thu', hours: '—', pct: 0 },
                { day: 'Fri', hours: '—', pct: 0 },
              ].map((d, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{d.day}</span>
                    <span className="font-mono text-slate-900">{d.hours}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6B3BF6] to-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Tracking status: <strong className="text-emerald-700 font-bold">Active & Recorded</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
