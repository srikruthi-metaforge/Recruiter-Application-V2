import React from 'react'
import { Users, ChevronDown, Search } from 'lucide-react'
import { RequirementDetailVm } from './useRequirementDetailOverview'

export function ReqDetailOverviewB({ vm }: { vm: RequirementDetailVm }) {
  const {
    requirement,
    assignTabFilter,
    setAssignTabFilter,
    assignSearchQuery,
    setAssignSearchQuery,
    isRecruiter,
    activeTab,
  } = vm
  return (
    <>
      {activeTab === 'Overview' && (
          <>
          {/* ASSIGNMENT HISTORY CARD (ONLY VISIBLE TO LEADS, ADMIN, SUPERADMIN - HIDDEN FOR RECRUITER) */}
          {!isRecruiter && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Assignment history</h3>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">
                    Track who was assigned to this requirement and when. Updates when you Reassign or Revoke.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>4 active</span>
                </span>
              </div>

              {/* Filter Pills & Search Input Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <button
                    onClick={() => setAssignTabFilter('all')}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      assignTabFilter === 'all'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>All</span>
                    <span className="px-1.5 py-0.2 bg-blue-200/60 text-blue-800 rounded-full text-[10px] font-extrabold">4</span>
                  </button>

                  <button
                    onClick={() => setAssignTabFilter('active')}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      assignTabFilter === 'active'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Active</span>
                    <span className="px-1.5 py-0.2 bg-blue-200/60 text-blue-800 rounded-full text-[10px] font-extrabold">4</span>
                  </button>

                  <button
                    onClick={() => setAssignTabFilter('revoked')}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      assignTabFilter === 'revoked'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Revoked</span>
                    <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px] font-extrabold">0</span>
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search recruiter or assigner..."
                    value={assignSearchQuery}
                    onChange={e => setAssignSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800"
                  />
                </div>
              </div>

              {/* Assignment Groups / List */}
              <div className="space-y-3 pt-2">
                {/* Group 1: 2 recruiters grouped */}
                <div className="border border-slate-200/80 rounded-2xl p-4 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-sm">2 recruiters</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-extrabold uppercase">
                            ACTIVE
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-normal mt-0.5">
                          Assigned on 06/19/2026, 06:42 PM &nbsp; By <strong className="text-gray-600 font-semibold">Harish Gadipally</strong>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Sub-cards inside (2 columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        CD
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900 text-xs">Charlie Darwin</div>
                        <div className="text-[11px] text-gray-400 font-normal">charlie@metaforgeit.com</div>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                        RK
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900 text-xs">Raghu Karnam</div>
                        <div className="text-[11px] text-gray-400 font-normal">rkarnam@metaforgeit.com</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Item 2: Saiteja Puttapaka */}
                <div className="border border-slate-200/80 rounded-2xl p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      SP
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900 text-xs">Saiteja Puttapaka</div>
                      <div className="text-[11px] text-gray-400 font-normal">saiteja.p@metaforgeit.com</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-gray-400 font-normal text-[11px]">
                      Assigned on 06/19/2026, 06:35 PM &nbsp; By <strong className="text-gray-600 font-semibold">Harish Gadipally</strong>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-extrabold uppercase">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Item 3: Harish Gadipally */}
                <div className="border border-slate-200/80 rounded-2xl p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                      HG
                    </div>
                    <div>
                      <div className="font-extrabold text-gray-900 text-xs">Harish Gadipally</div>
                      <div className="text-[11px] text-gray-400 font-normal">harish.g@metaforgeit.com</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-gray-400 font-normal text-[11px]">
                      Assigned on 06/19/2026, 05:48 PM &nbsp; By <strong className="text-gray-600 font-semibold">Harish Gadipally</strong>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-extrabold uppercase">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
      )}
    </>
  )
}
