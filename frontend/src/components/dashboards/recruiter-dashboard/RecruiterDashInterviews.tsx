import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { InterviewTrackingPage } from '../../pages/InterviewTrackingPage'
import { RecruiterDashboardVm } from './useRecruiterDashboard'

export function RecruiterDashInterviews({ vm }: { vm: RecruiterDashboardVm }) {
  const {
    interviews,
    onOpenFeedbackModal,
    setInlineView,
  } = vm
  return (
    <div className="w-full pb-12 font-sans animate-in fade-in duration-200 space-y-4">
      <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setInlineView(null)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
            <span>Back to My Workspace</span>
          </button>
          <span className="text-xs font-bold text-slate-300">|</span>
          <span className="text-xs font-bold text-slate-700">Interview Tracking Overview</span>
        </div>
      </div>

      <InterviewTrackingPage
        role="recruiter"
        interviews={interviews}
        onOpenFeedbackModal={onOpenFeedbackModal}
      />
    </div>
  )
}
