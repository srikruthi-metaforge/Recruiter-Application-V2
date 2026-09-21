import React, { useState } from 'react'
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
import { UserCheck } from 'lucide-react'

import { Role } from '../../types'
import {
  CLIENT_POC_DATA,
  ClientPOCMetric,
  ClientPOCSubmissionChartProps,
  CustomTooltip,
  LEAD_CLIENT_POC_DATA,
} from './ClientPOCSubmissionChart.data'

export type { ClientPOCMetric }

export function ClientPOCSubmissionChart({ role = 'recruiter', recruiterName = 'Marcus Chen' }: ClientPOCSubmissionChartProps) {
  const [leadChartView, setLeadChartView] = useState<'individual' | 'team'>('individual')
  const data = leadChartView === 'individual'
    ? LEAD_CLIENT_POC_DATA 
    : CLIENT_POC_DATA

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 font-sans">
      {/* 1. TITLE HEADER */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB]">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Lead Individual Client POC: Submissions vs Total Requirements'
                  : 'Team Members Comparison: Client POC Analytics'
                : 'Client POC: Submissions vs Total Requirements'}
            </h2>
            <p className="text-xs text-slate-500">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Client POC submission breakdown for Harish Gadipally'
                  : 'Client POC submission comparison across team members'
                : 'Client POC submission breakdown'}
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

      {/* 2. GRID LAYOUT: EXCEL TABLE + HORIZONTAL BAR GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Excel Table */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1E3A8A] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Client POC</th>
                  <th className="py-3 px-2 text-center">No. of Submissions</th>
                  <th className="py-3 px-3 text-right">Total Requirements (unique)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {data.map(row => (
                  <tr key={row.pocName} className="hover:bg-purple-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 truncate max-w-[160px]" title={row.pocName}>
                      {row.pocName}
                    </td>
                    <td className="py-2.5 px-2 text-center font-extrabold text-[#2563EB] tabular-nums">
                      {row.submissions}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-[#DC2626] tabular-nums">
                      {row.totalRequirements}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recharts Horizontal Grouped Bar Chart */}
        <div className="lg:col-span-7 h-[380px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <defs>
                <linearGradient id="pocBlueGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="pocRedGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={1} />
                  <stop offset="100%" stopColor="#B91C1C" stopOpacity={0.85} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 300]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="pocName"
                width={120}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#334155' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} iconType="circle" />

              <Bar dataKey="submissions" name="No. of Submissions" fill="url(#pocBlueGrad)" radius={[0, 4, 4, 0]} maxBarSize={18} />
              <Bar dataKey="totalRequirements" name="Total Requirements (unique)" fill="url(#pocRedGrad)" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
