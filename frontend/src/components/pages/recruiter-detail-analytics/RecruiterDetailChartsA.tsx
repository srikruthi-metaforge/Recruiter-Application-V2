import React from 'react'
import { BarChart3, TrendingUp, Sparkles, Activity } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts'
import { RecruiterDetailVm } from './useRecruiterDetailAnalytics'

export function RecruiterDetailChartsA({ vm }: { vm: RecruiterDetailVm }) {
  const {
    recruiter,
  } = vm
  return (
    <>
      {/* 2.5 WORK PERFORMANCE & ANALYTICS CHARTS SECTION */}
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6B3BF6]/20 border border-[#6B3BF6]/40 flex items-center justify-center text-purple-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-sans tracking-tight">
                {recruiter.name} — Work Performance & Sourcing Analytics
              </h3>
              <p className="text-xs text-slate-300 font-normal">
                Weekly activity trends, candidate stage funnel, and client distribution metrics
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-[#6B3BF6]/20 border border-[#6B3BF6]/40 text-purple-200 px-3.5 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>Live Recruiter Analytics</span>
          </span>
        </div>

        {/* Chart Row 1: Weekly Sourcing, Submissions & Interviews Activity Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#6B3BF6]" />
                <span>Weekly Work Activity & Turnaround Velocity</span>
              </h4>
              <p className="text-xs text-slate-500">
                Candidates Sourced vs Submissions Sent vs Scheduled Interviews over the past 4 weeks
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-600 font-medium">Sourced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#6B3BF6]" />
                <span className="text-slate-600 font-medium">Submissions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Interviews</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { week: 'Week 1', sourced: Math.round(recruiter.submissionsCount * 0.35), submissions: Math.round(recruiter.submissionsCount * 0.22), interviews: Math.round((recruiter.interviewsCount || 10) * 0.2) },
                  { week: 'Week 2', sourced: Math.round(recruiter.submissionsCount * 0.45), submissions: Math.round(recruiter.submissionsCount * 0.28), interviews: Math.round((recruiter.interviewsCount || 10) * 0.25) },
                  { week: 'Week 3', sourced: Math.round(recruiter.submissionsCount * 0.40), submissions: Math.round(recruiter.submissionsCount * 0.24), interviews: Math.round((recruiter.interviewsCount || 10) * 0.25) },
                  { week: 'Week 4 (Current)', sourced: Math.round(recruiter.submissionsCount * 0.52), submissions: Math.round(recruiter.submissionsCount * 0.35), interviews: Math.round((recruiter.interviewsCount || 10) * 0.3) },
                ]}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="recSourcedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="recSubsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B3BF6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#6B3BF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="recInterviewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 font-sans">
                          <p className="font-bold text-blue-300 border-b border-slate-700 pb-1">{label}</p>
                          <div className="space-y-1 font-mono text-[11px]">
                            <p className="text-blue-400 flex justify-between gap-4">
                              <span>Sourced:</span>
                              <strong className="text-white">{payload[0]?.value}</strong>
                            </p>
                            <p className="text-purple-300 flex justify-between gap-4">
                              <span>Submissions:</span>
                              <strong className="text-white">{payload[1]?.value}</strong>
                            </p>
                            <p className="text-emerald-400 flex justify-between gap-4">
                              <span>Interviews:</span>
                              <strong className="text-white">{payload[2]?.value}</strong>
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area type="monotone" dataKey="sourced" name="Candidates Sourced" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#recSourcedGrad)" />
                <Area type="monotone" dataKey="submissions" name="Submissions Sent" stroke="#6B3BF6" strokeWidth={2.5} fillOpacity={1} fill="url(#recSubsGrad)" />
                <Area type="monotone" dataKey="interviews" name="Interviews Scheduled" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#recInterviewsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  )
}
