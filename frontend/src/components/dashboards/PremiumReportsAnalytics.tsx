import React, { useState } from 'react'
import { Search, FileSpreadsheet } from 'lucide-react'
import { Recruiter, Role } from '../../types'
import { ProgressBar } from '../ui/ProgressBar'
import { brand, roleTheme } from '../../theme'

interface PremiumReportsAnalyticsProps {
  recruiters: Recruiter[]
  role?: Role
}

type StatusLabel = 'On Track' | 'Warning' | 'Critical'

function getStatus(r: Recruiter): StatusLabel {
  if (r.weeklyProgress >= 85) return 'On Track'
  if (r.weeklyProgress >= 60) return 'Warning'
  return 'Critical'
}

const STATUS_STYLE: Record<StatusLabel, { bg: string; text: string }> = {
  'On Track': { bg: '#ECFDF5', text: '#059669' },
  Warning: { bg: '#FFFBEB', text: '#D97706' },
  Critical: { bg: '#FEF2F2', text: '#DC2626' },
}

const KPI_DATA = [
  { title: 'On-Track Today', value: '94%' },
  { title: 'Submissions Today', value: '42' },
  { title: 'Weekly Progress', value: '88%' },
  { title: 'Conversion Rate', value: '24.5%' },
  { title: 'Total Submissions', value: '1,248' },
  { title: 'Active Recruiters', value: '18' },
]

export function PremiumReportsAnalytics({ recruiters, role = 'admin' }: PremiumReportsAnalyticsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | StatusLabel>('All')
  const accent = roleTheme[role].accent

  const filtered = recruiters.filter(r => {
    const q = searchQuery.toLowerCase()
    const matchSearch = r.name.toLowerCase().includes(q) || r.lead.toLowerCase().includes(q)
    const status = getStatus(r)
    const matchStatus = statusFilter === 'All' || status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm" style={{ color: brand.textSecondary }}>
          Performance overview for your team
        </p>
        <button
          className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 self-start"
          style={{ background: accent }}
        >
          <FileSpreadsheet className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {KPI_DATA.map((kpi, i) => {
          const themes = [
            { bg: '#F4EFFE', borderColor: '#E9D8FD', iconBg: '#8B5CF6' },
            { bg: '#E6F8F0', borderColor: '#A7F3D0', iconBg: '#00BA7C' },
            { bg: '#FDE8EC', borderColor: '#FECDD3', iconBg: '#FF3B68' },
            { bg: '#EBF3FF', borderColor: '#BFDBFE', iconBg: '#2F80ED' },
            { bg: '#FFF8E7', borderColor: '#FDE68A', iconBg: '#F2994A' },
            { bg: '#EEF2FF', borderColor: '#C7D2FE', iconBg: '#5B51D8' },
          ]
          const theme = themes[i % themes.length]

          return (
            <div
              key={i}
              className="rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md"
              style={{ background: theme.bg, borderColor: theme.borderColor }}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div>
                  <p className="text-xs font-semibold text-slate-700 truncate">{kpi.title}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{kpi.value}</p>
                </div>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: theme.iconBg }}
                >
                  ✓
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="rounded-lg border p-4 flex flex-col sm:flex-row gap-3"
        style={{ background: brand.surface, borderColor: brand.border }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: brand.textMuted }} />
          <input
            type="text"
            placeholder="Search recruiters…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: brand.border, color: brand.text }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: brand.border, color: brand.text, background: brand.surface }}
        >
          <option value="All">All statuses</option>
          <option value="On Track">On Track</option>
          <option value="Warning">Warning</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ background: brand.surface, borderColor: brand.border }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: brand.borderLight }}>
          <h3 className="text-sm font-semibold" style={{ color: brand.text }}>
            Recruiter Performance ({filtered.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: brand.background, color: brand.textMuted }}>
                <th className="text-left py-2.5 px-4 text-xs font-medium">Recruiter</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium">Submissions</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium">Interviews</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium w-36">Progress</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium">Conversion</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const status = getStatus(r)
                const st = STATUS_STYLE[status]
                const conversion = Math.round((r.placements / (r.submissions || 1)) * 1000) / 10
                return (
                  <tr key={r.id} className="border-t" style={{ borderColor: brand.borderLight }}>
                    <td className="py-3 px-4">
                      <p className="font-medium" style={{ color: brand.text }}>{r.name}</p>
                      <p className="text-xs" style={{ color: brand.textMuted }}>{r.lead}</p>
                    </td>
                    <td className="py-3 px-4 tabular-nums" style={{ color: brand.text }}>{r.submissions}</td>
                    <td className="py-3 px-4 tabular-nums" style={{ color: brand.text }}>{r.interviews}</td>
                    <td className="py-3 px-4">
                      <ProgressBar value={r.weeklyProgress} max={100} color={accent} height="h-1.5" animate={false} />
                    </td>
                    <td className="py-3 px-4 tabular-nums" style={{ color: brand.text }}>{conversion}%</td>
                    <td className="py-3 px-4">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ background: st.bg, color: st.text }}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
