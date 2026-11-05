import React, { useEffect, useMemo, useState } from 'react'
import { FileText, UserCheck, Send, Building } from 'lucide-react'
import { matchesSubmissionStatusFilter } from '../../../utils/submissionStatusFilter'
import { SubmissionsVm } from './useSubmissionsPage'

type KpiFocus = 'total' | 'partners' | 'submitted' | 'interview'

export function SubmissionsHeaderKpis({ vm }: { vm: SubmissionsVm }) {
  const {
    dateFilter,
    clientFilter,
    setClientFilter,
    clientOptions,
    kpiBaseData,
    filteredData,
    statusFilter,
    setStatusFilter,
    interviewSubmissionIds,
    offerSubmissionIds,
  } = vm

  // KPIs always come from kpiBaseData (ignores status filter) so clicking a card
  // only filters the table and does not rewrite these summary numbers.
  const kpiRows = kpiBaseData || filteredData || []
  const [kpiFocus, setKpiFocus] = useState<KpiFocus>('total')

  const counts = useMemo(() => {
    const interviewIds = interviewSubmissionIds || new Set<string>()
    const offerIds = offerSubmissionIds || new Set<string>()
    let clientStage = 0
    let wentForInterview = 0
    let selectedFinal = 0
    for (const d of kpiRows) {
      const idKeys = [
        String(d.id || ''),
        String(d.submissionId || ''),
        String(d.raw?._id || ''),
        String(d.raw?.id || ''),
        String(d.raw?.submissionId || ''),
      ].filter(Boolean)
      const opts = {
        hasInterview: idKeys.some(k => interviewIds.has(k)),
        hasOffer: idKeys.some(k => offerIds.has(k)),
      }
      if (matchesSubmissionStatusFilter(d.status, 'Submitted to Client', opts)) clientStage += 1
      if (matchesSubmissionStatusFilter(d.status, 'Interview Scheduled', opts)) wentForInterview += 1
      if (matchesSubmissionStatusFilter(d.status, 'Selected', opts)) selectedFinal += 1
    }
    return { clientStage, wentForInterview, selectedFinal }
  }, [kpiRows, interviewSubmissionIds, offerSubmissionIds])

  const partnerCount = useMemo(() => {
    const names = new Set<string>()
    for (const d of kpiRows) {
      const name = String(d.clientName || '').trim()
      if (name) names.add(name)
    }
    return names.size > 0 ? names.size : clientOptions?.length || 0
  }, [kpiRows, clientOptions])

  // Keep card highlight in sync when filters change from the dropdowns.
  useEffect(() => {
    const status = String(statusFilter || 'All')
    if (status === 'Submitted to Client') setKpiFocus('submitted')
    else if (status === 'Interview Scheduled') setKpiFocus('interview')
    else if (String(clientFilter || 'All') !== 'All') setKpiFocus('partners')
    else if (status === 'All') setKpiFocus(prev => (prev === 'partners' ? 'partners' : 'total'))
  }, [statusFilter, clientFilter])

  const kpiButtonClass = (active: boolean) =>
    `bg-white rounded-2xl p-4 shadow-2xs border flex items-center justify-between text-left transition-colors cursor-pointer ${
      active ? 'border-[#6B3BF6] ring-1 ring-[#6B3BF6]/30' : 'border-slate-200/80 hover:border-purple-200'
    }`

  const focusClientFilter = () => {
    const el = document.getElementById('submissions-client-filter') as HTMLSelectElement | null
    if (!el) return
    el.focus()
    // Native select: open where the browser allows it.
    try {
      el.showPicker?.()
    } catch {
      /* ignore unsupported browsers */
    }
  }

  return (
    <>
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Total Submissions</h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-[#6B3BF6] border border-purple-200 inline-flex items-center gap-1.5 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[#6B3BF6]" />
              <span>
                {kpiRows.length}{' '}
                {dateFilter === 'Today'
                  ? 'Candidates Submitted Today'
                  : dateFilter === 'Yesterday'
                    ? 'Candidates Submitted Yesterday'
                    : dateFilter === 'This week'
                      ? 'Candidates Submitted This Week'
                      : dateFilter === 'This month'
                        ? 'Candidates Submitted This Month'
                        : 'Candidates Submitted'}
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track candidate profiles submitted to client organizations by your recruitment desk.
          </p>
        </div>
      </div>

      {/* 2. Enhanced KPI Metrics — click filters the table only; numbers stay stable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setKpiFocus('total')
            setStatusFilter('All')
            setClientFilter?.('All')
          }}
          className={kpiButtonClass(kpiFocus === 'total')}
          title="Show all submissions"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {dateFilter === 'Today'
                ? 'Submitted to Client Today'
                : dateFilter === 'Yesterday'
                  ? 'Submitted to Client Yesterday'
                  : dateFilter === 'This week'
                    ? 'Submitted to Client This Week'
                    : dateFilter === 'This month'
                      ? 'Submitted to Client This Month'
                      : 'Total Client Submissions'}
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{kpiRows.length}</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-0.5 block">
              {clientFilter !== 'All' ? `Filtered by ${clientFilter}` : `Across ${partnerCount} Clients`}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6B3BF6] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKpiFocus('partners')
            // Clear status so the table shows every partner; open client picker to choose one.
            setStatusFilter('All')
            setClientFilter?.('All')
            // Defer focus until after React applies filter resets.
            window.setTimeout(focusClientFilter, 0)
          }}
          className={kpiButtonClass(kpiFocus === 'partners' || String(clientFilter || 'All') !== 'All')}
          title="Filter by client partner — opens client list"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Client Partners
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{partnerCount}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">
              {String(clientFilter || 'All') !== 'All'
                ? `Viewing ${clientFilter}`
                : 'Active Client Organizations'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Building className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKpiFocus('submitted')
            setStatusFilter('Submitted to Client')
          }}
          className={kpiButtonClass(kpiFocus === 'submitted')}
          title="Filter table: Submitted to Client"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Submitted to Client
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{counts.clientStage}</p>
            <span className="text-[10px] text-indigo-600 font-semibold mt-0.5 block">
              Client Stage Submissions
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Send className="w-5 h-5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKpiFocus('interview')
            setStatusFilter('Interview Scheduled')
          }}
          className={kpiButtonClass(kpiFocus === 'interview')}
          title="Filter table: Went for Interview"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Went for Interview
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
              {counts.wentForInterview}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
              {counts.selectedFinal} selected / final in view
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
        </button>
      </div>
    </>
  )
}
