import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  Download,
  FileSpreadsheet,
  Filter,
  User,
  Users,
  Send,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { getSessionUser } from '../../../store/session'
import { candidatesService, offersService } from '../../../services/workspace.service'
import { dispatchNotificationNavigate } from '../../../utils/notificationNavigation'
import { nameMatches, normIdentity } from '../../../utils/recruiterOwnership'
import {
  buildRecruiterOptions,
  computeIndividualPerformance,
  requirementsAssignedTo,
  requirementsForFilters,
  resolveDateRange,
  uniqueClients,
} from './computePerformance'
import { exportRecruiterPerformanceExcel } from './exportExcel'
import { RequirementTimelineSection } from './RequirementTimelineSection'
import {
  ALL_RECRUITERS_ID,
  type DatePreset,
  type OfferLike,
  type RecruiterIndividualAnalyticsProps,
  type SourcedRow,
} from './types'

/** Sum repository day counts that fall inside one chart week (local calendar days). */
function sourcedInWeek(days: Record<string, number>, weekStart?: string, weekEnd?: string): number {
  if (!weekStart || !weekEnd) return 0
  const start = new Date(weekStart)
  const end = new Date(weekEnd)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0
  const cursor = new Date(start)
  cursor.setHours(12, 0, 0, 0)
  const last = new Date(end)
  last.setHours(12, 0, 0, 0)
  let total = 0
  while (cursor <= last) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    total += days[key] || 0
    cursor.setDate(cursor.getDate() + 1)
  }
  return total
}

