import React, { useState } from 'react'
import { Layers } from 'lucide-react'
import { Recruiter } from '../../types'
import { RecruiterAnalyticsTableFilters } from './RecruiterAnalyticsTable.filters'
import { RecruiterAnalyticsTableRow } from './RecruiterAnalyticsTable.row'

interface RecruiterAnalyticsTableProps {
  recruiters: Recruiter[]
  title?: string
  subtitle?: string
}

export function RecruiterAnalyticsTable({
  recruiters,
  title = 'Recruiter-Wise Performance Analytics',
  subtitle = 'Comprehensive breakdown of requirements, interview stages (L1, L2, Custom, Final), weekly tasks, and client accounts',
}: RecruiterAnalyticsTableProps) {
  const [timeframe, setTimeframe] = useState<'Weekly' | 'Monthly' | 'Custom'>('Monthly')
  const [selectedClient, setSelectedClient] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRecruiters = recruiters.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.admin.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesClient = selectedClient === 'All' || r.primaryClient === selectedClient
    const matchesStatus = selectedStatus === 'All' || r.taskStatus === selectedStatus
    const matchesType = selectedType === 'All' || r.submissionType === selectedType

    return matchesSearch && matchesClient && matchesStatus && matchesType
  })

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> {title}
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{subtitle}</p>
        </div>

        <RecruiterAnalyticsTableFilters
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-3.5 px-4">Recruiter Info</th>
              <th className="py-3.5 px-4 text-center">Total Reqs</th>
              <th className="py-3.5 px-4 text-center">Total Subs</th>
              <th className="py-3.5 px-4">Interviews Stage Breakdown (L1 / L2 / Custom / Final)</th>
              <th className="py-3.5 px-4 w-44">Weekly Task & Progress</th>
              <th className="py-3.5 px-4 text-center">Task Status</th>
              <th className="py-3.5 px-4">Submission Sourcing Type</th>
              <th className="py-3.5 px-4">Primary Client Account</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecruiters.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs font-mono text-slate-400">
                  No recruiter performance data found matching current filter criteria.
                </td>
              </tr>
            ) : (
              filteredRecruiters.map(r => <RecruiterAnalyticsTableRow key={r.id} r={r} />)
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Showing {filteredRecruiters.length} recruiter metrics</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            🟢 POSITIVE: Task target condition met
          </span>
          <span className="flex items-center gap-1 text-rose-600 font-bold">
            🔴 CRITICAL: Below weekly target threshold
          </span>
        </div>
      </div>
    </div>
  )
}
