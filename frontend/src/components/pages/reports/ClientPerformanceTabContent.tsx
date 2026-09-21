import React, { useState, useMemo } from 'react'
import { Building2, Search } from 'lucide-react'
import { ClientPerformanceData } from '../ClientDetailAnalyticsPage'
import { ClientPerformanceTabContentProps } from './types'
import { ClientPerformanceTable } from './ClientPerformanceTable'
import { ClientPerformanceDrilldownModal } from './ClientPerformanceDrilldownModal'

export function ClientPerformanceTabContent({
  clientPerformanceList,
  onSelectClient,
}: ClientPerformanceTabContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [drillDownModal, setDrillDownModal] = useState<{
    client: ClientPerformanceData
    metric: 'reqSent' | 'reqAssigned' | 'submissions' | 'openReqs' | 'closedReqs'
  } | null>(null)

  const filteredClients = useMemo(() => {
    return clientPerformanceList.filter(c =>
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [clientPerformanceList, searchQuery])

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredClients.slice(start, start + pageSize)
  }, [filteredClients, currentPage, pageSize])

  return (
    <div className="space-y-6 font-sans">
      {/* SEARCH BAR & HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#6B3BF6]" />
              <span>Client Performance Overview</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive analytics, requirement delivery status, and submission ratios across client partners.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client account..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <ClientPerformanceTable
        paginatedClients={paginatedClients}
        onSelectClient={onSelectClient}
        setDrillDownModal={setDrillDownModal}
        currentPage={currentPage}
        totalPages={totalPages}
        filteredClients={filteredClients}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        setPageSize={setPageSize}
      />
      {drillDownModal && (
        <ClientPerformanceDrilldownModal
          drillDownModal={drillDownModal}
          setDrillDownModal={setDrillDownModal}
          onSelectClient={onSelectClient}
        />
      )}
    </div>
  )
}
