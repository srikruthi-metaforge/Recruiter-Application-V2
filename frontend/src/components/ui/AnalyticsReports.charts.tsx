import React from 'react'
import { PieSegment, DualBarItem } from './AnalyticsReports.data'

export function SVGDonutChart({ segments, size = 180 }: { segments: PieSegment[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  let cumulativeAngle = 0

  const radius = size / 2 - 20
  const center = size / 2
  const strokeWidth = 28

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, idx) => {
            const angle = (seg.value / total) * 360
            const strokeDasharray = `${(angle / 360) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`
            const strokeDashoffset = -((cumulativeAngle / 360) * (2 * Math.PI * radius))
            cumulativeAngle += angle

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80 cursor-pointer"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-extrabold font-mono text-slate-900">{total}</span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Total Reqs</span>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((s, i) => {
          const pct = Math.round((s.value / total) * 100)
          return (
            <div key={i} className="flex items-center gap-3 text-xs font-mono">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-slate-700 font-medium min-w-[140px]">{s.label}:</span>
              <span className="font-bold text-slate-900">{s.value} ({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function DualBarChart({ items }: { items: DualBarItem[] }) {
  const maxVal = Math.max(...items.flatMap(i => [i.value1, i.value2]), 1)

  return (
    <div className="space-y-3 pt-2">
      {items.map((item, idx) => {
        const pct1 = Math.max(10, (item.value1 / maxVal) * 100)
        const pct2 = Math.max(10, (item.value2 / maxVal) * 100)

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-800">
              <span>{item.label}</span>
              <span className="text-[11px] text-slate-500">
                <span className="text-indigo-600 font-bold">{item.value1} Reqs</span> ·{' '}
                <span className="text-blue-600 font-bold">{item.value2} Subs</span>
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${pct1}%` }}
                  title={`Requirements: ${item.value1}`}
                />
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct2}%` }}
                  title={`Submissions: ${item.value2}`}
                />
              </div>
            </div>
          </div>
        )
      })}

      <div className="flex justify-end gap-4 pt-2 text-[10px] font-mono font-bold">
        <span className="flex items-center gap-1 text-indigo-600">
          <span className="w-2.5 h-2.5 rounded bg-indigo-600" /> Total Requirements
        </span>
        <span className="flex items-center gap-1 text-blue-600">
          <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Total Submissions
        </span>
      </div>
    </div>
  )
}
