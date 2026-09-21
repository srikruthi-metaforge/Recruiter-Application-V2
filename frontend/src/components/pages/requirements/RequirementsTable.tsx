import React from 'react'
import { Clock } from 'lucide-react'
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
  } = vm
  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-bold">REQUIREMENT ID</th>
                <th className="py-3 px-4 font-bold">CLIENT NAME</th>
                <th className="py-3 px-4 font-bold">ROLE</th>
                <th className="py-3 px-4 font-bold text-center">POSITIONS</th>
                <th className="py-3 px-4 font-bold">PRIORITY</th>
                <th className="py-3 px-4 font-bold">ASSIGNED TO RECRUITER</th>
                <th className="py-3 px-4 font-bold">EMAIL ARRIVED TIME</th>
                <th className="py-3 px-4 font-bold">OPEN SINCE</th>
                <th className="py-3 px-4 font-bold text-center">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRequirements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <p className="text-sm font-medium">
                      No requirements match your current search or filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRequirements.map(req => {
                  const isUnassigned =
                    !req.owner || req.owner === 'Unassigned'
                  const isSelected = selectedReqIds.has(req.id)

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(req.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Requirement ID */}
                      <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        <div className="space-y-1">
                          <button
                            onClick={() => setSelectedReqForDetail(req)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 group text-left"
                            title="Click to view full requirement overview"
                          >
                            <span>{req.id}</span>
                          </button>
                          <div>
                            <span
                              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                                isUnassigned
                                  ? 'bg-gray-100 text-gray-600 border-gray-300'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {req.owner || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="py-3.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                        {req.client}
                      </td>

                      {/* Role & Subtext */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-gray-900 leading-snug line-clamp-2">
                          {req.title}
                        </div>
                        {req.location && (
                          <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                            {req.location}
                          </div>
                        )}
                      </td>

                      {/* Count of Positions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold tabular-nums">
                          {req.openings || 1}
                        </span>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            req.priority === 'High'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : req.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          {req.priority || 'Low'}
                        </span>
                      </td>

                      {/* Submitted to Recruiter */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
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

                      {/* Email Arrived Time */}
                      <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                        {req.emailArrivedTime || 'Aug 6, 2026, 11:05 AM'}
                      </td>

                      {/* Open Since */}
                      <td className="py-3.5 px-4 text-gray-700 font-medium whitespace-nowrap">
                        {req.openDays !== undefined
                          ? `${req.openDays} days`
                          : '0 days'}
                      </td>

                      {/* SLA */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Clock className="w-3 h-3 text-purple-500" />
                          {req.sla || (req.priority === 'High' ? '24 Hours' : req.priority === 'Medium' ? '48 Hours' : '72 Hours')}
                        </span>
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
    </>
  )
}
