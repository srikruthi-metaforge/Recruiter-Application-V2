import React from 'react'
import { CheckCircle } from 'lucide-react'
import { RequirementDetailVm } from './useRequirementDetailOverview'

export function ReqDetailProgressTabs({ vm }: { vm: RequirementDetailVm }) {
  const {
    requirement,
    activeTab,
    setActiveTab,
    availableTabs,
    isUnassigned,
  } = vm
  return (
    <>
      {/* 5. RECRUITMENT PROGRESS CARD */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Recruitment Progress</h3>
        <div className="flex flex-wrap items-center gap-4 py-2">
          {/* Step 1: Assigned */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700">Assigned</span>
          </div>

          <div className="w-10 sm:w-12 h-0.5 bg-emerald-500"></div>

          {/* Step 2: Sourcing */}
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${
              !isUnassigned ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white font-bold text-xs'
            }`}>
              {!isUnassigned ? <CheckCircle className="w-4 h-4" /> : '●'}
            </div>
            <span className={`text-[11px] font-bold ${!isUnassigned ? 'text-emerald-700' : 'text-blue-600'}`}>Sourcing</span>
          </div>

          {!isUnassigned && (
            <>
              <div className="w-10 sm:w-12 h-0.5 bg-emerald-500"></div>

              {/* Step 3: Submitted to Lead */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Submitted to Lead</span>
              </div>

              <div className="w-10 sm:w-12 h-0.5 bg-emerald-500"></div>

              {/* Step 4: Submitted to Client */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-emerald-700">Submitted to Client</span>
              </div>

              <div className="w-10 sm:w-12 h-0.5 bg-amber-400"></div>

              {/* Step 5: Interview Scheduled */}
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs ${
                  (requirement as any).status?.toLowerCase().includes('interview') || requirement.interviews > 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-500 font-bold text-xs'
                }`}>
                  {(requirement as any).status?.toLowerCase().includes('interview') || requirement.interviews > 0 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    '5'
                  )}
                </div>
                <span className={`text-[11px] font-bold ${
                  (requirement as any).status?.toLowerCase().includes('interview') || requirement.interviews > 0
                    ? 'text-amber-700'
                    : 'text-slate-500'
                }`}>
                  Interview Scheduled
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 6. TAB NAVIGATION BAR (Activity tab visible strictly to Super Admin & Admin) */}
      <div className="bg-slate-50/80 border border-gray-200/80 rounded-xl p-1.5 flex items-center gap-1">
        {availableTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-xs border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

    </>
  )
}
