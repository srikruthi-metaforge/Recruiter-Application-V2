interface Props { teamMembersCount: number }
export function MyTeamKpis({ teamMembersCount }: Props) {
  const teamMembers = { length: teamMembersCount }
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Team Members</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{teamMembers.length}</p>
          <span className="text-[10px] text-purple-700 font-semibold">6 Active Recruiters</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Assigned Clients</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">6 Accounts</p>
          <span className="text-[10px] text-blue-700 font-semibold">Accenture, Goldman, LTTS...</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Active Requirements</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">35 Job Demands</p>
          <span className="text-[10px] text-amber-700 font-semibold">In Sourcing Phase</span>
        </div>

        <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-[#5B51D8] uppercase tracking-wider block">Total Submissions</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">306 Submissions</p>
          <span className="text-[10px] text-[#5B51D8] font-bold">Pod Overall Total</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Interview Pipeline</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">75 Scheduled</p>
          <span className="text-[10px] text-emerald-700 font-bold">27 Final Placements</span>
        </div>
      </div>
  )
}
