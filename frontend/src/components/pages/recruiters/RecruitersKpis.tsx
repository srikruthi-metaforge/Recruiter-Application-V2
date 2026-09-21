import { Users, Send, User, Clock, FileText } from 'lucide-react'

interface Props { recruitersCount: number; avgTat: string; totalReqs: number; totalSubs: number }
export function RecruitersKpis({ recruitersCount, avgTat, totalReqs, totalSubs }: Props) {
  const totalRecruiters = recruitersCount
  const avgTatDays = avgTat
  const totalReqsHandled = totalReqs
  const totalSubmissionsSourced = totalSubs
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Recruiters */}
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider">Total Active Recruiters</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalRecruiters} Recruiters</p>
          <span className="text-[10px] text-purple-700 font-bold">Across 4 Dedicated Client Teams</span>
        </div>

        {/* Avg SLA Turnaround Time (TAT) */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">Average SLA TAT</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{avgTatDays} Days TAT</p>
          <span className="text-[10px] text-emerald-700 font-bold">Fastest Turnaround Time: 1.5 Days</span>
        </div>

        {/* Total Requirements */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">Requirements Handled</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalReqsHandled} Reqs</p>
          <span className="text-[10px] text-blue-700 font-bold">Assigned by Team Leads</span>
        </div>

        {/* Total Sourced Submissions */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 shadow-2xs border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">Total Submissions Sourced</span>
            <Send className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-3xl font-extrabold text-white tabular-nums">{totalSubmissionsSourced}</p>
          <span className="text-[10px] text-slate-300 font-medium">Candidate profiles submitted to clients</span>
        </div>
      </div>
  )
}
