import { Users, User, Crown } from 'lucide-react'

export function MyTeamHeader() {
  return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-[#6B3BF6]" />
              <span>My Team Overview</span>
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 inline-flex items-center gap-1.5 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Engineering Pod</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recruiter team member list, assigned client accounts, active requirement workloads, and sourcing throughput.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs font-extrabold text-[#6B3BF6]">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Team Lead: Harish Gadipally</span>
          </div>
        </div>
      </div>
  )
}
