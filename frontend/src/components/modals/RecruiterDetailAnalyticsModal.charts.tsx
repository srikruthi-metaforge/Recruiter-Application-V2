import React from 'react'
import { BarChart3, TrendingUp } from 'lucide-react'
import { RecruiterDetailData } from './RecruiterDetailAnalyticsModal.types'

export function RecruiterDetailAnalyticsCharts({ recruiter }: { recruiter: RecruiterDetailData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-[#6B3BF6]" />
            <span>Requirements Worked vs Non-Worked</span>
          </h4>
          <span className="text-[10px] font-bold text-slate-500">
            {Math.round((recruiter.workedReqs / (recruiter.requirementsCount || 1)) * 100)}% Activity
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B3BF6]" />
                <span>Worked Requirements ({recruiter.workedReqs})</span>
              </span>
              <span className="tabular-nums font-bold">
                {Math.round((recruiter.workedReqs / (recruiter.requirementsCount || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6B3BF6] rounded-full"
                style={{
                  width: `${(recruiter.workedReqs / (recruiter.requirementsCount || 1)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Non-Worked Requirements ({recruiter.nonWorkedReqs})</span>
              </span>
              <span className="tabular-nums font-bold text-amber-700">
                {Math.round((recruiter.nonWorkedReqs / (recruiter.requirementsCount || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{
                  width: `${(recruiter.nonWorkedReqs / (recruiter.requirementsCount || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Submissions & Shortlist Breakdown</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-700">
            {recruiter.shortlistedCount} Shortlisted
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span>Total Submissions ({recruiter.submissionsCount})</span>
              </span>
              <span className="tabular-nums font-bold">100%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full w-full" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Shortlisted / Approved ({recruiter.shortlistedCount})</span>
              </span>
              <span className="tabular-nums font-bold text-emerald-700">
                {Math.round((recruiter.shortlistedCount / (recruiter.submissionsCount || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${(recruiter.shortlistedCount / (recruiter.submissionsCount || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
