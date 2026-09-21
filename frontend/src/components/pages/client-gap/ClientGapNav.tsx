import React from 'react'
import { FileText, BarChart3, AlertTriangle, UserCheck, Maximize2, Minimize2, Layers } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapNav({ vm }: { vm: ClientGapVm }) {
  const {
    setOpenSections,
    activeTabSection,
    setActiveTabSection,
    expandAll,
    collapseAll,
  } = vm
  return (
    <>
      {/* 2.5 SECTION TOGGLE NAVIGATION CONTROL BAR */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => {
              setActiveTabSection('kpi')
              setOpenSections(prev => ({ ...prev, kpi: true }))
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTabSection === 'kpi'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>KPI Summary</span>
          </button>

          <button
            onClick={() => {
              setActiveTabSection('domainTable')
              setOpenSections(prev => ({ ...prev, domainTable: true }))
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTabSection === 'domainTable'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Domain Delivery</span>
          </button>
          <button
            onClick={() => {
              setActiveTabSection('domainCharts')
              setOpenSections(prev => ({ ...prev, domainCharts: true }))
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTabSection === 'domainCharts'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Domain Charts</span>
          </button>
          <button
            onClick={() => {
              setActiveTabSection('spocTable')
              setOpenSections(prev => ({ ...prev, spocTable: true }))
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTabSection === 'spocTable'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>SPOC Analysis</span>
          </button>
          <button
            onClick={() => {
              setActiveTabSection('reqGaps')
              setOpenSections(prev => ({ ...prev, reqGaps: true }))
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTabSection === 'reqGaps'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Requirement Gaps</span>
          </button>
          <button
            onClick={() => {
              setActiveTabSection('all')
              expandAll()
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTabSection === 'all'
                ? 'bg-[#6B3BF6] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Show All Sections
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            title="Expand all sections"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand All</span>
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            title="Collapse all sections to reduce scrolling"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Collapse All</span>
          </button>
        </div>
      </div>

    </>
  )
}
