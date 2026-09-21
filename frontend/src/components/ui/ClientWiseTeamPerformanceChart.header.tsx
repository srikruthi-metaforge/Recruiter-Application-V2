import React from 'react'
import { Building2, Layers, Filter } from 'lucide-react'
import { CLIENT_TEAM_PERFORMANCE_LIST } from './ClientWiseTeamPerformanceChart.data'
import { Role } from '../../types'

export function ClientWiseTeamHeader({
  role,
  leadChartView,
  setLeadChartView,
  selectedClient,
  setSelectedClient,
}: {
  role: Role
  leadChartView: 'individual' | 'team'
  setLeadChartView: (value: 'individual' | 'team') => void
  selectedClient: string
  setSelectedClient: (value: string) => void
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#6B3BF6]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>
                {role === 'lead'
                  ? leadChartView === 'individual'
                    ? 'Lead Individual Client Performance Overview'
                    : 'Team Members Client Performance & Pod Distribution'
                  : 'Client Performance & Pod Distribution Overview'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#6B3BF6] border border-purple-200">
                Visual Analytics
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Sourcing velocity, client distribution, and candidate conversion for Harish Gadipally'
                  : 'Team pod sourcing velocity, team distribution, and candidate conversion per client account'
                : 'Sourcing velocity, client distribution, and candidate conversion per client account'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
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

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#6B3BF6]" />
            <span>Select Client Account:</span>
          </label>
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer shadow-2xs min-w-44"
          >
            <option value="All Clients">All Clients (Executive View)</option>
            {CLIENT_TEAM_PERFORMANCE_LIST.map(c => (
              <option key={c.clientName} value={c.clientName}>
                {c.clientName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export function ClientWiseTeamKpis({
  totalReqs,
  totalSubs,
  totalInterviews,
  totalHires,
}: {
  totalReqs: number
  totalSubs: number
  totalInterviews: number
  totalHires: number
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-1.5 shadow-2xs">
        <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
          Total Requirements
        </span>
        <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalReqs}</p>
        <span className="text-xs font-semibold text-blue-700">Client Reqs Received</span>
      </div>

      <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-5 space-y-1.5 shadow-2xs">
        <span className="text-[11px] font-bold text-[#5B51D8] uppercase tracking-wider block">
          Total Submissions
        </span>
        <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalSubs}</p>
        <span className="text-xs font-semibold text-[#5B51D8]">Candidates Submitted</span>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-1.5 shadow-2xs">
        <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
          Total Interviews
        </span>
        <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalInterviews}</p>
        <span className="text-xs font-semibold text-purple-700">Scheduled Sessions</span>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-1.5 shadow-2xs">
        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
          Successful Hires
        </span>
        <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalHires}</p>
        <span className="text-xs font-semibold text-emerald-700">Candidates Placed</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-1.5 shadow-2xs">
        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
          Avg Turnaround (TAT)
        </span>
        <p className="text-3xl font-extrabold text-slate-900 tabular-nums">1.9 Days</p>
        <span className="text-xs font-semibold text-amber-700">Speed to Submit</span>
      </div>
    </div>
  )
}
