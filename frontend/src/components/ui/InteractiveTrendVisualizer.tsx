import React, { useState } from 'react'
import { RECRUITER_TREND_DATA } from './InteractiveTrendVisualizer.data'
import { InteractiveTrendHeader } from './InteractiveTrendVisualizer.header'
import { InteractiveTrendChart } from './InteractiveTrendVisualizer.chart'

export function InteractiveTrendVisualizer() {
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>('All')
  const [timeframe, setTimeframe] = useState<'Day-Wise' | 'Month-Wise'>('Day-Wise')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [metricMode, setMetricMode] = useState<'Submissions' | 'Interviews' | 'Placements'>('Submissions')

  const rawPoints =
    RECRUITER_TREND_DATA[selectedRecruiter]?.[timeframe] ||
    RECRUITER_TREND_DATA['All'][timeframe]

  const points = rawPoints.map(p => {
    let multiplier = 1
    if (metricMode === 'Interviews') multiplier = 0.35
    if (metricMode === 'Placements') multiplier = 0.12
    return {
      ...p,
      displayVal: Math.max(1, Math.round(p.value * multiplier)),
      displayTarget: Math.max(1, Math.round(p.target * multiplier)),
    }
  })

  const maxVal = Math.max(...points.map(p => p.displayVal), 1)
  const svgWidth = 600
  const svgHeight = 220
  const paddingX = 40
  const paddingY = 30

  const coords = points.map((p, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * (svgWidth - 2 * paddingX)
    const y = svgHeight - paddingY - (p.displayVal / maxVal) * (svgHeight - 2 * paddingY)
    return { x, y, point: p }
  })

  let pathD = `M ${coords[0].x},${coords[0].y}`
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i]
    const next = coords[i + 1]
    const cpX = (curr.x + next.x) / 2
    pathD += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`
  }

  const areaD = `${pathD} L ${coords[coords.length - 1].x},${svgHeight - paddingY} L ${coords[0].x},${svgHeight - paddingY} Z`

  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1]

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl p-6 glow-card">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <InteractiveTrendHeader
        selectedRecruiter={selectedRecruiter}
        setSelectedRecruiter={setSelectedRecruiter}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        metricMode={metricMode}
        setMetricMode={setMetricMode}
      />

      <div className="relative z-10 py-4">
        <div className="flex flex-wrap items-center justify-between bg-slate-800/50 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-mono font-bold text-sm shadow-md">
              {activePoint.point.displayVal}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Point:</span>
                <span className="text-sm font-bold font-mono text-white">{activePoint.point.label} ({timeframe})</span>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {metricMode}: {activePoint.point.displayVal}
                </span>
              </div>
              {activePoint.point.topCandidate && (
                <p className="text-[11px] text-slate-300 font-body">
                  🌟 Top Candidate Highlight: <span className="font-semibold text-emerald-400">{activePoint.point.topCandidate}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-right font-mono text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Target Threshold</p>
              <p className="font-bold text-slate-300">{activePoint.point.displayTarget}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Target Surplus</p>
              <p className="font-bold text-emerald-400">
                +{Math.max(0, activePoint.point.displayVal - activePoint.point.displayTarget)}
              </p>
            </div>
          </div>
        </div>

        <InteractiveTrendChart
          svgWidth={svgWidth}
          svgHeight={svgHeight}
          paddingX={paddingX}
          paddingY={paddingY}
          areaD={areaD}
          pathD={pathD}
          coords={coords}
          hoveredIdx={hoveredIdx}
          setHoveredIdx={setHoveredIdx}
        />
      </div>

      <div className="relative z-10 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-center">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Peak Surge Point</p>
          <p className="font-bold text-emerald-400 text-sm">
            {points.reduce((prev, curr) => (curr.displayVal > prev.displayVal ? curr : prev), points[0]).label} (
            {Math.max(...points.map(p => p.displayVal))} {metricMode})
          </p>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Sourcing Velocity Pace</p>
          <p className="font-bold text-blue-400 text-sm">124% of Target Goal</p>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-400 uppercase">Filtered View</p>
          <p className="font-bold text-indigo-300 text-sm">{selectedRecruiter} · {timeframe}</p>
        </div>
      </div>
    </div>
  )
}
