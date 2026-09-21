import React from 'react'
import { StageMetric } from './StagePipelinePerformanceChart.data'

export const CustomStageTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dataObj = payload[0].payload as StageMetric
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 font-sans animate-in fade-in zoom-in-95 duration-150">
        <div className="font-extrabold text-blue-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
          <span>Stage: {dataObj.stage}</span>
          <span className="text-[10px] text-slate-400 font-normal">{dataObj.stageName}</span>
        </div>
        <div className="space-y-1 text-[11px] font-medium pt-0.5">
          <div className="flex justify-between gap-4">
            <span className="text-blue-400 font-bold">Requirements:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.requirementsCount ?? 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-indigo-400 font-bold">Total Positions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.positionsCount ?? 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-lime-400 font-bold">Submissions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.submissionsCount ?? 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-amber-400 font-bold">Placed:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.placedCount ?? 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-purple-400 font-bold">Closures:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.closuresCount ?? 0}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-purple-300 font-bold">
            <span>Pipeline Retention:</span>
            <span className="tabular-nums text-purple-300">{dataObj.conversionPct}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
