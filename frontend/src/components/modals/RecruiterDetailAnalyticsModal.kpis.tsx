import React from 'react'
import { Award } from 'lucide-react'
import { RecruiterDetailData } from './RecruiterDetailAnalyticsModal.types'

export function RecruiterDetailAnalyticsKpis({ recruiter }: { recruiter: RecruiterDetailData }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-3.5 space-y-1">
        <span className="text-[10px] font-bold text-[#5B51D8] uppercase tracking-wider block">
          Total Requirements
        </span>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {recruiter.requirementsCount}
          </span>
          <span className="text-[10px] text-slate-500">Assigned</span>
        </div>
        <div className="text-[10px] font-semibold text-blue-700 flex justify-between">
          <span>Worked: {recruiter.workedReqs}</span>
          <span className="text-amber-700">Non-worked: {recruiter.nonWorkedReqs}</span>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 space-y-1">
        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
          Total Submissions
        </span>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {recruiter.submissionsCount}
          </span>
          <span className="text-[10px] text-purple-600 font-bold">Lifetime</span>
        </div>
        <div className="text-[10px] font-semibold text-purple-700 flex justify-between">
          <span>Shortlisted: {recruiter.shortlistedCount}</span>
          <span className="text-slate-500">Pending: {recruiter.noSubmissionsCount}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 space-y-1">
        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
          Total Interviews
        </span>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {recruiter.interviewsCount || '—'}
          </span>
          <span className="text-[10px] text-blue-600">Conducted</span>
        </div>
        <div className="text-[10px] font-semibold text-blue-700">
          Conversion: {recruiter.conversionRate}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
          Successful Hires
        </span>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {recruiter.hiresCount}
          </span>
          <Award className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-[10px] font-semibold text-emerald-700">
          Weekly Progress: {recruiter.weeklyProgressPct}%
        </div>
      </div>
    </div>
  )
}
