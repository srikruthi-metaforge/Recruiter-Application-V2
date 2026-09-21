import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { BarChart3, TrendingUp } from 'lucide-react'
import { Role } from '../../types'
import {
  ALL_RECRUITERS_DATA,
  CustomTooltip,
  LEAD_PERSONAL_TREND_DATA,
  LEAD_TEAM_CHART_DATA,
  RECRUITER_PERSONAL_TREND_DATA,
} from './RecruiterPerformanceChart.data'

export type { RecruiterChartMetric } from './RecruiterPerformanceChart.data'

interface RecruiterPerformanceChartProps {
  role?: Role
  recruiterName?: string
}

export function RecruiterPerformanceChart({
  role = 'recruiter',
  recruiterName = 'Marcus Chen',
}: RecruiterPerformanceChartProps) {
  const [leadChartView, setLeadChartView] = useState<'individual' | 'team'>('individual')

  const chartData = useMemo(() => {
    if (role === 'lead') {
      return leadChartView === 'individual' ? LEAD_PERSONAL_TREND_DATA : LEAD_TEAM_CHART_DATA
    }
    if (role === 'recruiter') {
      return RECRUITER_PERSONAL_TREND_DATA
    }
    return ALL_RECRUITERS_DATA
  }, [role, leadChartView])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5 font-sans">
      {/* 1. CHART HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {role === 'recruiter' || (role === 'lead' && leadChartView === 'individual') ? (
              <TrendingUp className="w-5 h-5 text-[#6B3BF6]" />
            ) : (
              <BarChart3 className="w-5 h-5 text-[#2563EB]" />
            )}
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? `Team Lead Individual Performance Timeline & TAT Trend (${recruiterName || 'Harish Gadipally'})`
                  : `Team Members Sourcing & Turnaround Comparison`
                : role === 'recruiter'
                ? `My Performance Timeline & Turnaround Time Trend (${recruiterName})`
                : 'Recruiter: Submissions, Requirements & First-Submission TAT Trend'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'lead'
              ? leadChartView === 'individual'
                ? `Individual monthly performance trend, requirement submissions, and turnaround SLA for ${recruiterName || 'Harish Gadipally'}`
                : `Sourcing and turnaround comparison across team recruiters.`
              : role === 'recruiter'
              ? `Personal performance timeline for ${recruiterName}`
              : 'Organization-wide recruiter comparison'}
          </p>
        </div>

        {/* Lead View Mode Toggle */}
        {role === 'lead' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLeadChartView('individual')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                leadChartView === 'individual' ? 'bg-[#6B3BF6] text-white shadow-2xs font-bold' : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Lead Individual Performance
            </button>
            <button
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

      {/* 2. RECHARTS CANVAS */}
      <div className="h-[330px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={1} />
                  <stop offset="100%" stopColor="#B91C1C" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={1} />
                  <stop offset="100%" stopColor="#15803D" stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} tickLine={false} />
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={[0, role === 'recruiter' ? 50 : 160]}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 4.5]}
                unit="d"
                tick={{ fontSize: 11, fontWeight: 700, fill: '#7E22CE' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '12px', fontWeight: 700, paddingTop: '10px' }}
                iconType="circle"
              />

              <Bar yAxisId="left" dataKey="totalSubmissions" name="Total Submissions" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar yAxisId="left" dataKey="totalRequirements" name="Total Requirements" fill="url(#redGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar yAxisId="left" dataKey="firstSubmissions" name="First Submissions (won)" fill="url(#greenGrad)" radius={[6, 6, 0, 0]} maxBarSize={32} />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgTATDays"
                name="Avg First-Sub TAT (days)"
                stroke="#9333EA"
                strokeWidth={3.5}
                dot={{ r: 5, fill: '#9333EA', stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: '#6B21A8', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
    </div>
  )
}