function datePresetLabel(preset: DatePreset, start?: string, end?: string): string {
  if (preset === 'custom') return `Custom_${start || 'start'}_${end || 'end'}`
  if (preset === 'all') return 'All_Time'
  if (preset === 'today') return 'Today'
  if (preset === '7_days') return 'Last_7_Days'
  if (preset === '30_days') return 'Last_30_Days'
  if (preset === 'this_month') return 'This_Month'
  return preset
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  onClick,
}: {
  label: string
  value: number | string
  hint: string
  icon: React.ReactNode
  onClick?: () => void
}) {
  const clickable = typeof onClick === 'function'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 flex items-center justify-between text-left w-full transition-colors ${
        clickable
          ? 'hover:border-[#6B3BF6] cursor-pointer'
          : 'cursor-default'
      }`}
      title={clickable ? `Open ${label}` : undefined}
    >
      <div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
        <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{value}</p>
        <span className="text-[10px] text-[#6B3BF6] font-semibold mt-0.5 block">{hint}</span>
      </div>
      <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6B3BF6] shrink-0">
        {icon}
      </div>
    </button>
  )
}

export function RecruiterIndividualAnalyticsPage({
  role = 'recruiter',
  requirements = [],
  submissions = [],
  interviews = [],
  recruiters = [],
  candidates = [],
  currentUserName,
  currentUserEmail,
  currentUserId,
  onNavigateReportsTab,
}: RecruiterIndividualAnalyticsProps) {
  const session = getSessionUser()
  const me = {
    id: currentUserId || session?.id || (session as any)?.userId || '',
    email: currentUserEmail || session?.email || '',
    name: currentUserName || session?.name || '',
  }

  const recruiterOptions = useMemo(
    () => buildRecruiterOptions(recruiters, role, me),
    [recruiters, role, me.id, me.email, me.name],
  )

  const [recruiterId, setRecruiterId] = useState('')
  const [clientFilter, setClientFilter] = useState('All')
  const [requirementFilter, setRequirementFilter] = useState('All')
  // Default "All" so Onboarding / Rejected match Workspace current pipeline state.
  const [datePreset, setDatePreset] = useState<DatePreset>('all')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [offers, setOffers] = useState<OfferLike[]>([])
  const [sourcedCountByUserId, setSourcedCountByUserId] = useState<Record<string, number>>({})
  const [sourcedGrandTotal, setSourcedGrandTotal] = useState<number | null>(null)
  const [liveSourcedTotal, setLiveSourcedTotal] = useState<number | null>(null)
  /** Day -> sourced profile count for the chart. Null until the repository responds. */
  const [sourcedByDay, setSourcedByDay] = useState<Record<string, number> | null>(null)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!recruiterId && recruiterOptions.length > 0) {
      setRecruiterId(recruiterOptions[0].id || recruiterOptions[0].name)
    }
  }, [recruiterOptions, recruiterId])

  useEffect(() => {
    let cancelled = false
    offersService
      .list()
      .then((rows: any) => {
        if (!cancelled && Array.isArray(rows)) setOffers(rows as OfferLike[])
      })
      .catch(() => {
        if (!cancelled) setOffers([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Authoritative Candidate Repository counts (same sourced-by API as workspace).
  useEffect(() => {
    let active = true
    candidatesService
      .sourcedCounts()
      .then(res => {
        if (!active) return
        setSourcedCountByUserId(res.counts || {})
        const total = Number(res.total || 0)
        setSourcedGrandTotal(Number.isFinite(total) && total >= 0 ? total : null)
      })
      .catch(() => {
        if (active) {
          setSourcedCountByUserId({})
          setSourcedGrandTotal(null)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const canViewAllRecruiters = ['superadmin', 'admin', 'devteam'].includes(
    String(role || '').toLowerCase(),
  )
  const isAllRecruiters = canViewAllRecruiters && recruiterId === ALL_RECRUITERS_ID

  const selectedRecruiter = useMemo(() => {
    if (isAllRecruiters) {
      return { id: ALL_RECRUITERS_ID, name: 'All Recruiters', allRecruiters: true as const }
    }
    return (
      recruiterOptions.find(r => r.id === recruiterId || r.name === recruiterId) ||
      recruiterOptions[0] ||
      null
    )
  }, [recruiterOptions, recruiterId, isAllRecruiters])

  /** Resolve Mongo user id so sourced-counts / sourced-by keys match History. */
  const selectedRecruiterUserId = useMemo(() => {
    if (isAllRecruiters || !selectedRecruiter) return ''
    const direct = String(selectedRecruiter.id || '').trim()
    if (direct && typeof sourcedCountByUserId[direct] === 'number') return direct

    const match = (recruiters || []).find(
      r =>
        (direct && (String(r._id || '') === direct || String(r.id || '') === direct)) ||
        (selectedRecruiter.email && normIdentity(r.email) === normIdentity(selectedRecruiter.email)) ||
        nameMatches(r.name, selectedRecruiter.name),
    )
    const mongoId = String(match?._id || match?.id || direct || me.id || '').trim()
    return mongoId
  }, [selectedRecruiter, recruiters, sourcedCountByUserId, me.id, isAllRecruiters])

  const lockRecruiter = String(role || '').toLowerCase() === 'recruiter'

  const scopedRecruiter = useMemo(() => {
    if (!selectedRecruiter) return null
    if (selectedRecruiter.allRecruiters) return selectedRecruiter
    return {
      ...selectedRecruiter,
      id: selectedRecruiterUserId || selectedRecruiter.id,
      ids: [
        selectedRecruiter.id,
        selectedRecruiterUserId,
        ...((recruiters || [])
          .filter(
            r =>
              String(r._id || '') === selectedRecruiterUserId ||
              String(r.id || '') === selectedRecruiterUserId ||
              String(r._id || '') === selectedRecruiter.id ||
              String(r.id || '') === selectedRecruiter.id ||
              (selectedRecruiter.email &&
                normIdentity(r.email) === normIdentity(selectedRecruiter.email)) ||
              nameMatches(r.name, selectedRecruiter.name),
          )
          .flatMap(r => [String(r._id || ''), String(r.id || '')])),
      ].filter(Boolean),
    }
  }, [selectedRecruiter, selectedRecruiterUserId, recruiters])

  /** Recruiter portal sees only requirements assigned to that user. */
  const pageRequirements = useMemo(() => {
    if (!lockRecruiter) return requirements
    if (!scopedRecruiter || scopedRecruiter.allRecruiters) return []
    return requirementsAssignedTo(requirements, scopedRecruiter)
  }, [lockRecruiter, requirements, scopedRecruiter])

  const clients = useMemo(
    () => uniqueClients(pageRequirements, lockRecruiter ? [] : submissions),
    [pageRequirements, lockRecruiter, submissions],
  )
  const requirementOptions = useMemo(
    () => requirementsForFilters(pageRequirements, clientFilter),
    [pageRequirements, clientFilter],
  )

  // Live per-recruiter sourced total for the selected date period (createdAt from/to).
  useEffect(() => {
    const id = selectedRecruiterUserId
    if (!id) {
      setLiveSourcedTotal(null)
      return
    }
    const { start, end } = resolveDateRange(datePreset, customStart, customEnd)
    const from = start ? start.toISOString() : undefined
    const to = end ? end.toISOString() : undefined
    const allTimeHint =
      typeof sourcedCountByUserId[id] === 'number' ? sourcedCountByUserId[id] : null
    // Clear immediately so switching Today/7d/30d never keeps a previous period's total.
    setLiveSourcedTotal(null)
    let active = true

    const inPeriod = (raw: any) => {
      if (!start && !end) return true
      const created = raw?.createdAt || raw?.submissionDate || raw?.sourcedAt || raw?.updatedAt
      if (!created) return false
      const d = new Date(created)
      if (Number.isNaN(d.getTime())) return false
      if (start && d < start) return false
      if (end && d > end) return false
      return true
    }

    /** If server ignored from/to (old dist), page and count by createdAt locally. */
    const countClientSideInPeriod = async () => {
      const pageSize = 100
      let page = 1
      let totalPages = 1
      let count = 0
      while (page <= totalPages && page <= 50) {
        const res = await candidatesService.listSourcedBy(id, { page, limit: pageSize })
        totalPages = Math.max(1, Number(res.totalPages || 1))
        for (const item of res.items || []) {
          if (inPeriod(item)) count += 1
        }
        if (!res.items?.length) break
        page += 1
      }
      return count
    }

    candidatesService
      .listSourcedBy(id, { page: 1, limit: 1, from, to })
      .then(async res => {
        if (!active) return
        let total = Number(res.total || 0)
        if (!Number.isFinite(total) || total < 0) total = 0
        // Bounded period + total still equals all-time → server likely ignored from/to.
        if (
          (from || to) &&
          allTimeHint != null &&
          allTimeHint > 0 &&
          total === allTimeHint
        ) {
          try {
            total = await countClientSideInPeriod()
          } catch {
            total = 0
          }
        }
        if (!active) return
        setLiveSourcedTotal(total)
      })
      .catch(async () => {
        if (!active) return
        if (from || to) {
          try {
            const total = await countClientSideInPeriod()
            if (active) setLiveSourcedTotal(total)
          } catch {
            if (active) setLiveSourcedTotal(0)
          }
          return
        }
        candidatesService
          .listPage({ page: 1, limit: 1, createdBy: id })
          .then(res => {
            if (!active) return
            const total = Number(res.total || 0)
            setLiveSourcedTotal(Number.isFinite(total) && total >= 0 ? total : 0)
          })
          .catch(() => {
            if (active) setLiveSourcedTotal(0)
          })
      })
    return () => {
      active = false
    }
  }, [selectedRecruiterUserId, datePreset, customStart, customEnd, sourcedCountByUserId])

  // Green line uses Candidate Repository createdAt, same source as the Sourced KPI.
  // The workspace candidate list is only a first page, so it cannot draw this series.
  useEffect(() => {
    if (!isAllRecruiters && !selectedRecruiterUserId) {
      setSourcedByDay(null)
      return
    }
    const { start, end } = resolveDateRange(datePreset, customStart, customEnd)
    const windowStart = new Date()
    windowStart.setHours(0, 0, 0, 0)
    windowStart.setDate(windowStart.getDate() - 41)
    const windowEnd = new Date()
    windowEnd.setHours(23, 59, 59, 999)
    const from = start && start > windowStart ? start : windowStart
    const to = end && end < windowEnd ? end : windowEnd
    if (to < from) {
      setSourcedByDay({})
      return
    }
    let active = true
    setSourcedByDay(null)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
    candidatesService
      .sourcedTrend({
        from: from.toISOString(),
        to: to.toISOString(),
        recruiterId: isAllRecruiters ? undefined : selectedRecruiterUserId,
        timezone,
      })
      .then(days => {
        if (!active) return
        const map: Record<string, number> = {}
        for (const row of days) {
          const date = String(row?.date || '').trim()
          if (date) map[date] = Number(row.count) || 0
        }
        setSourcedByDay(map)
      })
      .catch(() => {
        if (active) setSourcedByDay(null)
      })
    return () => {
      active = false
    }
  }, [isAllRecruiters, selectedRecruiterUserId, datePreset, customStart, customEnd])

  const periodHasDateBounds = useMemo(() => {
    const { start, end } = resolveDateRange(datePreset, customStart, customEnd)
    return Boolean(start || end)
  }, [datePreset, customStart, customEnd])

  const authoritativeSourcedCount = useMemo(() => {
    // All Recruiters + All Time uses the company sourced total. A date period stays on in-memory rows.
    if (isAllRecruiters) {
      if (!periodHasDateBounds && typeof sourcedGrandTotal === 'number') return sourcedGrandTotal
      return null
    }
    // Period-scoped API total (including 0 for empty Today / 7d / 30d).
    if (typeof liveSourcedTotal === 'number') return liveSourcedTotal
    // All-time map only when All Time is selected and live total not ready yet.
    if (!periodHasDateBounds) {
      const id = selectedRecruiterUserId
      if (id && typeof sourcedCountByUserId[id] === 'number') return sourcedCountByUserId[id]
    }
    return null
  }, [
    selectedRecruiterUserId,
    sourcedCountByUserId,
    liveSourcedTotal,
    periodHasDateBounds,
    isAllRecruiters,
    sourcedGrandTotal,
  ])

  const baseReport = useMemo(
    () =>
      computeIndividualPerformance({
        recruiter: scopedRecruiter,
        requirements: pageRequirements,
        submissions,
        interviews,
        candidates,
        offers,
        clientFilter,
        requirementFilter,
        datePreset,
        customStart,
        customEnd,
      }),
    [
      scopedRecruiter,
      pageRequirements,
      submissions,
      interviews,
      candidates,
      offers,
      clientFilter,
      requirementFilter,
      datePreset,
      customStart,
      customEnd,
    ],
  )

  // Override sourced KPI/funnel with period-scoped repository totals.
  const report = useMemo(() => {
    const sourcedTotal =
      typeof authoritativeSourcedCount === 'number'
        ? authoritativeSourcedCount
        : isAllRecruiters
          ? baseReport.kpis.sourcedProfiles
          : periodHasDateBounds
            ? 0 // loading a bounded period — never flash all-time 883
            : baseReport.kpis.sourcedProfiles
    return {
      ...baseReport,
      kpis: {
        ...baseReport.kpis,
        sourcedProfiles: sourcedTotal,
      },
      chartFunnel: baseReport.chartFunnel.map(row =>
        row.name === 'Sourced' ? { ...row, value: sourcedTotal } : row,
      ),
    }
  }, [baseReport, authoritativeSourcedCount, periodHasDateBounds, isAllRecruiters])

  const showToast = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }

  const recruiterNameForFilter = String(selectedRecruiter?.name || '').trim()

  const goReportsTab = (
    tab: 'submissions' | 'interviews' | 'reports',
    extras?: {
      interviewStatusToggle?: 'upcoming' | 'completed' | 'rejections' | 'all' | 'onboarding'
      submissionsStatus?: string
      submissionsRecruiter?: string
    },
  ) => {
    // Always dispatch so Submissions / Interview Tracking apply pending filters even when
    // already on the Reports page (onNavigateReportsTab alone does not remount listeners).
    dispatchNotificationNavigate({
      navKey: 'Reports',
      reportsTab: tab,
      interviewStatusToggle: extras?.interviewStatusToggle,
      submissionsStatus: extras?.submissionsStatus,
      submissionsRecruiter: extras?.submissionsRecruiter,
      returnToReportsAnalytics: tab !== 'reports',
    })
    if (onNavigateReportsTab) onNavigateReportsTab(tab)
  }

  /** Map funnel / chart / KPI clicks to the same destinations as My Workspace / History. */
  const navigateFromMetric = (label: string) => {
    const n = String(label || '').toLowerCase()

    // Sourced → that recruiter's Candidate Repository for the selected period only.
    if (n.includes('sourced')) {
      const { start, end } = resolveDateRange(datePreset, customStart, customEnd)
      dispatchNotificationNavigate({
        navKey: 'Candidates',
        sourcedByUserId: isAllRecruiters ? undefined : selectedRecruiterUserId || undefined,
        sourcedFrom: start ? start.toISOString() : undefined,
        sourcedTo: end ? end.toISOString() : undefined,
        returnToReportsAnalytics: true,
      })
      return
    }

    // Onboarding / Offers / Joined → Total Submissions + Selected (same as My Workspace Onboarding).
    if (n.includes('onboard') || n.includes('offer') || (n.includes('joined') && !n.includes('not'))) {
      goReportsTab('submissions', {
        submissionsStatus: 'Selected',
        submissionsRecruiter: isAllRecruiters ? undefined : recruiterNameForFilter || undefined,
      })
      return
    }

    // Not Joined → Interview Tracking Onboarding track (offer outcomes).
    if (n.includes('not joined') || n.includes('not-joined') || n.includes('notjoined')) {
      goReportsTab('interviews', { interviewStatusToggle: 'onboarding' })
      return
    }

    // Rejected → Interview Tracking Rejections track.
    if (n.includes('rejected') || n.includes('rejection')) {
      goReportsTab('interviews', { interviewStatusToggle: 'rejections' })
      return
    }

    // Selected (interview outcome card) → completed / selected interviews.
    if (n.includes('selected') && !n.includes('requirement')) {
      goReportsTab('interviews', { interviewStatusToggle: 'completed' })
      return
    }

    if (n.includes('submitted') || n.includes('submission')) {
      goReportsTab('submissions', {
        submissionsRecruiter: isAllRecruiters ? undefined : recruiterNameForFilter || undefined,
      })
      return
    }

    if (n.includes('interview') || n.includes('pending')) {
      goReportsTab('interviews', { interviewStatusToggle: 'all' })
      return
    }

    if (n.includes('assigned')) {
      const { start, end } = resolveDateRange(datePreset, customStart, customEnd)
      if (isAllRecruiters) {
        dispatchNotificationNavigate({
          navKey: 'Requirements',
          requirementsFrom: start ? start.toISOString() : undefined,
          requirementsTo: end ? end.toISOString() : undefined,
          returnToReportsAnalytics: true,
        })
        return
      }
      const assigneeIds = [
        selectedRecruiterUserId,
        selectedRecruiter?.id,
        ...(selectedRecruiter?.ids || []),
      ]
        .map(id => String(id || '').trim())
        .filter(Boolean)
      dispatchNotificationNavigate({
        navKey: 'Requirements',
        requirementsAssigneeIds: Array.from(new Set(assigneeIds)).join(','),
        requirementsAssigneeName: recruiterNameForFilter || undefined,
        requirementsFrom: start ? start.toISOString() : undefined,
        requirementsTo: end ? end.toISOString() : undefined,
        returnToReportsAnalytics: true,
      })
      return
    }
    if (n.includes('requirement') || n.includes('unassigned') || n.includes('total req')) {
      dispatchNotificationNavigate({ navKey: 'Requirements', returnToReportsAnalytics: true })
      return
    }
  }

  const handleFunnelClick = (state: any) => {
    const name =
      state?.activePayload?.[0]?.payload?.name ||
      state?.activeLabel ||
      state?.name
    if (name) navigateFromMetric(String(name))
  }

  const handleInterviewChartClick = () => {
    navigateFromMetric('Interviews')
  }

  const mapApiCandidateToSourcedRow = (raw: any): SourcedRow => {
    const created =
      raw?.createdAt || raw?.submissionDate || raw?.updatedAt || raw?.sourcedAt || ''
    let createdLabel = '—'
    if (created) {
      const d = new Date(created)
      if (!Number.isNaN(d.getTime())) {
        createdLabel = d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      }
    }
    return {
      id: String(raw?._id || raw?.id || raw?.candidateId || raw?.email || raw?.name || Math.random()),
      name: String(raw?.name || raw?.candidateName || '—'),
      email: raw?.email ? String(raw.email) : undefined,
      skills: (() => {
        const s = raw?.skills || raw?.technologies || raw?.primarySkill
        if (Array.isArray(s)) return s.filter(Boolean).join(', ') || undefined
        const text = String(s || '').trim()
        return text || undefined
      })(),
      status: raw?.status ? String(raw.status) : undefined,
      createdLabel,
    }
  }

  const fetchAllSourcedForExport = async (userId: string): Promise<SourcedRow[]> => {
    const id = String(userId || '').trim()
    if (!id) return []
    const { start, end } = resolveDateRange(datePreset, customStart, customEnd)
    const from = start ? start.toISOString() : undefined
    const to = end ? end.toISOString() : undefined
    const inPeriod = (raw: any) => {
      if (!start && !end) return true
      const created = raw?.createdAt || raw?.submissionDate || raw?.sourcedAt || ''
      if (!created) return false
      const d = new Date(created)
      if (Number.isNaN(d.getTime())) return false
      if (start && d < start) return false
      if (end && d > end) return false
      return true
    }
    const pageSize = 100
    let page = 1
    let totalPages = 1
    const rows: SourcedRow[] = []
    while (page <= totalPages && page <= 50) {
      const res = await candidatesService.listSourcedBy(id, { page, limit: pageSize, from, to })
      totalPages = Math.max(1, Number(res.totalPages || 1))
      for (const item of res.items || []) {
        if (!inPeriod(item)) continue
        rows.push(mapApiCandidateToSourcedRow(item))
      }
      if (!res.items?.length) break
      page += 1
    }
    return rows
  }

  const handleExport = async () => {
    if (!report.recruiter) {
      showToast('Select a recruiter first')
      return
    }
    try {
      setExporting(true)
      let sourcedRows = report.sourced
      if (selectedRecruiterUserId) {
        try {
          sourcedRows = await fetchAllSourcedForExport(selectedRecruiterUserId)
        } catch {
          /* keep compute fallback */
        }
      }
      await exportRecruiterPerformanceExcel({
        report: {
          ...report,
          sourced: sourcedRows,
          kpis: {
            ...report.kpis,
            sourcedProfiles:
              typeof authoritativeSourcedCount === 'number'
                ? authoritativeSourcedCount
                : sourcedRows.length || report.kpis.sourcedProfiles,
          },
        },
        filters: {
          client: clientFilter,
          requirement: requirementFilter === 'All' ? 'All Requirements' : requirementFilter,
          dateLabel: datePresetLabel(datePreset, customStart, customEnd),
          customStart,
          customEnd,
        },
      })
      showToast('Excel downloaded with full details for the selected period')
    } catch (err) {
      console.error(err)
      showToast('Excel export failed')
    } finally {
      setExporting(false)
    }
  }

  const k = report.kpis
  const sourcedTrend = useMemo(
    () =>
      sourcedByDay
        ? report.chartWeekly.map(week => ({
            ...week,
            sourced: sourcedInWeek(sourcedByDay, week.weekStart, week.weekEnd),
          }))
        : report.chartWeekly,
    [report.chartWeekly, sourcedByDay],
  )
  const trendMax = Math.max(
    1,
    ...sourcedTrend.map(week => Math.max(Number(week.sourced) || 0, Number(week.submitted) || 0)),
  )

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#6B3BF6]" />
              <span>Individual Recruiter Performance Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Customize filters, click graphs to open the matching page, and download full Excel details for the selected period.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || !report.recruiter}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#6B3BF6] hover:bg-[#5833E0] text-white shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Preparing Excel…' : 'Download Excel'}</span>
            <FileSpreadsheet className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <User className="w-3 h-3" /> Individual Recruiter
            </label>
            <select
              value={recruiterId}
              disabled={lockRecruiter}
              onChange={e => setRecruiterId(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] disabled:bg-slate-50"
            >
              {canViewAllRecruiters && (
                <option value={ALL_RECRUITERS_ID}>All Recruiters</option>
              )}
              {recruiterOptions.map(r => (
                <option key={r.id || r.name} value={r.id || r.name}>
                  {r.name}
                  {r.email ? ` (${r.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Building2 className="w-3 h-3" /> Client
            </label>
            <select
              value={clientFilter}
              onChange={e => {
                setClientFilter(e.target.value)
                setRequirementFilter('All')
              }}
              className="w-full appearance-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6]"
            >
              <option value="All">All Clients</option>
              {clients.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Briefcase className="w-3 h-3" /> Requirement
            </label>
            <select
              value={requirementFilter}
              onChange={e => setRequirementFilter(e.target.value)}
              className="w-full appearance-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6]"
            >
              <option value="All">All Requirements</option>
              {requirementOptions.map(r => (
                <option key={r.id} value={String(r.reqCode || r.id)}>
                  {r.reqCode || r.id} — {r.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Date Period
            </label>
            <select
              value={datePreset}
              onChange={e => setDatePreset(e.target.value as DatePreset)}
              className="w-full appearance-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6]"
            >
              <option value="today">Today</option>
              <option value="7_days">Last 7 Days</option>
              <option value="30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-[11px] font-bold text-[#6B3BF6] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <span>
                {isAllRecruiters ? (
                  <>Showing data for <strong>all recruiters</strong></>
                ) : (
                  <>
                    Showing data for <strong>{selectedRecruiter?.name || '—'}</strong> only
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-700"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Requirements"
          value={k.totalRequirementsInScope}
          hint="Click to open Requirements"
          icon={<Briefcase className="w-5 h-5" />}
          onClick={() => navigateFromMetric('Total Requirements')}
        />
        <KpiCard
          label="Assigned to Recruiter"
          value={k.assignedToRecruiter}
          hint={`${k.unassignedInScope} unassigned in scope`}
          icon={<Users className="w-5 h-5" />}
          onClick={() => navigateFromMetric('Assigned')}
        />
        <KpiCard
          label="Sourced Profiles"
          value={k.sourcedProfiles}
          hint="Candidate Repository total"
          icon={<User className="w-5 h-5" />}
          onClick={() => navigateFromMetric('Sourced')}
        />
        <KpiCard
          label="Submitted Profiles"
          value={k.submittedProfiles}
          hint="Click to open Total Submissions"
          icon={<Send className="w-5 h-5" />}
          onClick={() => navigateFromMetric('Submitted')}
        />
        <KpiCard
          label="Interviews"
          value={k.interviewTotal}
          hint={`L1 ${k.interviewL1} · L2 ${k.interviewL2} · Final ${k.interviewFinal}`}
          icon={<UserCheck className="w-5 h-5" />}
          onClick={() => navigateFromMetric('Interviews')}
        />
        <KpiCard
          label="Selected / Rejected"
          value={`${k.interviewSelected} / ${k.interviewRejected}`}
          hint={
            k.interviewRejected > 0 && k.interviewSelected === 0
              ? 'Open Rejections Track'
              : `${k.interviewPending} pending — Selected opens completed; Rejected opens rejections`
          }
          icon={<CheckCircle2 className="w-5 h-5" />}
          onClick={() =>
            navigateFromMetric(
              k.interviewRejected > 0 && k.interviewSelected === 0 ? 'Rejected' : 'Selected',
            )
          }
        />
        <KpiCard
          label="Offers / Onboarding"
          value={k.offeredCount}
          hint={`${k.joinedCount} joined — open Submissions (Selected)`}
          icon={<FileSpreadsheet className="w-5 h-5" />}
          onClick={() => navigateFromMetric('Onboarding')}
        />
        <KpiCard
          label="Not Joined"
          value={k.notJoinedCount}
          hint="Open Interview Tracking · Onboarding"
          icon={<AlertTriangle className="w-5 h-5" />}
          onClick={() => navigateFromMetric('Not Joined')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">Performance Funnel</h3>
          <p className="text-[11px] text-slate-500 mb-3">Click a bar to open that area (e.g. Submitted → Total Submissions).</p>
          <div className="h-64 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.chartFunnel} onClick={handleFunnelClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#6B3BF6"
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    const name = data?.name || data?.payload?.name
                    if (name) navigateFromMetric(String(name))
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">Interview Outcomes by Round</h3>
          <p className="text-[11px] text-slate-500 mb-3">Click chart to open Interview Tracking.</p>
          <div className="h-64 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.chartInterviews} onClick={handleInterviewChartClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="selected" stackId="a" fill="#10b981" name="Selected" cursor="pointer" />
                <Bar dataKey="rejected" stackId="a" fill="#f43f5e" name="Rejected" cursor="pointer" />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs xl:col-span-2">
          <h3 className="text-sm font-extrabold text-slate-900 mb-1">Sourced vs Submitted</h3>
          <p className="text-[11px] text-slate-500 mb-3">
            Green line is profiles sourced. Red line is profiles submitted. Click a line to open that page.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sourcedTrend}>
                <CartesianGrid stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#111827' }} tickLine={false} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#111827' }}
                  tickLine={false}
                  domain={[0, trendMax]}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sourced"
                  name="Sourced"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#9ca3af', stroke: '#9ca3af' }}
                  activeDot={{ r: 6, fill: '#16a34a', stroke: '#16a34a' }}
                  cursor="pointer"
                  onClick={() => navigateFromMetric('Sourced')}
                />
                <Line
                  type="monotone"
                  dataKey="submitted"
                  name="Submitted"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#9ca3af', stroke: '#9ca3af' }}
                  activeDot={{ r: 6, fill: '#e11d48', stroke: '#e11d48' }}
                  cursor="pointer"
                  onClick={() => navigateFromMetric('Submitted')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RequirementTimelineSection
        requirements={pageRequirements}
        submissions={submissions}
        recruiter={lockRecruiter ? scopedRecruiter : null}
      />

      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl px-4 py-3 text-[11px] text-slate-500 font-medium">
        Full row-level details (requirements, sourced, submitted, non-submitted, interviews, offers) are included in the Excel download only — not shown on this page.
      </div>

      {toast && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium">
          {toast}
        </div>
      )}
    </div>
  )
}
