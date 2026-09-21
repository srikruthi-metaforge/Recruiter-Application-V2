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
import { Building, Layers } from 'lucide-react'

export interface DomainMetric {
  domain: string
  submissions: number
  totalRequirements: number
}

// Data extracted pixel-by-pixel from Excel Reference Sheet
const DOMAIN_WISE_DATA: DomainMetric[] = [
  { domain: 'Mechanical / CAD Design', submissions: 103, totalRequirements: 38 },
  { domain: 'Electrical / Controls / PLC', submissions: 23, totalRequirements: 19 },
  { domain: 'Manufacturing / Production', submissions: 23, totalRequirements: 9 },
  { domain: 'Software / IT Development', submissions: 23, totalRequirements: 26 },
  { domain: 'Other / Unclassified', submissions: 22, totalRequirements: 91 },
  { domain: 'Embedded / Hardware / Firmware', submissions: 20, totalRequirements: 21 },
  { domain: 'Piping / Plant Design', submissions: 18, totalRequirements: 15 },
  { domain: 'Mobility / FMS / Cloud Dev', submissions: 12, totalRequirements: 6 },
  { domain: 'Quality / Testing / QA', submissions: 11, totalRequirements: 28 },
  { domain: 'Telecom / Wireless / Networking', submissions: 9, totalRequirements: 5 },
  { domain: 'Data / AI / Analytics', submissions: 8, totalRequirements: 8 },
  { domain: 'Documentation / Tech Writing', submissions: 6, totalRequirements: 4 },
  { domain: 'Supply Chain / Warehouse', submissions: 6, totalRequirements: 1 },
  { domain: 'Automotive / NVH / Vehicle', submissions: 5, totalRequirements: 8 },
  { domain: 'Welding / Fixture Design', submissions: 4, totalRequirements: 7 },
  { domain: 'SAP / ERP', submissions: 3, totalRequirements: 0 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataObj = payload[0].payload
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 font-sans animate-in fade-in zoom-in-95 duration-150">
        <div className="font-extrabold text-blue-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
          <span>{dataObj.domain}</span>
          <span className="text-[10px] text-slate-400 font-normal">Domain / Dept</span>
        </div>
        <div className="space-y-1 text-[11px] font-medium pt-0.5">
          <div className="flex justify-between gap-6">
            <span className="text-blue-400 font-bold">No. of Submissions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.submissions}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-lime-400 font-bold">Total Requirements (all received):</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.totalRequirements}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

import { Role } from '../../types'

export interface DomainWiseSubmissionChartProps {
  role?: Role
}

export function DomainWiseSubmissionChart({ role = 'lead' }: DomainWiseSubmissionChartProps) {
  const [leadChartView, setLeadChartView] = useState<'individual' | 'team'>('individual')
  const [data] = useState<DomainMetric[]>(DOMAIN_WISE_DATA)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 font-sans">
      {/* 1. TITLE HEADER */}
      <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#6B3BF6]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Lead Individual Domain Breakdown: Submissions & Reqs'
                  : 'Team Members Comparison: Domain / Department Submission Analysis'
                : 'Domain / Department — Submission Analysis'}
            </h2>
            <p className="text-xs text-slate-500">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Department breakdown for Harish Gadipally (Team Lead Individual)'
                  : 'Department submission analysis across team recruiters'
                : 'Department submission analysis'}
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
                  <th className="py-2.5 px-3">Domain / Department</th>
                  <th className="py-2.5 px-2 text-center">Submissions</th>
                  <th className="py-2.5 px-3 text-right">Total Reqs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {data.map(row => (
                  <tr key={row.domain} className="hover:bg-purple-50/60 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-900 truncate max-w-[170px]" title={row.domain}>
                      {row.domain}
                    </td>
                    <td className="py-2 px-2 text-center font-extrabold text-[#2563EB] tabular-nums">
                      {row.submissions}
                    </td>
                    <td className="py-2 px-3 text-right font-extrabold text-[#84CC16] tabular-nums">
                      {row.totalRequirements}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recharts Horizontal Grouped Bar Chart */}
        <div className="lg:col-span-7 h-[500px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 30, left: 130, bottom: 10 }}
            >
              <defs>
                <linearGradient id="domBlueGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="domGreenGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#84CC16" stopOpacity={1} />
                  <stop offset="100%" stopColor="#65A30D" stopOpacity={0.85} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="domain"
                width={140}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#334155' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} iconType="circle" />

              <Bar dataKey="submissions" name="No. of Submissions" fill="url(#domBlueGrad)" radius={[0, 4, 4, 0]} maxBarSize={14} />
              <Bar dataKey="totalRequirements" name="Total Requirements (all received)" fill="url(#domGreenGrad)" radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
