import React from 'react'
import { Building2, Plus, Search, FileText, Filter, Award, FileCheck, ChevronDown } from 'lucide-react'
import { ClientDeliveryGapAnalysisPage } from '../ClientDeliveryGapAnalysisPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientsVm } from './useClientsPage'

export function ClientsListHeader({ vm }: { vm: ClientsVm }) {
  const {
    clients,
    setViewMode,
    searchQuery,
    setSearchQuery,
    domainFilter,
    setDomainFilter,
    periodFilter,
    setPeriodFilter,
    canAddClient,
  } = vm
  return (
    <>
      {/* 1. TOP HEADER & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Management</h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 inline-flex items-center gap-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{clients.length} Empaneled Clients</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage empaneled client accounts, view Master Services Agreements (MSA), and add new client partners.
          </p>
        </div>

        {canAddClient && (
          <div className="flex items-center gap-3">
            {/* BUTTON SWITCHES TO DEDICATED FULL-PAGE ADD CLIENT VIEW */}
            <button
              onClick={() => (vm.openAddClient ? vm.openAddClient() : setViewMode('add'))}
              className="px-4 py-2.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Client</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. SUMMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Executed MSAs
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {clients.filter(c => c.agreementStatus === 'Active - Executed').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6B3BF6]">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Reqs ({periodFilter})
            </span>
            <p className="text-2xl font-extrabold text-blue-600 mt-1 tabular-nums">
              {totalPeriodReqs}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Submissions ({periodFilter})
            </span>
            <p className="text-2xl font-extrabold text-purple-600 mt-1 tabular-nums">
              {totalPeriodSubmissions}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6B3BF6]">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Placements ({periodFilter})
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">
              {totalPeriodPlacements}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & DOMAIN & REQUIREMENTS PERIOD FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client organization, POC, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Requirements Time Period Filter (Week / Month / Year / All Time) */}
          <div className="relative w-full sm:w-52">
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value as any)}
              className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs border border-purple-200 bg-purple-50/70 rounded-xl font-extrabold text-[#6B3BF6] focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Time">Requirements: All Time</option>
              <option value="This Week">Requirements: This Week</option>
              <option value="This Month">Requirements: This Month</option>
              <option value="This Year">Requirements: This Year</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B3BF6] pointer-events-none" />
          </div>

          <div className="w-full sm:w-52">
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Domains">All Industry Domains</option>
              <option value="Software & Cloud Services">Software & Cloud Services</option>
              <option value="Hardware & Automotive Engineering">Hardware & Automotive Engineering</option>
              <option value="Enterprise Security & IT">Enterprise Security & IT</option>
              <option value="Enterprise SAP & ERP">Enterprise SAP & ERP</option>
              <option value="AI, Data & Analytics">AI, Data & Analytics</option>
            </select>
          </div>
        </div>
      </div>

    </>
  )
}
