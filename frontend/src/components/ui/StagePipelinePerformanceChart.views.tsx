import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { StageMetric } from './StagePipelinePerformanceChart.data'
import { CustomStageTooltip } from './StagePipelinePerformanceChart.tooltip'

export function StagePipelineSummaryTable({
  data,
  totalReqs,
  totalPositions,
  totalSubs,
  totalPlaced,
  totalClosures,
}: {
  data: StageMetric[]
  totalReqs: number
  totalPositions: number
  totalSubs: number
  totalPlaced: number
  totalClosures: number
}) {
  return (
    <div className="lg:col-span-5 space-y-3">
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1E3A8A] text-white text-[10px] font-bold uppercase tracking-wider">
              <th className="py-3 px-2">Stage</th>
              <th className="py-3 px-2 text-right">Reqs</th>
              <th className="py-3 px-2 text-right">Positions</th>
              <th className="py-3 px-2 text-right">Subs</th>
              <th className="py-3 px-2 text-right">Placed</th>
              <th className="py-3 px-2 text-right">Closures</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {data.map(row => (
              <tr key={row.stage} className="hover:bg-purple-50/60 transition-colors">
                <td className="py-3 px-2">
                  <div className="font-extrabold text-slate-900">{row.stage}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{row.stageName}</div>
                </td>
                <td className="py-3 px-2 text-right font-extrabold text-[#2563EB]">
                  {row.requirementsCount ?? 0}
                </td>
                <td className="py-3 px-2 text-right font-extrabold text-indigo-600">
                  {row.positionsCount ?? 0}
                </td>
                <td className="py-3 px-2 text-right font-extrabold text-[#84CC16]">
                  {row.submissionsCount ?? 0}
                </td>
                <td className="py-3 px-2 text-right font-extrabold text-amber-600">
                  {row.placedCount ?? 0}
                </td>
                <td className="py-3 px-2 text-right font-extrabold text-purple-600">
                  {row.closuresCount ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200 text-slate-900 font-extrabold">
              <td className="py-2.5 px-2 text-xs">Total Pipeline</td>
              <td className="py-2.5 px-2 text-right text-blue-700">{totalReqs}</td>
              <td className="py-2.5 px-2 text-right text-indigo-700">{totalPositions}</td>
              <td className="py-2.5 px-2 text-right text-lime-700">{totalSubs}</td>
              <td className="py-2.5 px-2 text-right text-amber-700">{totalPlaced}</td>
              <td className="py-2.5 px-2 text-right text-purple-700">{totalClosures}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

export function StagePipelineBarChart({ data }: { data: StageMetric[] }) {
  return (
    <div className="lg:col-span-7 h-[300px] w-full pt-1">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="stageReqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="stagePosGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="stageSubGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#84CC16" stopOpacity={1} />
              <stop offset="100%" stopColor="#65A30D" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="stagePlacedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
              <stop offset="100%" stopColor="#D97706" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="stageClosureGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333EA" stopOpacity={1} />
              <stop offset="100%" stopColor="#7E22CE" stopOpacity={0.8} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomStageTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} iconType="circle" />

          <Bar dataKey="requirementsCount" name="Requirements" fill="url(#stageReqGrad)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="positionsCount" name="Total Positions" fill="url(#stagePosGrad)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="submissionsCount" name="Submissions" fill="url(#stageSubGrad)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="placedCount" name="Placed" fill="url(#stagePlacedGrad)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="closuresCount" name="Closures" fill="url(#stageClosureGrad)" radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
