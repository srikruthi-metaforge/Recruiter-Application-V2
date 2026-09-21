import React from 'react'
import { ArrowLeft, Building2, Download } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapHeader({ vm }: { vm: ClientGapVm }) {
  const {
    clientName,
    pocName,
    pocEmail,
    teamLead,
    role,
    onBack,
    showToast,
    metrics,
    healthStatus,
  } = vm
  return (
    <>
      {/* 1. TOP HEADER & HEALTH SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-200/90 active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Clients List</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-lg border border-purple-200 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
                  {clientName}
                </h1>

                {/* Health Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold border inline-flex items-center gap-1.5 shadow-2xs ${
                    metrics.healthStatus === 'Healthy'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : metrics.healthStatus === 'Needs Attention'
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      metrics.healthStatus === 'Healthy'
                        ? 'bg-emerald-600'
                        : metrics.healthStatus === 'Needs Attention'
                        ? 'bg-amber-600'
                        : 'bg-rose-600'
                    }`}
                  />
                  <span>
                    Status: {metrics.healthStatus === 'Healthy' ? 'Healthy Coverage' : metrics.healthStatus === 'Needs Attention' ? 'Needs Attention' : 'Critical Delivery Gap'}
                  </span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EEF2FF] text-[#5B51D8] border border-[#C7D2FE] inline-flex items-center gap-1 shadow-2xs">
                  🔒 Isolated View: {clientName} Data Only
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Client Delivery Gap Analysis • SPOC: <strong className="text-slate-800">{pocName}</strong> ({pocEmail}) • Lead: <strong className="text-purple-700">{teamLead}</strong>
              </p>
            </div>
          </div>
        </div>

        {role !== 'recruiter' && role !== 'lead' && role !== 'admin' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast(`Exporting Delivery Gap Analysis for ${clientName}...`)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Export Gap Report CSV</span>
            </button>
          </div>
        )}
      </div>

    </>
  )
}
