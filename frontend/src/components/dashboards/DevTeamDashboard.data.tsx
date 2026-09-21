import React from 'react'

export const SYSTEM_LATENCY_TREND = [
  { time: '08:00', ResponseTime: 120, APIRequests: 1420, SystemLoad: 32 },
  { time: '10:00', ResponseTime: 145, APIRequests: 2840, SystemLoad: 58 },
  { time: '12:00', ResponseTime: 180, APIRequests: 4120, SystemLoad: 74 },
  { time: '14:00', ResponseTime: 160, APIRequests: 3890, SystemLoad: 68 },
  { time: '16:00', ResponseTime: 135, APIRequests: 3200, SystemLoad: 52 },
  { time: '18:00', ResponseTime: 110, APIRequests: 2100, SystemLoad: 38 },
  { time: '20:00', ResponseTime: 95, APIRequests: 1150, SystemLoad: 24 },
]

export const CLIENT_REQUIREMENTS_DATA = [
  { client: 'LTTS', Requirements: 14, Openings: 32 },
  { client: 'ITC', Requirements: 9, Openings: 18 },
  { client: 'KPMG', Requirements: 7, Openings: 12 },
  { client: 'Deloitte', Requirements: 5, Openings: 8 },
  { client: 'Metaforge', Requirements: 8, Openings: 15 },
  { client: 'Tesla AI', Requirements: 4, Openings: 6 },
]

export const RECRUITER_PERFORM_DATA = [
  { name: 'Lakshmi V', Submissions: 194, Target: 150 },
  { name: 'Harish G', Submissions: 142, Target: 120 },
  { name: 'Rahimoon S', Submissions: 82, Target: 100 },
  { name: 'Suresh K', Submissions: 46, Target: 60 },
  { name: 'Lingoji P', Submissions: 38, Target: 50 },
]

export const CustomDevTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1 font-sans">
        <p className="font-extrabold text-violet-400 border-b border-slate-700 pb-1 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`dev-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white tabular-nums">
              {entry.name === 'ResponseTime' ? `${entry.value}ms` : entry.name === 'SystemLoad' ? `${entry.value}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}
