'use client'

import React, { useMemo, useState } from 'react'
import {
  BarChart3,
  Briefcase,
  Users,
  Send,
  Calendar,
  Building2,
  Award,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Role } from '../../../types'
import { PageHeader } from '../../layout/PageHeader'
import { ANALYTICS_COLORS, recordToChartData } from './analytics.charts'
import { useAnalyticsDashboard } from './useAnalyticsDashboard'

export interface AnalyticsDashboardPageProps {
  role: Role
  onNavigateAway?: () => void
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold tracking-tight text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="h-[280px] w-full">{children}</div>
    </div>
  )
}

export function AnalyticsDashboardPage({ role, onNavigateAway }: AnalyticsDashboardPageProps) {
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin'
  const [range, setRange] = useState<'all' | '90d' | '180d'>('all')

  const filters = useMemo(() => {
    if (range === 'all') return undefined
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (range === '90d' ? 90 : 180))
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    }
  }, [range])

  const { data, loading, error, reload } = useAnalyticsDashboard(isSuperAdmin, filters)

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6 pb-12 font-sans">
        <PageHeader title="Analytics" subtitle="Restricted module" />
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-16 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Super Admin only</h2>
          <p className="max-w-md text-sm text-slate-600">
            The Analytics Dashboard is available only to Super Admin in this release.
          </p>
          {onNavigateAway ? (
            <button
              type="button"
              onClick={onNavigateAway}
              className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Go back
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  const kpis = data.dashboard?.kpis || {}
  const stageData = recordToChartData(data.dashboard?.submissionsByStage || data.submissions?.byStage)
  const interviewData = recordToChartData(data.dashboard?.interviewsByStatus || data.interviews?.byStatus)
  const reqStatusData = recordToChartData(data.requirements?.byStatus)
  const clientReqData = (data.requirements?.byClient || []).map((c: any) => ({
    name: c.clientName || 'N/A',
    requirements: c.count || 0,
    openings: c.openings || 0,
  }))
  const recruiterData = (data.recruiters || []).slice(0, 10).map((r: any) => ({
    name: (r.name || 'Unknown').split(' ')[0],
    submissions: r.submissionsCount || 0,
    placements: r.placementsCount || 0,
  }))
  const trendData = data.trends?.months || []

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Analytics Dashboard"
          subtitle="Company-wide recruitment metrics for Super Admin"
        />
        <div className="flex flex-wrap items-center gap-2">
          {(['all', '90d', '180d'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                range === key
                  ? 'bg-[#6B3BF6] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {key === 'all' ? 'All time' : key === '90d' ? 'Last 90 days' : 'Last 180 days'}
            </button>
          ))}
          <button
            type="button"
            onClick={() => reload()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-4">
        <KpiCard label="Requirements" value={kpis.totalRequirements ?? '—'} icon={Briefcase} accent="bg-violet-50 text-violet-600" />
        <KpiCard label="Active Reqs" value={kpis.activeRequirements ?? '—'} icon={BarChart3} accent="bg-blue-50 text-blue-600" />
        <KpiCard label="Candidates" value={kpis.totalCandidates ?? '—'} icon={Users} accent="bg-cyan-50 text-cyan-600" />
        <KpiCard label="Submissions" value={kpis.totalSubmissions ?? '—'} icon={Send} accent="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Interviews" value={kpis.totalInterviews ?? '—'} icon={Calendar} accent="bg-amber-50 text-amber-600" />
        <KpiCard label="Clients" value={kpis.totalClients ?? '—'} icon={Building2} accent="bg-indigo-50 text-indigo-600" />
        <KpiCard label="Placed" value={kpis.totalPlaced ?? '—'} icon={Award} accent="bg-rose-50 text-rose-600" />
        <KpiCard label="Avg Match" value={kpis.avgMatchScore != null ? `${kpis.avgMatchScore}%` : '—'} icon={BarChart3} accent="bg-fuchsia-50 text-fuchsia-600" />
      </div>

      {loading && !data.dashboard ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
          Loading company analytics…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ChartCard title="Monthly volume" subtitle="Requirements, submissions, and interviews">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requirements" name="Requirements" stroke={ANALYTICS_COLORS[0]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="submissions" name="Submissions" stroke={ANALYTICS_COLORS[1]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="interviews" name="Interviews" stroke={ANALYTICS_COLORS[2]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Pipeline by stage" subtitle="Company-wide submission funnel">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>
                  {stageData.map((_, i) => (
                    <Cell key={i} fill={ANALYTICS_COLORS[i % ANALYTICS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Requirements by status" subtitle="Open vs closed company demand">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reqStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {reqStatusData.map((_, i) => (
                    <Cell key={i} fill={ANALYTICS_COLORS[i % ANALYTICS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Interview outcomes" subtitle="Status distribution across all interviews">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={interviewData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {interviewData.map((_, i) => (
                    <Cell key={i} fill={ANALYTICS_COLORS[(i + 2) % ANALYTICS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top clients by requirements" subtitle="Highest demand client accounts">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientReqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="requirements" name="Requirements" fill={ANALYTICS_COLORS[0]} radius={[6, 6, 0, 0]} />
                <Bar dataKey="openings" name="Openings" fill={ANALYTICS_COLORS[1]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Recruiter performance" subtitle="Top recruiters by submissions & placements">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recruiterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="submissions" name="Submissions" fill={ANALYTICS_COLORS[3]} radius={[6, 6, 0, 0]} />
                <Bar dataKey="placements" name="Placements" fill={ANALYTICS_COLORS[5]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  )
}
