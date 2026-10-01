import React from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { RequirementDetailOverview } from '../../pages/RequirementDetailOverview'
import { CandidateRepositoryPage } from '../../pages/CandidateRepositoryPage'
import { SubmissionsPage } from '../../pages/SubmissionsPage'
import { InterviewTrackingPage } from '../../pages/InterviewTrackingPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { PageHeader } from '../../layout/PageHeader'
import { RecruiterDashboardVm } from './useRecruiterDashboard'

export function RecruiterDashReqs({ vm }: { vm: RecruiterDashboardVm }) {
  const {
    requirements,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    key,
    handleOpenInlineCandidateRepo,
    handleOpenReqOverview,
    paginatedReqs,
    filteredReqs,
  } = vm
  return (
    <>
      {/* Active Requirements + Submitted Candidates Section */}
      <section id="active-requirements-section" className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Assigned Requirements
            </h2>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client or requirement ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6B3BF6]/20 focus:border-[#6B3BF6] transition-all placeholder:text-slate-400 shadow-2xs"
            />
          </div>
        </div>

        {/* Requirements Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3">
                    REQUIREMENT ID
                  </th>
                  <th className="px-4 py-3">
                    REQUIREMENT NAME
                  </th>
                  <th className="px-4 py-3">
                    CLIENT
                  </th>
                  <th className="px-4 py-3">
                    STATUS
                  </th>
                  <th className="px-4 py-3">
                    TIMESTAMP (ASSIGNED ON)
                  </th>
                  <th className="px-4 py-3 text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-normal bg-white">
                {paginatedReqs.length > 0 ? (
                  paginatedReqs.map((req, idx) => (
                    <tr key={req.id || idx} className="hover:bg-slate-50/60 transition-colors align-middle">
                      <td className="px-4 py-3 font-mono text-slate-900 align-middle">
                        <button
                          onClick={() => handleOpenReqOverview(req.id, req.name, req.client)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          title="Click to view Requirement Overview"
                        >
                          {req.id}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 align-middle">
                        <button
                          onClick={() => handleOpenReqOverview(req.id, req.name, req.client)}
                          className="text-xs font-semibold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer text-left"
                          title="Click to view Requirement Overview"
                        >
                          {req.name}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium align-middle">{req.client}</td>
                      <td className="px-4 py-3 align-middle">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{req.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 align-middle">{req.timestamp}</td>
                      <td className="px-4 py-3 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => handleOpenInlineCandidateRepo(req.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] hover:bg-[#6B3BF6] text-[#5B51D8] hover:text-white border border-[#C7D2FE] hover:border-[#6B3BF6] rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-98 whitespace-nowrap group shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#5B51D8] group-hover:text-white transition-colors" />
                          <span>Candidate Repo</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs font-medium">
                      No active requirements found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <PaginationFooter
            currentPage={currentPage}
            totalPages={Math.ceil(filteredReqs.length / pageSize)}
            totalItems={filteredReqs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="requirements"
          />
        </div>
      </section>

    </>
  )
}
