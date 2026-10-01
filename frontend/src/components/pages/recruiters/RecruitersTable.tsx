import { ShieldCheck, Shield, Lock, Building, Building2, Clock } from 'lucide-react'
import { RecruiterOverviewItem } from './types'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { RecruiterStatusBadge } from './RecruiterStatusBadge'
import { getRecruiterScreenTime, formatDurationShort, canViewScreenTime } from '../../../utils/screenTimeTracker'
import { DEMO_ACCOUNTS } from '../../../data/mockData'
import { Role } from '../../../types'

interface Props {
  paginatedRecruiters: RecruiterOverviewItem[]
  filteredRecruiters: RecruiterOverviewItem[]
  role: Role
  currentPage: number
  totalPages: number
  pageSize: number
  setCurrentPage: (n: number) => void
  setPageSize?: (n: number) => void
  onAdjustClient: (r: RecruiterOverviewItem) => void
}
export function RecruitersTable(p: Props) {
  const { paginatedRecruiters, filteredRecruiters, role, currentPage, totalPages, pageSize, setCurrentPage, setPageSize, onAdjustClient } = p
  const getStatusBadge = (status: RecruiterOverviewItem['performanceStatus']) => <RecruiterStatusBadge status={status} />
  return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">RECRUITER NAME</th>
                {role !== 'recruiter' && (
                  <th className="py-3.5 px-4 text-center">SCREEN TIME (RECORDED)</th>
                )}
                <th className="py-3.5 px-4">TEAM LEAD</th>
                <th className="py-3.5 px-4">ASSIGNED CLIENT(S)</th>
                <th className="py-3.5 px-4 text-center">TOTAL REQUIREMENTS</th>
                <th className="py-3.5 px-4 text-center">TOTAL SUBMISSIONS</th>
                <th className="py-3.5 px-4 text-center">TAT (TURNAROUND TIME)</th>
                <th className="py-3.5 px-4 text-center">INTERVIEWS</th>
                <th className="py-3.5 px-4">PERFORMANCE STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {paginatedRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold text-sm">
                    No recruiters match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecruiters.map((recruiter, idx) => (
                  <tr key={recruiter.id} className="hover:bg-purple-50/40 transition-colors">
                    {/* # */}
                    <td className="py-4 px-4 font-extrabold text-slate-400 text-xs">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* RECRUITER NAME */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                          {recruiter.avatar}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{recruiter.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{recruiter.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* SCREEN TIME (RECORDED) */}
                    {role !== 'recruiter' && (
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {(() => {
                          const currentUser = DEMO_ACCOUNTS[role] || { name: 'Current User' }
                          const isAllowed = canViewScreenTime(role, currentUser.name, recruiter.name, recruiter.teamLead)
                          if (!isAllowed) {
                            return (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold"
                                title="Screen time privacy: Only visible to self, team lead, and admin"
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>Private</span>
                              </span>
                            )
                          }
                          const recST = getRecruiterScreenTime(recruiter.name)
                          return (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-[#6B3BF6] border border-purple-200 text-xs font-black">
                                <Clock className="w-3 h-3 text-[#6B3BF6]" />
                                <span>{formatDurationShort(recST.activeSeconds)}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${recST.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Recorded Usage</span>
                            </div>
                          )
                        })()}
                      </td>
                    )}

                    {/* TEAM LEAD */}
                    <td className="py-4 px-4 whitespace-nowrap font-extrabold text-slate-800">
                      <div className="flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{recruiter.teamLead}</span>
                      </div>
                    </td>

                    {/* ASSIGNED CLIENT(S) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {recruiter.clientNames.map(client => (
                          <span
                            key={client}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200 flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-purple-600" />
                            <span>{client}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* TOTAL REQUIREMENTS */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 tabular-nums">
                        {recruiter.totalRequirements} Reqs
                      </span>
                    </td>

                    {/* TOTAL SUBMISSIONS */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-900 border border-purple-200 tabular-nums">
                        {recruiter.totalSubmissions} Submissions
                      </span>
                    </td>

                    {/* TAT (TURNAROUND TIME) */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 tabular-nums">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{recruiter.tatDays} Days TAT</span>
                      </div>
                    </td>

                    {/* INTERVIEWS */}
                    <td className="py-4 px-4 whitespace-nowrap text-center font-extrabold text-slate-800 tabular-nums text-xs">
                      {recruiter.totalInterviews} Interviews
                    </td>

                    {/* PERFORMANCE STATUS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(recruiter.performanceStatus)}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          onAdjustClient(recruiter)
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] font-extrabold text-xs border border-purple-200 shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-98"
                        title="Adjust Assigned Client for Recruiter"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#6B3BF6]" />
                        <span>Adjust Client</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRecruiters.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
  )
}
