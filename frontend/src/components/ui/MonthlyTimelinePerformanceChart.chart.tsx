import React from 'react'
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
import { CustomTooltip, MonthlyMetric } from './MonthlyTimelinePerformanceChart.data'

export function MonthlyTimelineTableAndChart({
  data,
  totalReqs,
  totalPositionsSum,
  totalFirstSubs,
  totalSubsSum,
}: {
  data: MonthlyMetric[]
  totalReqs: number
  totalPositionsSum: number
  totalFirstSubs: number
  totalSubsSum: number
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 space-y-3">
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1E3A8A] text-white text-[10px] font-bold uppercase tracking-wider">
                <th className="py-3 px-2.5">Month</th>
                <th className="py-3 px-2 text-center">Reqs</th>
                <th className="py-3 px-2 text-center">Positions</th>
                <th className="py-3 px-2 text-center">First Sub</th>
                <th className="py-3 px-2 text-center">Total Sub</th>
                <th className="py-3 px-2.5 text-right">Avg TAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {data.map(row => (
                <tr key={row.month} className="hover:bg-purple-50/60 transition-colors">
                  <td className="py-3 px-2.5 font-extrabold text-slate-900">{row.month}</td>
                  <td className="py-3 px-2 text-center font-bold text-[#2563EB]">{row.requirementsReceived}</td>
                  <td className="py-3 px-2 text-center font-extrabold text-indigo-600">{row.totalPositions}</td>
                  <td className="py-3 px-2 text-center font-bold text-slate-700">{row.firstSubmissions}</td>
                  <td className="py-3 px-2 text-center font-extrabold text-[#84CC16]">{row.totalSubmissions}</td>
                  <td className="py-3 px-2.5 text-right font-bold text-purple-700">
                    {row.avgTATDays !== null ? `${row.avgTATDays}d` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 text-slate-900 font-extrabold">
                <td className="py-2.5 px-2.5 text-xs">Total YTD</td>
                <td className="py-2.5 px-2 text-center text-blue-700">{totalReqs}</td>
                <td className="py-2.5 px-2 text-center text-indigo-700">{totalPositionsSum}</td>
                <td className="py-2.5 px-2 text-center text-slate-700">{totalFirstSubs}</td>
                <td className="py-2.5 px-2 text-center text-lime-700">{totalSubsSum}</td>
                <td className="py-2.5 px-2.5 text-right text-purple-700">1.67d</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="lg:col-span-7 h-[300px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84CC16" stopOpacity={1} />
                <stop offset="100%" stopColor="#65A30D" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} tickLine={false} />
            <YAxis yAxisId="left" orientation="left" domain={[0, 250]} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 6]} unit="d" tick={{ fontSize: 11, fontWeight: 700, fill: '#7E22CE' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }} iconType="circle" />

            <Bar yAxisId="left" dataKey="requirementsReceived" name="Requirements Received" fill="url(#reqGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar yAxisId="left" dataKey="totalPositions" name="Total Positions" fill="url(#posGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar yAxisId="left" dataKey="totalSubmissions" name="Total Submissions" fill="url(#subGrad)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgTATDays"
              name="Avg First-Sub TAT (days)"
              stroke="#9333EA"
              strokeWidth={3.5}
              connectNulls={true}
              dot={{ r: 5, fill: '#9333EA', stroke: '#FFFFFF', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#6B21A8', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
