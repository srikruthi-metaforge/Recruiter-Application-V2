import React, { useState } from 'react'
import { X } from 'lucide-react'
import { RecruiterDetailData } from './RecruiterDetailAnalyticsModal.types'
import { RecruiterDetailAnalyticsKpis } from './RecruiterDetailAnalyticsModal.kpis'
import { RecruiterDetailAnalyticsCharts } from './RecruiterDetailAnalyticsModal.charts'
import { RecruiterDetailAnalyticsTable } from './RecruiterDetailAnalyticsModal.table'

export type { RecruiterDetailData }

interface RecruiterDetailAnalyticsModalProps {
  recruiter: RecruiterDetailData | null
  onClose: () => void
}

export function RecruiterDetailAnalyticsModal({
  recruiter,
  onClose,
}: RecruiterDetailAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'submissions'>('overview')

  if (!recruiter) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-6 border border-slate-100 my-6 animate-in zoom-in-95 duration-150 font-sans text-slate-800">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#6B3BF6]/10 text-[#6B3BF6] font-extrabold flex items-center justify-center text-lg border border-[#6B3BF6]/20">
              {recruiter.avatar || recruiter.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {recruiter.name}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    recruiter.status === 'On Track'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : recruiter.status === 'Warning'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  ● {recruiter.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {recruiter.role} • {recruiter.team} • Detailed Performance Breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close analytics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <RecruiterDetailAnalyticsKpis recruiter={recruiter} />
        <RecruiterDetailAnalyticsCharts recruiter={recruiter} />
        <RecruiterDetailAnalyticsTable
          recruiter={recruiter}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
