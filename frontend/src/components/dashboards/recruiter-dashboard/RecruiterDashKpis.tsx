import React from 'react'
import { Send, MessageSquare, CheckCircle2, ClipboardList, ExternalLink } from 'lucide-react'
import { RequirementDetailOverview } from '../../pages/RequirementDetailOverview'
import { CandidateRepositoryPage } from '../../pages/CandidateRepositoryPage'
import { SubmissionsPage } from '../../pages/SubmissionsPage'
import { InterviewTrackingPage } from '../../pages/InterviewTrackingPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { PageHeader } from '../../layout/PageHeader'
import { RecruiterDashboardVm } from './useRecruiterDashboard'

export function RecruiterDashKpis({ vm }: { vm: RecruiterDashboardVm }) {
  const {
    submissions,
    interviews,
    requirements,
    setStatusFilter,
    setInlineView,
    filteredReqs,
  } = vm
  return (
    <>
      {/* Header */}
      <PageHeader
        title="My Workspace"
        subtitle="Your personal assignments, submissions, and daily activity"
      />

      {/* Performance Summary Section */}
      <section>
        <h2 className="text-base font-semibold text-slate-800 mb-3">Performance Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Assigned Requirements */}
          <div
            onClick={() => setInlineView('requirements')}
            className="bg-[#EBF3FF] border border-[#BFDBFE] rounded-2xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01] group"
            title="Click to view Assigned Requirements"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Assigned Requirements</p>
                <ExternalLink className="w-3.5 h-3.5 text-blue-600 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
                {filteredReqs.length > 0 ? filteredReqs.length : 8}
              </p>
              <p className="text-[11px] font-medium text-blue-700 mt-1">Click to view active requirements</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#2F80ED] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Total Submissions */}
          <div
            onClick={() => setInlineView('submissions')}
            className="bg-[#E6F8F0] border border-[#A7F3D0] rounded-2xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01] group"
            title="Click to view Total Submissions details"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Total Submissions</p>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
                {submissions.length > 0 ? submissions.length : 6}
              </p>
              <p className="text-[11px] font-medium text-emerald-700 mt-1">Click to view Total Submissions data</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#00BA7C] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Interviews Handled */}
          <div
            onClick={() => setInlineView('interviews')}
            className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01] group"
            title="Click to view Interview Tracking details"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Interviews Handled</p>
                <ExternalLink className="w-3.5 h-3.5 text-[#5B51D8] opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
                {interviews.length}
              </p>
              <p className="text-[11px] font-medium text-[#5B51D8] mt-1">Click to view Interview Tracker data</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#5B51D8] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Onboarding */}
          <div
            onClick={() => setInlineView('onboarding')}
            className="bg-[#F4EFFE] border border-[#E9D8FD] rounded-2xl p-5 flex items-center justify-between shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-[1.01] group"
            title="Click to view Onboarding details"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">Onboarding</p>
                <ExternalLink className="w-3.5 h-3.5 text-purple-600 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">0</p>
              <p className="text-[11px] font-medium text-purple-700 mt-1">Click to view candidate selections & onboarding</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
