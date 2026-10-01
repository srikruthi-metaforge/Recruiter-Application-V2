import React, { useState } from 'react'
import { Clock, ChevronDown, Edit3 } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { RequirementsVm } from './useRequirementsPage'

export function RequirementsTable({ vm }: { vm: RequirementsVm }) {
  const {
    requirements,
    setSelectedReqForDetail,
    selectedReqIds,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filteredRequirements,
    paginatedRequirements,
    isAllSelected,
    toggleSelectAll,
    toggleSelectRow,
    handleUpdateReqStatus,
  } = vm

  const [customModalReq, setCustomModalReq] = useState<{ id: string; currentStatus: string } | null>(null)
  const [customStatusInput, setCustomStatusInput] = useState('')

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#6B3BF6] focus:ring-[#6B3BF6] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 font-bold">REQUIREMENT ID</th>
                <th className="py-3.5 px-4 font-bold">CLIENT NAME</th>
                <th className="py-3.5 px-4 font-bold">ROLE & LOCATION</th>
                <th className="py-3.5 px-4 font-bold">ASSIGNED TO RECRUITER</th>
                <th className="py-3.5 px-4 font-bold">EMAIL ARRIVED TIME</th>
                <th className="py-3.5 px-4 font-bold text-center">UPDATE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-xs font-semibold">
                      No requirements match your current search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRequirements.map(req => {
                  const isUnassigned =
                    !req.owner || req.owner === 'Unassigned'
                  const isSelected = selectedReqIds.has(req.id)
                  const rawStatus = req.status || 'Open'
                  const isCustomStatus = rawStatus.startsWith('Custom:')
                  const displaySelectVal = isCustomStatus ? 'Custom' : (rawStatus === 'Hold' || rawStatus === 'Reopen' || rawStatus === 'Open' ? rawStatus : 'Open')

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-purple-50/30 transition-colors ${
                        isSelected ? 'bg-purple-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(req.id)}
                          className="rounded border-slate-300 text-[#6B3BF6] focus:ring-[#6B3BF6] cursor-pointer"
                        />
                      </td>

                      {/* Requirement ID */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="space-y-1">
                          <button
                            onClick={() => setSelectedReqForDetail(req)}
                            className="text-xs font-extrabold text-[#6B3BF6] hover:text-[#5833E0] hover:underline cursor-pointer flex items-center gap-1 group text-left"
                            title="Click to view full requirement overview"
                          >
                            <span>{req.id}</span>
                          </button>
                          <div>
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isUnassigned
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {req.owner || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-200/80 rounded-xl text-xs inline-block">
                          {req.client}
                        </span>
                      </td>

                      {/* Role & Location */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-extrabold text-slate-900 leading-snug line-clamp-2 text-xs">
                          {req.title}
                        </div>
                        {req.location && (
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">
                            📍 {req.location}
                          </div>
                        )}
                      </td>

                      {/* Submitted to Recruiter */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isUnassigned ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-purple-100 text-[#6B3BF6] border border-purple-200 shadow-2xs'
                          }`}>
                            {isUnassigned ? '?' : (req.owner || 'R').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`text-xs ${isUnassigned ? 'text-slate-400 italic font-medium' : 'text-slate-900 font-extrabold'}`}>
                              {req.owner || 'Unassigned'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {isUnassigned ? 'Pending assignment' : 'Assigned Recruiter'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Arrived Time & Open Since */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#6B3BF6] shrink-0" />
                            <span>{req.emailArrivedTime || 'Aug 6, 2026, 11:05 AM'}</span>
                          </div>
                          <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#5B51D8] bg-[#EEF2FF] border border-[#C7D2FE] px-2.5 py-0.5 rounded-lg shadow-2xs">
                            <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Open Since:</span>
                            <span className="font-mono">{req.openDays !== undefined ? `${req.openDays} days` : '0 days'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Requirement Status Dropdown */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="space-y-1 flex flex-col items-center">
                          <div className="relative inline-block text-left">
                            <select
                              value={displaySelectVal}
                              onChange={e => {
                                const val = e.target.value
                                if (val === 'Custom') {
                                  setCustomModalReq({ id: req.id, currentStatus: rawStatus })
                                  setCustomStatusInput(isCustomStatus ? rawStatus.replace(/^Custom:\s*/, '') : '')
                                } else {
                                  handleUpdateReqStatus?.(req.id, val)
                                }
                              }}
                              className={`appearance-none pl-3 pr-7 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#6B3BF6]/20 ${
                                displaySelectVal === 'Hold'
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                  : displaySelectVal === 'Reopen'
                                  ? 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100'
                                  : displaySelectVal === 'Custom'
                                  ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                              }`}
                            >
                              <option value="Open" className="bg-white text-emerald-900 font-bold">🟢 Open</option>
                              <option value="Hold" className="bg-white text-amber-900 font-bold">⏸️ Hold</option>
                              <option value="Reopen" className="bg-white text-blue-900 font-bold">🔄 Reopen</option>
                              <option value="Custom" className="bg-white text-purple-900 font-bold">✏️ Custom...</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          {/* Show custom typed status note if custom status is set */}
                          {isCustomStatus && (
                            <div className="text-[10px] text-purple-700 font-bold max-w-[140px] truncate bg-purple-50 px-2 py-0.5 rounded border border-purple-200" title={rawStatus.replace(/^Custom:\s*/, '')}>
                              💬 {rawStatus.replace(/^Custom:\s*/, '')}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <PaginationFooter
          currentPage={currentPage}
          totalPages={Math.ceil(filteredRequirements.length / pageSize)}
          totalItems={filteredRequirements.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="requirements"
        />
      </div>

      {/* MANUAL CUSTOM STATUS UPDATE MODAL */}
      {customModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-[#6B3BF6] flex items-center justify-center text-xs font-bold">✏️</span>
                <span>Custom Status / Update Reason</span>
              </h3>
              <button
                onClick={() => setCustomModalReq(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Type your custom status update or reason for <strong className="text-slate-900">{customModalReq.id}</strong>:
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Custom Reason / Status Detail:
              </label>
              <textarea
                rows={3}
                value={customStatusInput}
                onChange={e => setCustomStatusInput(e.target.value)}
                placeholder="E.g. On Hold - Awaiting Client Budget Approval, or Reopened - Additional 2 positions..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6B3BF6]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCustomModalReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customStatusInput.trim()) {
                    handleUpdateReqStatus?.(customModalReq.id, `Custom: ${customStatusInput.trim()}`)
                  }
                  setCustomModalReq(null)
                }}
                className="px-4 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
              >
                Save Custom Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
