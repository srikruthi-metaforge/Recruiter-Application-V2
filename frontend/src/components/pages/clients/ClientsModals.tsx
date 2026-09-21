import React from 'react'
import { Search, Filter } from 'lucide-react'
import { ClientDeliveryGapAnalysisPage } from '../ClientDeliveryGapAnalysisPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientsVm } from './useClientsPage'
import { getClientStats } from './preamble2'

export function ClientsModals({ vm }: { vm: ClientsVm }) {
  const {
    selectedClientForReqsModal,
    setSelectedClientForReqsModal,
    reqsModalSearchQuery,
    setReqsModalSearchQuery,
    reqsModalPriorityFilter,
    setReqsModalPriorityFilter,
    periodFilter,
    toastMsg,
    filteredModalReqs,
    start,
  } = vm
  return (
    <>
      {/* 5. CLIENT REQUIREMENTS BREAKDOWN MODAL */}
      {selectedClientForReqsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6B3BF6] to-[#5833E0] text-white font-black text-lg flex items-center justify-center shrink-0 border border-purple-300 shadow-md">
                  {selectedClientForReqsModal.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">
                      Requirements Received from {selectedClientForReqsModal.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                      {selectedClientForReqsModal.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Domain: <strong className="text-purple-700">{selectedClientForReqsModal.domain}</strong> • Primary POC: <strong className="text-slate-900">{selectedClientForReqsModal.pocName}</strong> ({selectedClientForReqsModal.pocEmail})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientForReqsModal(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* OVERVIEW STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 text-center">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Total Client Reqs</span>
                <span className="text-2xl font-black text-blue-950 font-mono">
                  {getClientStats(selectedClientForReqsModal, periodFilter).reqs}
                </span>
              </div>
              <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-100 text-center">
                <span className="text-[10px] font-bold text-purple-800 uppercase block">Total Submissions</span>
                <span className="text-2xl font-black text-purple-950 font-mono">
                  {getClientStats(selectedClientForReqsModal, periodFilter).submissions}
                </span>
              </div>
              <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Placements</span>
                <span className="text-2xl font-black text-emerald-950 font-mono">
                  {getClientStats(selectedClientForReqsModal, periodFilter).placements}
                </span>
              </div>
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-100 text-center">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">SLA TAT Target</span>
                <span className="text-2xl font-black text-amber-950 font-mono">
                  {selectedClientForReqsModal.slaTAT}
                </span>
              </div>
            </div>

            {/* SEARCH & PRIORITY FILTER BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search requirement title, ID, recruiter..."
                  value={reqsModalSearchQuery}
                  onChange={e => setReqsModalSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800"
                />
              </div>

              {/* Priority Filter Pills */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Priority:</span>
                {(['All', 'High', 'Medium', 'Low'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setReqsModalPriorityFilter(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      reqsModalPriorityFilter === p
                        ? 'bg-[#6B3BF6] text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* REQUIREMENTS TABLE LIST */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/80 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3.5">REQUIREMENT ID & TITLE</th>
                      <th className="py-2.5 px-3.5">ASSIGNED DATE</th>
                      <th className="py-2.5 px-3.5 text-center">PRIORITY</th>
                      <th className="py-2.5 px-3.5 text-center">STATUS</th>
                      <th className="py-2.5 px-3.5">ASSIGNED RECRUITER</th>
                      <th className="py-2.5 px-3.5 text-center">SUBMISSIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 text-slate-800 font-medium">
                    {filteredModalReqs.map(req => (
                      <tr key={req.id} className="hover:bg-white transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="font-extrabold text-slate-900 text-xs">{req.title}</div>
                          <div className="text-[10px] text-purple-700 font-bold mt-0.5">
                            ID: {req.id} • <span className="text-slate-500 font-normal">{req.experience}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                          {req.assignedDate}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              req.priority === 'High'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : req.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          {req.assignedRecruiter}
                        </td>
                        <td className="py-3 px-3.5 text-center font-bold text-slate-900 font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6B3BF6] border border-purple-200">
                            {req.submissionsCount} Subs ({req.interviewsCount} Int)
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredModalReqs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          No requirements found matching your search and filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredModalReqs.length} requirement(s) from {selectedClientForReqsModal.name}
              </span>
              <button
                onClick={() => setSelectedClientForReqsModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
        )}
    </>
  )
}
