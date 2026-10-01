import React, { useState, useEffect } from 'react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { Building2, Target, Server } from 'lucide-react'
import { Interview, Recruiter, Requirement, Lead } from '../../types'
import { KpiGrid, Panel, ActivityFeed } from '../wireframe/WireframeKit'
import {
  SYSTEM_LATENCY_TREND,
  CLIENT_REQUIREMENTS_DATA,
  RECRUITER_PERFORM_DATA,
  CustomDevTooltip,
} from './DevTeamDashboard.data'
import { analyticsService } from '../../services/workspace.service'

export function DevTeamDashboardOverview({
  openPositions,
  requirements,
  recruiters,
  leads,
  interviews,
}: {
  openPositions: number
  requirements: Requirement[]
  recruiters: Recruiter[]
  leads: Lead[]
  interviews: Interview[]
}) {
  const [liveKpis, setLiveKpis] = useState<any>(null)
  const [clientStats, setClientStats] = useState<any>(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([
      analyticsService.dashboard().catch(() => null),
      analyticsService.clients().catch(() => null),
    ]).then(([dashRes, clientRes]) => {
      if (isMounted) {
        if (dashRes?.kpis) setLiveKpis(dashRes.kpis)
        if (clientRes) setClientStats(clientRes)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const kpis = liveKpis || {}
  const totalClients = clientStats?.total ?? 14
  const totalSubs = kpis.totalSubmissions ?? 42
  const activeReqs = kpis.activeRequirements ?? requirements.length
  const totalInts = kpis.totalInterviews ?? interviews.length

  return (
    <>
      <KpiGrid
        columns={6}
        items={[
          { label: 'System Status', value: 'Operational', highlight: true, sub: '99.98% Uptime' },
          { label: 'Avg Latency', value: '138ms', sub: 'Peak load 180ms' },
          { label: 'Total Clients', value: totalClients },
          { label: 'Active Reqs', value: activeReqs, highlight: true },
          { label: 'Open Positions', value: kpis.totalOpenings || openPositions },
          { label: 'Total Recruiters', value: recruiters.length },
          { label: 'Active Leads', value: leads.length },
          { label: 'Total Submissions', value: totalSubs },
          { label: 'Interviews Active', value: totalInts },
          { label: 'Database Size', value: `${kpis.totalCandidates || 12} Profiles`, sub: 'Resumes & Candidates' },
          { label: 'AI Worker Engine', value: 'Online', sub: 'Active Real-time' },
          { label: 'Security Health', value: 'Grade A+', highlight: true },
        ]}
      />


      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">API & System Load</h3>
                <p className="text-[11px] text-slate-500">Response time vs request throughput</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[10px] font-extrabold border border-violet-200">
              Realtime
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SYSTEM_LATENCY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDevResponse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomDevTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }} />
                <Area type="monotone" dataKey="ResponseTime" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDevResponse)" />
                <Area type="monotone" dataKey="SystemLoad" stroke="#2563EB" strokeWidth={2} fillOpacity={0.1} fill="#2563EB" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Client Requirements</h3>
                <p className="text-[11px] text-slate-500">Active positions by client entity</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold border border-blue-200">
              Enterprise
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CLIENT_REQUIREMENTS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="client" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomDevTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }} />
                <Bar dataKey="Requirements" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Openings" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Recruiter Output</h3>
                <p className="text-[11px] text-slate-500">Submissions vs quota target</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold border border-emerald-200">
              Performance
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={RECRUITER_PERFORM_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomDevTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '8px' }} />
                <Bar dataKey="Submissions" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Target" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: '#EF4444' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="System Diagnostics & Environment Logs">
          <ActivityFeed
            items={[
              { time: '10:04', user: 'Dev System', action: 'database index maintenance completed successfully' },
              { time: '09:45', user: 'Marcus Chen', action: 'submitted candidate Alex Turner to REQ-001' },
              { time: '09:12', user: 'AI Parser', action: 'processed 42 new candidate resumes with 99.2% accuracy' },
              { time: '08:30', user: 'System Cron', action: 'executed daily metrics aggregation job' },
            ]}
          />
        </Panel>

        <Panel title="Core Microservices Status">
          <div className="space-y-2 text-sm">
            {[
              ['Authentication & AuthZ Engine', 'Operational', '99.99%'],
              ['AI Candidate Ranking Worker', 'Operational', '99.95%'],
              ['Email & SMTP Gateway', 'Operational', '99.90%'],
              ['Resume Parsing Microservice', 'Operational', '99.85%'],
              ['LinkedIn Recruiter Sync API', 'Degraded Sync', '97.40%'],
            ].map(([service, status, uptime]) => (
              <div key={service} className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800">{service}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-mono">{uptime}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      status === 'Operational'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
