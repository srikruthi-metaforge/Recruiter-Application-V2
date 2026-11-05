import type { Candidate, Interview, Recruiter, Requirement, Submission } from '../../../types'
import {
  nameMatches,
  ownsByRecruiter,
  requirementAssignedToRecruiter,
} from '../../../utils/recruiterOwnership'
import {
  isOnboardingStage,
  isPlacedStage,
  isRejectedSubmissionStage,
} from '../../../utils/submissionStatusFilter'
import { interviewOutcomeFromStatus } from '../../../utils/interviewStatus'
import { getRequirementDate } from '../requirements/useRequirementsPageHandlers3'
import type {
  DatePreset,
  InterviewBucket,
  InterviewRow,
  NonSubmittedRow,
  OfferLike,
  OnboardingRow,
  PerformanceKpis,
  PerformanceReport,
  RecruiterOption,
  RequirementRow,
  SourcedRow,
  SubmittedRow,
} from './types'

function toDate(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export function resolveDateRange(
  preset: DatePreset,
  customStart?: string,
  customEnd?: string,
): { start: Date | null; end: Date | null } {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  if (preset === 'all') return { start: null, end: null }
  if (preset === 'today') return { start: todayStart, end: todayEnd }
  if (preset === '7_days') {
    const start = new Date(todayStart)
    start.setDate(start.getDate() - 6)
    return { start, end: todayEnd }
  }
  if (preset === '30_days') {
    const start = new Date(todayStart)
    start.setDate(start.getDate() - 29)
    return { start, end: todayEnd }
  }
  if (preset === 'this_month') {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: todayEnd }
  }
  if (preset === 'custom') {
    const start = customStart ? startOfDay(new Date(`${customStart}T00:00:00`)) : null
    const end = customEnd ? endOfDay(new Date(`${customEnd}T23:59:59`)) : null
    return {
      start: start && !Number.isNaN(start.getTime()) ? start : null,
      end: end && !Number.isNaN(end.getTime()) ? end : null,
    }
  }
  return { start: null, end: null }
}

function inRange(raw: string | undefined | null, start: Date | null, end: Date | null): boolean {
  if (!start && !end) return true
  const d = toDate(raw)
  if (!d) return false
  if (start && d < start) return false
  if (end && d > end) return false
  return true
}

function reqReceivedDate(r: Requirement): string {
  const d = getRequirementDate(r)
  return d ? d.toISOString() : ''
}

