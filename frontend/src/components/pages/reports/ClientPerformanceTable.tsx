import React from 'react'
import { Building2 } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientPerformanceData } from '../ClientDetailAnalyticsPage'

type Metric = 'reqSent' | 'reqAssigned' | 'submissions' | 'openReqs' | 'closedReqs'

interface Props {
  paginatedClients: ClientPerformanceData[]
  onSelectClient: (client: ClientPerformanceData) => void
  setDrillDownModal: (v: { client: ClientPerformanceData; metric: Metric } | null) => void
  currentPage: number
  totalPages: number
  filteredClients: { length: number }
  pageSize: number
  setCurrentPage: (p: number) => void
  setPageSize: (s: number) => void
}

export function ClientPerformanceTable({
  paginatedClients,
  onSelectClient,
  setDrillDownModal,
  currentPage,
  totalPages,
  filteredClients,
  pageSize,
  setCurrentPage,
  setPageSize,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">CLIENT</th>
                <th className="py-3.5 px-4 text-center">REQ SENT</th>
                <th className="py-3.5 px-4 text-center">REQ ASSIGNED</th>
                <th className="py-3.5 px-4 text-center">SUBMISSIONS</th>
                <th className="py-3.5 px-4 text-center">SUBMISSION RATIO</th>
                <th className="py-3.5 px-4 text-center">OPEN</th>
                <th className="py-3.5 px-4 text-center">CLOSED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-sm">
                    No client accounts match your search.
                  </td>
                </tr>
              ) : (
                paginatedClients.map(client => (
                  <tr key={client.id} className="hover:bg-purple-50/40 transition-colors group">
                    {/* CLIENT */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectClient(client)}
                        className="flex items-center gap-2.5 text-left group-hover:text-[#6B3BF6] transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#6B3BF6] border border-purple-200 font-black flex items-center justify-center text-xs shrink-0">
                          {client.clientName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs group-hover:text-[#6B3BF6] transition-colors">
                            {client.clientName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {client.activeRecruiters} Active Recruiters
                          </div>
                        </div>
                      </button>
                    </td>

                    {/* REQ SENT */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDrillDownModal({ client, metric: 'reqSent' })}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-[#6B3BF6] border border-slate-200 hover:border-purple-200 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer"
                        title="Click to view all sent requirements"
                      >
                        {client.reqSent}
                      </button>
                    </td>

                    {/* REQ ASSIGNED */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDrillDownModal({ client, metric: 'reqAssigned' })}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer"
                        title="Click to view assigned requirements"
                      >
                        {client.reqAssigned}
                      </button>
                    </td>

                    {/* SUBMISSIONS */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDrillDownModal({ client, metric: 'submissions' })}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer"
                        title="Click to view client candidate submissions"
                      >
                        {client.submissions}
                      </button>
                    </td>

                    {/* SUBMISSION RATIO */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-mono ${
                        client.subRatio >= 1.0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-[#6B3BF6] border border-purple-200'
                      }`}>
                        {client.subRatio.toFixed(2)}
                      </span>
                    </td>

                    {/* OPEN */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDrillDownModal({ client, metric: 'openReqs' })}
                        className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer"
                        title="Click to view open requirements"
                      >
                        {client.openReqs} Open
                      </button>
                    </td>

                    {/* CLOSED */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setDrillDownModal({ client, metric: 'closedReqs' })}
                        className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
                        title="Click to view closed requirements"
                      >
                        {client.closedReqs} Closed
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="clients"
        />
      </div>

  )
}
