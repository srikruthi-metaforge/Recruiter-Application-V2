import React from 'react'
import { ShieldCheck, User, Users, ChevronDown, Sparkles, Layers } from 'lucide-react'
import { ClientDeliveryGapAnalysisPage } from '../ClientDeliveryGapAnalysisPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientsVm } from './useClientsPage'
import { getClientStats } from './preamble2'

export function ClientsTable({ vm }: { vm: ClientsVm }) {
  const {
    setSelectedClientForGapAnalysis,
    setSelectedClientForReqsModal,
    setReqsModalSearchQuery,
    setReqsModalPriorityFilter,
    activeDropdownClientId,
    setActiveDropdownClientId,
    periodFilter,
    currentPage,
    setCurrentPage,
    filteredClients,
    pageSize,
    totalPages,
    paginatedClients,
  } = vm
  return (
    <>
      {/* 4. CLIENTS TABLE LIST */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">CLIENT ORGANIZATION</th>
                <th className="py-3.5 px-4">ASSIGNED TEAM & MEMBERS</th>
                <th className="py-3.5 px-4 text-center">REQUIREMENTS</th>
                <th className="py-3.5 px-4 text-center">SUBMISSIONS</th>
                <th className="py-3.5 px-4">CLIENT POC</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {paginatedClients.map(client => (
                <tr
                  key={client.id}
                  className="hover:bg-purple-50/40 transition-colors group"
                >
                  {/* Column 1: Client Organization */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6B3BF6] to-[#5833E0] text-white font-extrabold flex items-center justify-center text-sm shrink-0 shadow-2xs">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                          <span>{client.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                            {client.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#6B3BF6] font-semibold mt-0.5">{client.domain}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">{client.location}</div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Combined Team Lead & Team Members Working */}
                  <td className="py-4 px-4 whitespace-nowrap min-w-56">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setActiveDropdownClientId(activeDropdownClientId === client.id ? null : client.id)
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs ${
                          activeDropdownClientId === client.id
                            ? 'bg-[#6B3BF6] text-white border-[#5833E0] ring-2 ring-[#6B3BF6]/20'
                            : 'bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border-purple-200'
                        }`}
                        title={`Click to view team members working under ${client.teamLead}`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${activeDropdownClientId === client.id ? 'text-white' : 'text-blue-600'}`} />
                          <span>{client.teamLead} (Team Lead)</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${activeDropdownClientId === client.id ? 'rotate-180 text-white' : 'text-[#6B3BF6]'}`} />
                      </button>

                      {/* Custom Animated UI Dropdown Popover */}
                      {activeDropdownClientId === client.id && (
                        <>
                          {/* Backdrop overlay to close */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={e => {
                              e.stopPropagation()
                              setActiveDropdownClientId(null)
                            }}
                          />

                          <div
                            className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-3 space-y-2 font-sans animate-in fade-in zoom-in-95 duration-150"
                            onClick={e => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Users className="w-3 h-3 text-[#6B3BF6]" />
                                <span>Team Members ({client.teamMembers.length})</span>
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6B3BF6] text-[9px] font-extrabold">
                                Lead: {client.teamLead}
                              </span>
                            </div>

                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {client.teamMembers.map(member => (
                                <div
                                  key={member}
                                  className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50/80 border border-slate-100 transition-colors flex items-center gap-2.5"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#6B3BF6] font-extrabold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                                    {member.charAt(0)}
                                  </div>
                                  <div className="truncate">
                                    <div className="font-extrabold text-slate-900 text-xs truncate">{member}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">Team Member</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Column 4: Requirements Count (Interactive Button Opens Modal) */}
                  <td className="py-4 px-4 whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedClientForReqsModal(client)
                        setReqsModalSearchQuery('')
                        setReqsModalPriorityFilter('All')
                      }}
                      className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 hover:border-blue-400 tabular-nums transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 inline-flex items-center gap-1.5"
                      title={`Click to view all requirements received from ${client.name}`}
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>{getClientStats(client, periodFilter).reqs} Reqs</span>
                    </button>
                    {periodFilter !== 'All Time' && (
                      <div className="text-[10px] text-purple-700 font-extrabold mt-0.5">({periodFilter})</div>
                    )}
                  </td>

                  {/* Column 5: Submissions Count */}
                  <td className="py-4 px-4 whitespace-nowrap text-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-900 border border-purple-200 tabular-nums">
                      {getClientStats(client, periodFilter).submissions} Subs
                    </span>
                    {periodFilter !== 'All Time' && (
                      <div className="text-[10px] text-purple-700 font-extrabold mt-0.5">({periodFilter})</div>
                    )}
                  </td>

                  {/* Column 6: CLIENT POC */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        <span>{client.pocName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {client.pocEmail}
                      </div>
                    </div>
                  </td>

                  {/* Column 7: Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {/* CLIENT DELIVERY GAP ANALYSIS BUTTON */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedClientForGapAnalysis(client)
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6B3BF6] hover:bg-[#5833E0] text-white font-extrabold cursor-pointer inline-flex items-center gap-1.5 text-xs shadow-2xs transition-all active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gap Analysis</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 10-ITEM PAGINATION FOOTER */}
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

    </>
  )
}
