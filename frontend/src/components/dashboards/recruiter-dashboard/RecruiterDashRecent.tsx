import React from 'react'
import { Send, MessageSquare, ClipboardList } from 'lucide-react'
import { RequirementDetailOverview } from '../../pages/RequirementDetailOverview'
import { CandidateRepositoryPage } from '../../pages/CandidateRepositoryPage'
import { SubmissionsPage } from '../../pages/SubmissionsPage'
import { InterviewTrackingPage } from '../../pages/InterviewTrackingPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { PageHeader } from '../../layout/PageHeader'
import { RecruiterDashboardVm } from './useRecruiterDashboard'

export function RecruiterDashRecent({ vm }: { vm: RecruiterDashboardVm }) {
  const {
    submissions,
    interviews,
    requirements,
    currentUserName,
    onOpenCandidateDetail,
    toastMsg,
    userActivityLogs,
    key,
    found,
  } = vm
  return (
    <>
      {/* My Recent Submissions Section (Kept at bottom of My Work page) */}
      <section className="space-y-4 pt-4 border-t border-slate-200/60">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Recent Submissions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your latest candidate activity across requirements.
          </p>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    CANDIDATE NAME
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    RECRUITER
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    ROLE
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    CLIENT
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    SUBMITTED ON
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map(sub => (
                    <tr
                      key={sub.id}
                      onClick={() => onOpenCandidateDetail?.(sub)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{sub.candidate}</td>
                      <td className="px-4 py-3.5 text-slate-600">{sub.recruiter}</td>
                      <td className="px-4 py-3.5 text-slate-600">{sub.req}</td>
                      <td className="px-4 py-3.5 text-slate-600">{sub.client}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                            sub.stage.toLowerCase().includes('reject')
                              ? 'bg-red-50 text-red-600 border-red-200/80'
                              : 'bg-blue-50 text-blue-700 border-blue-200/60'
                          }`}
                        >
                          {sub.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{sub.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No submissions found for your user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Actions and updates performed in your recruiter account.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60 shadow-2xs">
            {userActivityLogs.length} Action{userActivityLogs.length === 1 ? '' : 's'} Logged
          </span>
        </div>

        {userActivityLogs.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {userActivityLogs.slice(0, 10).map((log, idx) => {
              const isSubmission = log.category === 'Submissions' || log.action.toLowerCase().includes('submit')
              const isInterview = log.category === 'Interviews' || log.action.toLowerCase().includes('interview')

              let iconBg = 'bg-blue-50 text-blue-600 border-blue-200'
              let IconComp = ClipboardList

              if (isSubmission) {
                iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-200'
                IconComp = Send
              } else if (isInterview) {
                iconBg = 'bg-purple-50 text-purple-600 border-purple-200'
                IconComp = MessageSquare
              }

              return (
                <div key={log.id || idx} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors align-middle">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 leading-snug">
                          {log.action}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {log.category || 'Activity'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-normal line-clamp-1">
                        {log.details || `Performed by ${log.userName || currentUserName || 'Recruiter'}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                      {log.timestamp}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${log.status === 'Warning' ? 'bg-amber-400' : 'bg-emerald-500'}`} title={log.status} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs py-10 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No recent activity recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Actions you perform across requirements, candidates, and interviews will show up here.</p>
          </div>
        )}
      </section>

      {/* Toast Notification Container */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold animate-in fade-in duration-200">
          {toastMsg}
        </div>
        )}
    </>
  )
}
