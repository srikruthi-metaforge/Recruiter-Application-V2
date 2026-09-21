import React from 'react'
import { Calendar, Building2 } from 'lucide-react'

export const CLIENT_OPTIONS = ['All', 'KPMG', 'Accenture', 'L&T', 'Goldman Sachs', 'Tesla', 'Microsoft']

export function RecruiterAnalyticsTableFilters({
  timeframe,
  setTimeframe,
  selectedClient,
  setSelectedClient,
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType,
}: {
  timeframe: 'Weekly' | 'Monthly' | 'Custom'
  setTimeframe: (value: 'Weekly' | 'Monthly' | 'Custom') => void
  selectedClient: string
  setSelectedClient: (value: string) => void
  selectedStatus: string
  setSelectedStatus: (value: string) => void
  selectedType: string
  setSelectedType: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono">
        <Calendar className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-slate-400">Period:</span>
        <select
          value={timeframe}
          onChange={e => setTimeframe(e.target.value as any)}
          className="bg-transparent text-slate-900 font-bold focus:outline-none font-mono cursor-pointer"
        >
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Custom">Custom Range</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono">
        <Building2 className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-slate-400">Client:</span>
        <select
          value={selectedClient}
          onChange={e => setSelectedClient(e.target.value)}
          className="bg-transparent text-slate-900 font-bold focus:outline-none font-mono cursor-pointer"
        >
          {CLIENT_OPTIONS.map(c => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Clients' : c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono">
        <span className="text-slate-400">Status:</span>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="bg-transparent text-slate-900 font-bold focus:outline-none font-mono cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="POSITIVE">🟢 POSITIVE (Task Met)</option>
          <option value="CRITICAL">🔴 CRITICAL (Lagging)</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono">
        <span className="text-slate-400">Sourcing:</span>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="bg-transparent text-slate-900 font-bold focus:outline-none font-mono cursor-pointer"
        >
          <option value="All">All Sourcing Types</option>
          <option value="Direct Sourcing">Direct Sourcing</option>
          <option value="LinkedIn Recruiter">LinkedIn Recruiter</option>
          <option value="Internal DB">Internal DB</option>
          <option value="Agency Portal">Agency Portal</option>
          <option value="Referral">Referral</option>
        </select>
      </div>
    </div>
  )
}
