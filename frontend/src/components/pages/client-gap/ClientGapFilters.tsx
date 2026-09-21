import React from 'react'
import { Filter, Search, RotateCcw } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapFilters({ vm }: { vm: ClientGapVm }) {
  const {
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    selectedDomainFilter,
    setSelectedDomainFilter,
    selectedSpocFilter,
    setSelectedSpocFilter,
    selectedReqStatus,
    setSelectedReqStatus,
    selectedSubStatus,
    setSelectedSubStatus,
    selectedInterviewStatus,
    setSelectedInterviewStatus,
    showToast,
    d,
    uniqueSpocList,
  } = vm
  return (
    <>
      {/* 2. FILTERS CONTROL BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
            <Filter className="w-4 h-4 text-[#6B3BF6]" />
            <span>Dynamic Gap Analysis Filters</span>
          </div>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedDomainFilter('All Domains')
              setSelectedSpocFilter('All SPOCs')
              setSelectedReqStatus('All Statuses')
              setSelectedSubStatus('All')
              setSelectedInterviewStatus('All')
              showToast('Filters reset to default.')
            }}
            className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
          {/* Time Period Filter (Week / Month / Year / All Time) */}
          <div>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-purple-50/90 border border-purple-200 rounded-xl font-extrabold text-[#6B3BF6] focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Time">All Time</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Title or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-xs"
            />
          </div>

          {/* Standardized Domain Filter */}
          <div>
            <select
              value={selectedDomainFilter}
              onChange={e => setSelectedDomainFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Domains">All Domains ({STANDARDIZED_DOMAINS_LIST.length})</option>
              {STANDARDIZED_DOMAINS_LIST.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* SPOC Filter */}
          <div>
            <select
              value={selectedSpocFilter}
              onChange={e => setSelectedSpocFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All SPOCs">All SPOCs</option>
              {uniqueSpocList.map(s => (
                <option key={s} value={s}>
                  SPOC: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Requirement Status */}
          <div>
            <select
              value={selectedReqStatus}
              onChange={e => setSelectedReqStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Statuses">All Requirement Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Submission Status */}
          <div>
            <select
              value={selectedSubStatus}
              onChange={e => setSelectedSubStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All">All Submission States</option>
              <option value="Zero Submissions">Zero Submissions (0)</option>
              <option value="Has Submissions">Has Submissions (&gt;0)</option>
            </select>
          </div>

          {/* Interview Status */}
          <div>
            <select
              value={selectedInterviewStatus}
              onChange={e => setSelectedInterviewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All">All Interview Statuses</option>
              <option value="Final Selects">Final Selects</option>
              <option value="L1 Rejects">L1 Rejects</option>
              <option value="Awaiting/Pending">Awaiting / Pending</option>
            </select>
          </div>
        </div>
      </div>

    </>
  )
}
