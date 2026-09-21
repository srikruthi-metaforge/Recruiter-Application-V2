import { Users, ShieldCheck, Send, UserCheck } from 'lucide-react'

interface Props {
  totalLeadsCount: number
  totalMembersCount: number
  totalTeamSubmissions: number
}

export function TeamsKpiCards({ totalLeadsCount, totalMembersCount, totalTeamSubmissions }: Props) {
  return (
    <>
      {/* 2. SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Team Leads */}
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider">Total Team Leads</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalLeadsCount} Leads</p>
          <span className="text-[10px] text-purple-700 font-bold">Harish, Tom, Nina, Ray</span>
        </div>

        {/* Total Team Members */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">Total Team Members</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalMembersCount} Recruiters</p>
          <span className="text-[10px] text-blue-700 font-bold">Assigned to primary clients</span>
        </div>

        {/* Average Team Size */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">Avg Team Size</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">3 Members / Lead</p>
          <span className="text-[10px] text-emerald-700 font-bold">Strict 1 Team = 1 Client Rule</span>
        </div>

        {/* Total Sourcing Output */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 shadow-2xs border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">Total Sourced Submissions</span>
            <Send className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-3xl font-extrabold text-white tabular-nums">{totalTeamSubmissions}</p>
          <span className="text-[10px] text-slate-300 font-medium">Combined Lead + Recruiter Output</span>
        </div>
      </div>
    </>
  )
}