function formatDateLabel(raw?: string | null): string {
  const d = toDate(raw || '')
  if (!d) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function recruiterIdentity(opt: RecruiterOption) {
  return { id: opt.id, email: opt.email, name: opt.name }
}

/** Assigned to this recruiter by id, name, or email (same idea as History). */
function requirementAssignedToOption(req: Requirement, recruiter: RecruiterOption): boolean {
  if (req.assignmentStatus === 'Unassigned') return false
  const ids = new Set(
    (Array.isArray(req.assignedRecruiterIds) ? req.assignedRecruiterIds : [])
      .map(id => String(id || '').trim())
      .filter(Boolean),
  )
  const myIds = [recruiter.id, ...(recruiter.ids || [])]
    .map(id => String(id || '').trim())
    .filter(Boolean)
  if (myIds.some(id => ids.has(id))) return true

  const names = String(req.assignedRecruiterNames || req.owner || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)
  if (recruiter.name && names.some(n => nameMatches(n, recruiter.name))) return true
  const email = String(recruiter.email || '').trim().toLowerCase()
  if (email && names.some(n => n.toLowerCase() === email)) return true
  // Id-only match already failed; don't treat a populated id list as assigned.
  if (ids.size > 0) return false
  return requirementAssignedToRecruiter(req, recruiterIdentity(recruiter))
}

function submissionOwnedBy(sub: Submission, recruiter: RecruiterOption): boolean {
  return ownsByRecruiter(
    {
      id: sub.recruiterId || (sub as any).recruiterUserId,
      email: (sub as any).recruiterEmail,
      name: sub.recruiter || (sub as any).submittedBy,
    },
    recruiterIdentity(recruiter),
  )
}

function candidateOwnedBy(c: Candidate, recruiter: RecruiterOption): boolean {
  const byId = ownsByRecruiter(
    { id: c.sourcedByRecruiterId, name: c.createdByName, email: undefined },
    recruiterIdentity(recruiter),
  )
  if (c.sourcedByRecruiterId || c.createdByName) return byId
  return false
}

export function classifyInterviewBucket(roundOrStage?: string | null): InterviewBucket {
  const r = String(roundOrStage || '').toLowerCase()
  if (r.includes('l1') || r.includes('technical round 1') || r.includes('technical 1') || r.includes('screen')) {
    return 'L1'
  }
  if (r.includes('l2') || r.includes('technical round 2') || r.includes('technical 2')) {
    return 'L2'
  }
  if (
    r.includes('final') ||
    r.includes('client') ||
    r.includes('hr') ||
    r.includes('manager') ||
    r.includes('l3')
  ) {
    return 'Final'
  }
  return 'Other'
}

function interviewOwnedBy(
  iv: Interview,
  recruiter: RecruiterOption,
  submissionsById: Map<string, Submission>,
): boolean {
  if (
    ownsByRecruiter(
      { id: iv.recruiterId, email: iv.recruiterEmail, name: iv.recruiter },
      recruiterIdentity(recruiter),
    )
  ) {
    return true
  }
  const sid = String(iv.submissionId || '')
  if (sid && submissionsById.has(sid)) {
    return submissionOwnedBy(submissionsById.get(sid)!, recruiter)
  }
  return false
}

function emptyKpis(): PerformanceKpis {
  return {
    totalRequirementsInScope: 0,
    assignedToRecruiter: 0,
    unassignedInScope: 0,
    sourcedProfiles: 0,
    submittedProfiles: 0,
    nonSubmittedRequirements: 0,
    interviewTotal: 0,
    interviewL1: 0,
    interviewL2: 0,
    interviewFinal: 0,
    interviewSelected: 0,
    interviewRejected: 0,
    interviewPending: 0,
    offeredCount: 0,
    joinedCount: 0,
    notJoinedCount: 0,
  }
}

export function buildRecruiterOptions(
  recruiters: Recruiter[],
  role: string,
  me: { id?: string; email?: string; name?: string },
): RecruiterOption[] {
  const list = (recruiters || []).map(r => ({
    id: String(r._id || r.id || ''),
    name: r.name,
    email: r.email,
    lead: r.lead,
  })).filter(r => r.id || r.name)

  const roleNorm = String(role || '').toLowerCase()
  if (roleNorm === 'recruiter') {
    const self = list.find(r =>
      ownsByRecruiter({ id: r.id, email: r.email, name: r.name }, me),
    )
    if (self) return [self]
    if (me.name || me.email || me.id) {
      return [{ id: String(me.id || ''), name: me.name || 'Me', email: me.email }]
    }
    return list.slice(0, 1)
  }

  if (roleNorm === 'lead' || roleNorm === 'team lead' || roleNorm === 'team_lead') {
    const myName = me.name || ''
    return list.filter(r => {
      if (ownsByRecruiter({ id: r.id, email: r.email, name: r.name }, me)) return true
      return nameMatches(r.lead, myName)
    })
  }

  return list
}

export function computeIndividualPerformance(args: {
  recruiter: RecruiterOption | null
  requirements: Requirement[]
  submissions: Submission[]
  interviews: Interview[]
  candidates: Candidate[]
  offers?: OfferLike[]
  clientFilter: string
  requirementFilter: string
  datePreset: DatePreset
  customStart?: string
  customEnd?: string
}): PerformanceReport {
  const {
    recruiter,
    requirements,
    submissions,
    interviews,
    candidates,
    offers = [],
    clientFilter,
    requirementFilter,
    datePreset,
    customStart,
    customEnd,
  } = args

  const { start, end } = resolveDateRange(datePreset, customStart, customEnd)
  const empty: PerformanceReport = {
    recruiter,
    kpis: emptyKpis(),
    requirements: [],
    sourced: [],
    submitted: [],
    nonSubmitted: [],
    interviews: [],
    onboarding: [],
    chartFunnel: [],
    chartInterviews: [],
    chartWeekly: [],
  }
  if (!recruiter) return empty

  const clientMatch = (client?: string) => {
    if (!clientFilter || clientFilter === 'All') return true
    return String(client || '').trim().toLowerCase() === clientFilter.trim().toLowerCase()
  }

  const reqIdMatch = (req: Requirement) => {
    if (!requirementFilter || requirementFilter === 'All') return true
    const keys = [req.id, req._id, req.reqCode].map(k => String(k || ''))
    return keys.includes(requirementFilter)
  }

  // Client + requirement filter (assignment is current ownership, not received-date).
  const clientScopedReqs = (requirements || []).filter(r => {
    if (!clientMatch(r.client)) return false
    if (!reqIdMatch(r)) return false
    return true
  })

  // Requirements whose received date falls in the selected period (summary scope).
  const scopedReqs = clientScopedReqs.filter(r => inRange(reqReceivedDate(r), start, end))

  // This recruiter's assigned requirements whose received date is inside the selected period.
  const assignedReqs = clientScopedReqs.filter(
    r => requirementAssignedToOption(r, recruiter) && inRange(reqReceivedDate(r), start, end),
  )
  const unassignedReqs = scopedReqs.filter(r => {
    const ids = Array.isArray(r.assignedRecruiterIds) ? r.assignedRecruiterIds : []
    const names = String(r.assignedRecruiterNames || r.owner || '')
    const emptyIds = ids.length === 0
    const emptyNames = !names.trim() || names.toLowerCase().includes('unassigned')
    return emptyIds && emptyNames
  })

  const submissionsById = new Map<string, Submission>()
  for (const s of submissions || []) {
    submissionsById.set(String(s.id), s)
    if ((s as any)._id) submissionsById.set(String((s as any)._id), s)
  }

  const mySubsAll = (submissions || []).filter(s => submissionOwnedBy(s, recruiter))

  const matchesReqFilter = (s: Submission) => {
    if (!requirementFilter || requirementFilter === 'All') return true
    const keys = [s.requirementId, s.reqCode, s.req, s.id].map(k => String(k || ''))
    if (keys.includes(requirementFilter)) return true
    return scopedReqs.some(r => {
      const rk = [r.id, r._id, r.reqCode].map(String)
      return (
        rk.includes(requirementFilter) &&
        (rk.includes(String(s.requirementId || '')) ||
          rk.includes(String(s.reqCode || '')) ||
          String(s.req || '') === r.title)
      )
    })
  }

  // Client + requirement scoped, no date — current pipeline state (matches My Work KPIs).
  const mySubsScoped = mySubsAll.filter(s => clientMatch(s.client) && matchesReqFilter(s))

  // Period uses the submission date shown in the report — not a later updatedAt.
  const mySubs = mySubsScoped.filter(s =>
    inRange(s.submittedAt || s.date || s.createdAt, start, end),
  )

  const sourced = (candidates || [])
    .filter(c => candidateOwnedBy(c, recruiter))
    .filter(c => inRange(c.submissionDate || (c as any).createdAt, start, end))
    .map<SourcedRow>(c => ({
      id: String(c._id || c.id || c.candidateId || c.name),
      name: c.name,
      email: c.email,
      skills: c.skills || c.technologies,
      status: c.status,
      createdLabel: formatDateLabel(c.submissionDate || (c as any).createdAt),
    }))

  const submittedRows: SubmittedRow[] = mySubs.map(s => ({
    id: s.id,
    candidate: s.candidate,
    requirement: s.req || s.reqCode || s.requirementId || '—',
    client: s.client || '—',
    stage: String(s.stage || '—'),
    submittedOn: formatDateLabel(s.submittedAt || s.createdAt || s.date),
    rejectionReason: String((s as any).rejectionReason || '—'),
  }))

  const subsByReqKey = new Map<string, number>()
  for (const s of mySubs) {
    for (const key of [s.requirementId, s.reqCode, s.req].map(k => String(k || '').trim()).filter(Boolean)) {
      subsByReqKey.set(key, (subsByReqKey.get(key) || 0) + 1)
    }
  }

  const requirementRows: RequirementRow[] = assignedReqs.map(r => {
    const assignedToSelected = true
    const keys = [r.id, r._id, r.reqCode, r.title].map(k => String(k || ''))
    const count = keys.reduce((acc, k) => acc + (subsByReqKey.get(k) || 0), 0)
    return {
      id: String(r.reqCode || r.id),
      title: r.title,
      client: r.client,
      receivedDate: formatDateLabel(reqReceivedDate(r)),
      assignmentStatus: assignedToSelected || (r.assignedRecruiterIds || []).length > 0 || Boolean(r.owner)
        ? 'Assigned'
        : 'Unassigned',
      assignedToSelected,
      status: String(r.status || '—'),
      submissionsByRecruiter: count,
    }
  })

  const nonSubmitted: NonSubmittedRow[] = assignedReqs
    .filter(r => {
      const keys = [r.id, r._id, r.reqCode, r.title].map(k => String(k || ''))
      const count = keys.reduce((acc, k) => acc + (subsByReqKey.get(k) || 0), 0)
      return count === 0
    })
    .map(r => ({
      id: String(r.reqCode || r.id),
      title: r.title,
      client: r.client,
      receivedDate: formatDateLabel(reqReceivedDate(r)),
      remark: 'No submissions in selected period',
    }))

  const interviewMatchesFilters = (iv: Interview) => {
    if (!clientMatch(iv.client)) return false
    if (requirementFilter && requirementFilter !== 'All') {
      const keys = [iv.requirementId, iv.reqCode].map(k => String(k || ''))
      if (!keys.includes(requirementFilter)) {
        const sub = iv.submissionId ? submissionsById.get(String(iv.submissionId)) : null
        if (!sub) return false
        if (!matchesReqFilter(sub)) return false
      }
    }
    return true
  }

  /** Interview date shown on the report. A recent createdAt must not pull in an older schedule. */
  const interviewActivityDate = (iv: Interview) =>
    iv.dateTime ||
    iv.date ||
    (iv as any).scheduledAt ||
    (iv as any).createdAt ||
    ''

  // Ownership + client/req, then date period (Today / 7d / 30d / All).
  const myInterviewsScoped = (interviews || []).filter(
    iv => interviewOwnedBy(iv, recruiter, submissionsById) && interviewMatchesFilters(iv),
  )
  const myInterviewsInPeriod = myInterviewsScoped.filter(iv =>
    inRange(interviewActivityDate(iv), start, end),
  )

  // Interview rows + outcomes for the selected period only.
  const interviewRows: InterviewRow[] = myInterviewsInPeriod.map(iv => {
    const bucket = classifyInterviewBucket(iv.round || iv.stage)
    const outcome = interviewOutcomeFromStatus(iv.status)
    return {
      id: iv.id,
      candidate: iv.candidate,
      requirement: iv.position || iv.reqCode || iv.requirementId || '—',
      client: iv.client || '—',
      bucket,
      roundLabel: String(iv.round || iv.stage || '—'),
      status: String(iv.status || '—'),
      outcome,
      rejectionReason: outcome === 'Rejected' ? String(iv.notes || (iv as any).rejectionReason || '—') : '—',
      date: formatDateLabel(iv.dateTime || iv.date),
    }
  })

  const interviewOutcomeRows = interviewRows.map(iv => ({
    bucket: iv.bucket,
    outcome: iv.outcome,
  }))

  const offersBySubmissionId = new Map<string, OfferLike>()
  for (const offer of offers || []) {
    const sid = String(offer.submissionId || '').trim()
    if (sid) offersBySubmissionId.set(sid, offer)
  }

  const resolveOnboardingOffer = (s: Submission) =>
    offersBySubmissionId.get(String(s.id)) ||
    offersBySubmissionId.get(String((s as any)._id || '')) ||
    undefined

  /** Offer/submission date in the period. Do not use updatedAt (that pulls months-old rows). */
  const onboardingActivityDate = (s: Submission) => {
    const offer = resolveOnboardingOffer(s)
    return offer?.createdAt || s.submittedAt || s.createdAt || s.date || ''
  }

  // Onboarding in period: Offered/Placed/Selected stage AND activity date in range.
  const onboardingSubs = mySubsScoped.filter(
    s => isOnboardingStage(s.stage) && inRange(onboardingActivityDate(s), start, end),
  )
  const onboarding: OnboardingRow[] = onboardingSubs.map(s => {
    const offer = resolveOnboardingOffer(s)
    const status = String(offer?.status || s.stage || '—')
    const notJoined =
      /declin|back|not.?join|reject/i.test(status) || isRejectedSubmissionStage(s.stage)
        ? String(
            offer?.notJoinedNote ||
              offer?.notJoinedReason ||
              offer?.declinedReason ||
              (s as any).rejectionReason ||
              '—',
          )
        : '—'
    return {
      id: String(s.id),
      candidate: offer?.candidateName || s.candidate || '—',
      requirement: s.req || s.reqCode || '—',
      client: s.client || '—',
      offeredCtc:
        typeof offer?.offeredCtc === 'number'
          ? `₹${offer.offeredCtc.toLocaleString('en-IN')}`
          : String(offer?.offeredCTC || '—'),
      joiningDate: formatDateLabel(offer?.joiningDate),
      status,
      notOnboardedReason: notJoined,
    }
  })

  const rejectedFromInterviews = interviewOutcomeRows.filter(i => i.outcome === 'Rejected').length
  const rejectedFromSubmissions = mySubs.filter(
    s => isRejectedSubmissionStage(s.stage) && !isOnboardingStage(s.stage),
  ).length
  // Prefer interview.status (Rejections Track); fall back to submission.stage Rejected in period.
  const interviewRejectedCount =
    rejectedFromInterviews > 0 ? rejectedFromInterviews : rejectedFromSubmissions

  const kpis: PerformanceKpis = {
    totalRequirementsInScope: scopedReqs.length,
    assignedToRecruiter: assignedReqs.length,
    unassignedInScope: unassignedReqs.length,
    sourcedProfiles: sourced.length,
    submittedProfiles: submittedRows.length,
    nonSubmittedRequirements: nonSubmitted.length,
    interviewTotal: interviewOutcomeRows.length,
    interviewL1: interviewOutcomeRows.filter(i => i.bucket === 'L1').length,
    interviewL2: interviewOutcomeRows.filter(i => i.bucket === 'L2').length,
    interviewFinal: interviewOutcomeRows.filter(i => i.bucket === 'Final').length,
    interviewSelected: interviewOutcomeRows.filter(i => i.outcome === 'Selected').length,
    interviewRejected: interviewRejectedCount,
    interviewPending: interviewOutcomeRows.filter(i => i.outcome === 'Pending').length,
    offeredCount: onboarding.length,
    joinedCount: onboardingSubs.filter(s => isPlacedStage(s.stage)).length,
    notJoinedCount: onboarding.filter(o => /declin|back|not.?join/i.test(o.status)).length,
  }

  const chartFunnel = [
    { name: 'Assigned Reqs', value: kpis.assignedToRecruiter },
    { name: 'Sourced', value: kpis.sourcedProfiles },
    { name: 'Submitted', value: kpis.submittedProfiles },
    { name: 'Interviews', value: kpis.interviewTotal },
    { name: 'Onboarding', value: kpis.offeredCount },
    { name: 'Joined', value: kpis.joinedCount },
  ]

  const chartInterviews = (['L1', 'L2', 'Final'] as InterviewBucket[]).map(bucket => {
    const rows = interviewOutcomeRows.filter(i => i.bucket === bucket)
    return {
      name: bucket,
      selected: rows.filter(r => r.outcome === 'Selected').length,
      rejected: rows.filter(r => r.outcome === 'Rejected').length,
      pending: rows.filter(r => r.outcome === 'Pending').length,
    }
  })

  // Last 6 weeks trend within selected data
  const chartWeekly: { name: string; sourced: number; submitted: number }[] = []
  const weekStart = start || (() => {
    const d = new Date()
    d.setDate(d.getDate() - 7 * 5)
    return startOfDay(d)
  })()
  for (let i = 5; i >= 0; i--) {
    const wEnd = new Date()
    wEnd.setDate(wEnd.getDate() - i * 7)
    const wStart = new Date(wEnd)
    wStart.setDate(wStart.getDate() - 6)
    const ws = startOfDay(wStart)
    const we = endOfDay(wEnd)
    if (start && we < start) continue
    if (end && ws > end) continue
    chartWeekly.push({
      name: ws.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      sourced: (candidates || []).filter(
        c =>
          candidateOwnedBy(c, recruiter) &&
          inRange(c.submissionDate || (c as any).createdAt, ws, we),
      ).length,
      submitted: mySubsAll.filter(
        s => inRange(s.submittedAt || s.createdAt || s.date, ws, we) && clientMatch(s.client),
      ).length,
    })
  }

  return {
    recruiter,
    kpis,
    requirements: requirementRows,
    sourced,
    submitted: submittedRows,
    nonSubmitted,
    interviews: interviewRows,
    onboarding,
    chartFunnel,
    chartInterviews,
    chartWeekly,
  }
}

export function uniqueClients(requirements: Requirement[], submissions: Submission[]): string[] {
  const set = new Set<string>()
  for (const r of requirements || []) if (r.client?.trim()) set.add(r.client.trim())
  for (const s of submissions || []) if (s.client?.trim()) set.add(s.client.trim())
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export function requirementsForFilters(
  requirements: Requirement[],
  clientFilter: string,
): Requirement[] {
  return (requirements || [])
    .filter(r => {
      if (!clientFilter || clientFilter === 'All') return true
      return String(r.client || '').trim().toLowerCase() === clientFilter.trim().toLowerCase()
    })
    .slice()
    .sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
}
