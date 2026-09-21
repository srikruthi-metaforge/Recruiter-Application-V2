import React from 'react'
import { Sparkles, User, Activity } from 'lucide-react'

export function InteractiveTrendHeader({
  selectedRecruiter,
  setSelectedRecruiter,
  timeframe,
  setTimeframe,
  metricMode,
  setMetricMode,
}: {
  selectedRecruiter: string
  setSelectedRecruiter: (value: string) => void
  timeframe: 'Day-Wise' | 'Month-Wise'
  setTimeframe: (value: 'Day-Wise' | 'Month-Wise') => void
  metricMode: 'Submissions' | 'Interviews' | 'Placements'
  setMetricMode: (value: 'Submissions' | 'Interviews' | 'Placements') => void
}) {
  return (
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" /> Interactive Trend Engine
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ⚡ Live Velocity: +24% Growth
          </span>
        </div>
        <h3 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" /> Recruiter Performance Surge Visualizer
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
          <User className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Recruiter:</span>
          <select
            value={selectedRecruiter}
            onChange={e => setSelectedRecruiter(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-slate-900 text-white">All Recruiters (Aggregate)</option>
            <option value="Marcus Chen" className="bg-slate-900 text-white">Marcus Chen</option>
            <option value="James O'Brien" className="bg-slate-900 text-white">James O'Brien</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          {(['Submissions', 'Interviews', 'Placements'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetricMode(m)}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-all ${
                metricMode === m
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          {(['Day-Wise', 'Month-Wise'] as const).map(f => (
            <button
              key={f}
              onClick={() => setTimeframe(f)}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-all ${
                timeframe === f
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
