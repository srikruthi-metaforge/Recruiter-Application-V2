import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'

const COVERAGE_DATA = [
  { name: 'With Submission', value: 164, color: '#2563EB' },
  { name: 'No Submission', value: 122, color: '#DC2626' },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const total = 286
    const pct = ((data.value / total) * 100).toFixed(1)
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-sans space-y-1">
        <div className="font-extrabold flex items-center gap-2" style={{ color: data.payload.color }}>
          <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: data.payload.color }} />
          <span>{data.name}</span>
        </div>
        <div className="text-slate-300 font-medium">
          <strong className="text-white text-sm tabular-nums">{data.value}</strong> requirements ({pct}%)
        </div>
      </div>
    )
  }
  return null
}

import { useState } from 'react'
import { Role } from '../../types'

export interface RequirementCoverageChartProps {
  role?: Role
}

export function RequirementCoverageChart({ role = 'lead' }: RequirementCoverageChartProps) {
  const [leadChartView, setLeadChartView] = useState<'individual' | 'team'>('individual')
  const withSubmission = leadChartView === 'individual' ? 24 : 164
  const noSubmission = leadChartView === 'individual' ? 6 : 122
  const total = withSubmission + noSubmission
  const withPct = ((withSubmission / total) * 100).toFixed(1)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 font-sans">
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Lead Individual Coverage: Worked vs Non-Worked Requirements'
                  : 'Team Members Comparison: Requirement Coverage Breakdown'
                : 'Requirement Coverage: With vs Without Submission'}
            </h2>
            <p className="text-xs text-slate-500">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Assigned requirement coverage for Harish Gadipally (Team Lead Individual)'
                  : 'Requirement coverage metrics across team recruiters'
                : 'Requirement coverage breakdown'}
            </p>
          </div>
        </div>

        {/* Lead View Mode Toggle (Lead Only) */}
        {role === 'lead' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLeadChartView('individual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                leadChartView === 'individual' ? 'bg-[#6B3BF6] text-white shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Lead Individual Performance
            </button>
            <button
              type="button"
              onClick={() => setLeadChartView('team')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                leadChartView === 'team' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Team Members Comparison
            </button>
          </div>
        )}
      </div>

      {/* Grid: Excel Table (Left) + Recharts Donut/Pie Chart (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Excel-Aligned Table */}
        <div className="md:col-span-5 space-y-3">
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1E3A8A] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">No. of Requirements</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                <tr className="bg-emerald-50/40 hover:bg-blue-50/80 transition-colors cursor-pointer">
                  <td className="py-3 px-4 flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-3 h-3 rounded-xs bg-[#2563EB] shrink-0" />
                    <span>With Submission</span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-[#2563EB] tabular-nums text-sm">
                    {withSubmission}
                  </td>
                </tr>

                <tr className="bg-rose-50/40 hover:bg-red-50/80 transition-colors cursor-pointer">
                  <td className="py-3 px-4 flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-3 h-3 rounded-xs bg-[#DC2626] shrink-0" />
                    <span>No Submission</span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-[#DC2626] tabular-nums text-sm">
                    {noSubmission}
                  </td>
                </tr>

                <tr className="bg-slate-100/80 font-extrabold text-slate-900 border-t border-slate-300">
                  <td className="py-3 px-4 text-xs">Total Requirements</td>
                  <td className="py-3 px-4 text-right text-sm tabular-nums">{total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold">Coverage Ratio:</span>
            <span className="font-extrabold text-[#2563EB]">{withPct}% Sourced</span>
          </div>
        </div>

        {/* Right Column: Recharts Pie Chart */}
        <div className="md:col-span-7 h-[240px] w-full flex items-center justify-center p-2 bg-slate-50/60 rounded-2xl border border-slate-200/60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={COVERAGE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                animationDuration={800}
              >
                {COVERAGE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
