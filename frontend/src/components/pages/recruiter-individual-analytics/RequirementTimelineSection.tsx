import React, { memo, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Clock, Search } from 'lucide-react'
import type { Requirement, Submission } from '../../../types'
import { workspaceService } from '../../../services/workspace.service'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { buildRequirementTimeline } from './computePerformance'
import type { DatePreset, RecruiterOption } from './types'

const PERIODS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7_days', label: 'Last 7 Days' },
  { value: '30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
]

export const RequirementTimelineSection = memo(function RequirementTimelineSection({
  requirements,
  submissions,
  recruiter = null,
  assigneeOptions = [],
}: {
  requirements: Requirement[]
  submissions: Submission[]
  /** When set, the table is only that recruiter's assigned requirements. */
  recruiter?: RecruiterOption | null
  /** Admin/lead: users shown in the Assigned to filter. Hidden when `recruiter` locks the view. */
  assigneeOptions?: RecruiterOption[]
}) {
  const [assignedOnByRequirementId, setAssignedOnByRequirementId] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [pageSize, setPageSize] = useState(10)
  const [period, setPeriod] = useState<DatePreset>('all')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [assignedToId, setAssignedToId] = useState('all')

  const showAssigneeFilter = !recruiter && assigneeOptions.length > 0

  const assigneeFilter = useMemo(() => {
    if (!showAssigneeFilter || assignedToId === 'all') return null
    return (
      assigneeOptions.find(opt => opt.id === assignedToId || opt.name === assignedToId) || null
    )
  }, [showAssigneeFilter, assignedToId, assigneeOptions])

  const effectiveRecruiter = recruiter || assigneeFilter

  useEffect(() => {
    let active = true
    workspaceService
      .assignmentTimes()
      .then(res => {
        if (!active) return
        const next: Record<string, string> = {}
        for (const item of res?.items || []) {
          const id = String(item?.requirementId || '').trim()
          if (id && item.assignedOn) next[id] = item.assignedOn
        }
        setAssignedOnByRequirementId(next)
      })
      .catch(() => {
        if (active) setAssignedOnByRequirementId({})
      })
    return () => {
      active = false
    }
  }, [])

  const builtRows = useMemo(
    () =>
      buildRequirementTimeline({
        requirements,
        submissions,
        // Locked recruiter portal, or admin/lead Assigned to filter.
        recruiter: effectiveRecruiter,
        clientFilter: 'All',
        requirementFilter: 'All',
        datePreset: period,
        customStart: periodStart,
        customEnd: periodEnd,
        assignedOnByRequirementId,
      }),
    [
      requirements,
      submissions,
      effectiveRecruiter,
      period,
      periodStart,
      periodEnd,
      assignedOnByRequirementId,
    ],
  )

  const rows = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase()
    if (!q) return builtRows
    return builtRows.filter(row => row.searchText.includes(q))
  }, [builtRows, deferredSearch])

  const filterKey = `${period}|${periodStart}|${periodEnd}|${deferredSearch}|${pageSize}|${assignedToId}`
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey)
  if (appliedFilterKey !== filterKey) {
    setAppliedFilterKey(filterKey)
    if (page !== 1) setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visible = rows.slice((safePage - 1) * pageSize, safePage * pageSize)
  const searchPending = deferredSearch !== search

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6B3BF6]" />
          Requirement timeline
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {recruiter
            ? 'Requirements assigned to you: when each one arrived, when it was assigned, and when the first submission happened.'
            : 'When the requirement arrived, when it was assigned, and when the first submission happened.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
            Search
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Requirement ID or client name"
              className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6]"
            />
          </div>
        </div>
        {showAssigneeFilter && (
          <div className="lg:w-56">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Assigned to
            </label>
            <select
              value={assignedToId}
              onChange={e => setAssignedToId(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6]"
            >
              <option value="all">All users</option>
              {assigneeOptions.map(opt => (
                <option key={opt.id || opt.name} value={opt.id || opt.name}>
                  {opt.name}
                  {opt.email ? ` (${opt.email})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="lg:w-48">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
            Time period
          </label>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value as DatePreset)}
            className="w-full appearance-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6]"
          >
            {PERIODS.map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={periodStart}
            onChange={e => setPeriodStart(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700"
          />
          <span className="text-xs text-slate-400 font-bold">to</span>
          <input
            type="date"
            value={periodEnd}
            onChange={e => setPeriodEnd(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700"
          />
        </div>
      )}

      <div className={`overflow-x-auto border border-slate-200/80 rounded-2xl ${searchPending ? 'opacity-70' : ''}`}>
        <table className="w-full text-left border-collapse text-xs min-w-[1080px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">Requirement</th>
              <th className="py-3 px-3">Came in</th>
              <th className="py-3 px-3">Assigned to</th>
              <th className="py-3 px-3">Assigned on</th>
              <th className="py-3 px-3">First submission</th>
              <th className="py-3 px-3">First submitted by</th>
              <th className="py-3 px-3 text-center">Submissions</th>
              <th className="py-3 px-3 text-center">To assign</th>
              <th className="py-3 px-3 text-center">To first submission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-semibold">
                  {search.trim()
                    ? 'No requirements match that ID or client name in this time period.'
                    : recruiter
                      ? 'No requirements assigned to you arrived in this time period.'
                      : assigneeFilter
                        ? `No requirements assigned to ${assigneeFilter.name} arrived in this time period.`
                        : 'No requirements arrived in this time period.'}
                </td>
              </tr>
            ) : (
              visible.map(row => (
                <tr key={row.id} className="hover:bg-purple-50/40">
                  <td className="py-3 px-3 max-w-[220px]">
                    <div className="font-mono font-bold text-blue-700">{row.code}</div>
                    <div className="font-bold text-slate-900 truncate" title={row.title}>{row.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{row.client}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-700">{row.arrivedLabel}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-lg border text-[11px] font-bold ${
                        row.state === 'waiting_assignment'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}
                    >
                      {row.assignedTo}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-700">{row.assignedLabel}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {row.state === 'submitted' ? (
                      <span className="font-bold text-emerald-800">{row.firstSubmissionLabel}</span>
                    ) : (
                      <span className="text-slate-400 font-semibold">
                        {row.state === 'waiting_assignment' ? '—' : 'No submission yet'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {row.state === 'submitted' ? (
                      <span className="font-bold text-slate-800">{row.firstSubmissionBy}</span>
                    ) : (
                      <span className="text-slate-400 font-semibold">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    {row.submissionCount}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-[#5B51D8]">{row.assignGap}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800">{row.submissionGap}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80">
        <PaginationFooter
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={rows.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[8, 10, 15, 20, 30]}
          itemLabel="requirements"
        />
      </div>
    </div>
  )
})
