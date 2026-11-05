import React, { useState, useMemo, useEffect } from 'react'
import {
  History,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Briefcase,
  ShieldCheck,
  Layers,
  ChevronRight,
  PauseCircle,
  PlayCircle,
  BarChart3,
  UserCheck,
  ChevronDown,
  XCircle,
  Sparkles,
  User,
  Calendar,
  ArrowUpRight,
  Check,
  X,
} from 'lucide-react'
import { Role, Recruiter, Requirement, Submission, Candidate, Interview } from '../../types'
import { getSessionUser } from '../../store/session'
import { PaginationFooter } from '../ui/PaginationFooter'
import { BackButton } from '../ui/BackButton'
import { candidatesService, filesService } from '../../services/workspace.service'
import { apiCandidateToUi } from '../../services/candidatePayload'

interface SubmittedClientsPillCellProps {
  clients: string[]
  onSelectClient?: (clientName: string) => void
  activeClient?: string
}

function SubmittedClientsPillCell({ clients, onSelectClient, activeClient }: SubmittedClientsPillCellProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!clients || clients.length === 0) {
    return <span className="text-slate-400 font-medium">—</span>
  }

  const primaryClient =
    activeClient && activeClient !== 'All Clients' && clients.some(c => c.toLowerCase().includes(activeClient.toLowerCase()))
      ? clients.find(c => c.toLowerCase().includes(activeClient.toLowerCase())) || clients[0]
      : clients[0]

  const hasMultiple = clients.length > 1

  return (
    <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
      {hasMultiple ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#5B51D8] border border-[#C7D2FE] transition-all cursor-pointer shadow-2xs active:scale-95"
          title={`Click to view all ${clients.length} submitted clients`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#5B51D8] shrink-0" />
          <span>{primaryClient}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#5B51D8] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSelectClient?.(clients[0])}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#5B51D8] border border-[#C7D2FE] shadow-2xs cursor-pointer transition-all active:scale-95"
          title={`Click to filter table for ${clients[0]}`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#5B51D8] shrink-0" />
          <span>{clients[0]}</span>
        </button>
      )}

      {isOpen && hasMultiple && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1.5 flex items-center justify-between">
            <span>Submitted Clients ({clients.length})</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
            {clients.map(client => (
              <button
                key={client}
                type="button"
                onClick={() => {
                  onSelectClient?.(client)
                  setIsOpen(false)
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-[#6B3BF6] rounded-xl transition-colors flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{client}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export type HistorySourcedCandidateRow = {
  id: string
  candidateName: string
  requirementName: string
  clientName: string
  sourcedDate: string
  status: 'Submitted' | 'Working' | 'On Hold' | 'Sourced'
  experience: string
  skills?: string[]
  contactEmail?: string
  contactPhone?: string
  candidateCode?: string
  currentCompany?: string
  currentLocation?: string
  noticePeriod?: string
  currentCtc?: string
  expectedCtc?: string
  resumeFileId?: string
  resumeReference?: string
  notes?: string
  /** Candidate document id. Submission rows must not use the submission id for this. */
  candidateMongoId?: string
}

export interface RecruiterHistoryItem {
  id: string
  /** Mongo user id used for Candidate Repository ownership (sourcedByRecruiterId). */
  recruiterUserId?: string
  recruiterName: string
  recruiterEmail: string
  recruiterAvatar: string
  roleTitle: string
  userRole: 'recruiter' | 'lead'
  teamLead: string
  clientAccounts: string[]
  assignedRequirementsCount: number
  sourcedProfilesCount: number // Candidate Repository history
  submittedProfilesCount: number // Total Submissions page count
  interviewsCount?: number // Total Interviews count
  workingProfilesCount: number // Active in progress / working candidates
  onHoldProfilesCount: number // On hold candidates
  placedCount: number // Offers accepted / joined
  topSkillsSourced: string[]
  recentSourcedCandidates: HistorySourcedCandidateRow[]
  assignedRequirementsList: {
    id: string
    mongoId?: string
    reqCode?: string
    reqName: string
    clientName: string
    status: 'Open' | 'In Progress' | 'Closed'
    assignedDate: string
    submissionsCount: number
    sourcedCount?: number
    workingCount?: number
  }[]
}

const fmtDate = (v?: string) => {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const subStatus = (stage?: string): 'Submitted' | 'Working' | 'On Hold' | 'Sourced' => {
  const v = (stage || '').toLowerCase()
  if (v.includes('hold')) return 'On Hold'
  if (/interview|shortlist|offer|placed|review|selected|forward|client/.test(v)) return 'Working'
  if (/sourced|new|parsed/.test(v)) return 'Sourced'
  return 'Submitted'
}

const norm = (v?: string | null) => String(v || '').trim().toLowerCase()
const nameMatch = (a?: string | null, b?: string | null) => {
  const x = norm(a)
  const y = norm(b)
  if (!x || !y) return false
  return x === y || x.includes(y) || y.includes(x)
}

const recruiterIdentityKeys = (r: Pick<Recruiter, 'id' | 'name' | 'email'> & { _id?: string }) => {
  const keys = new Set<string>()
  if (r._id) keys.add(String(r._id))
  if (r.id) keys.add(String(r.id))
  return keys
}

const reqAssignedTo = (
  req: Requirement,
  keys: Set<string>,
  name: string,
  email?: string,
) => {
  if (req.assignmentStatus === 'Unassigned') return false
  const ids = Array.isArray((req as any).assignedRecruiterIds)
    ? (req as any).assignedRecruiterIds.map((id: unknown) => String(id))
    : []
  if (ids.some((id: string) => keys.has(id))) return true
  const names = String((req as any).assignedRecruiterNames || req.owner || '')
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)
  return names.some(n => nameMatch(n, name))
}

const submissionOwnedBy = (
  s: Submission,
  keys: Set<string>,
  name: string,
  email?: string,
) => {
  const recId = String((s as any).recruiterId || '').trim()
  if (recId && keys.has(recId)) return true
  const recEmail = norm((s as any).recruiterEmail)
  if (email && recEmail && recEmail === norm(email)) return true
  return nameMatch(s.recruiter, name)
}

const candidateOwnedBy = (
  c: Candidate,
  keys: Set<string>,
  name: string,
) => {
  const sourcedId = String(c.sourcedByRecruiterId || '').trim()
  if (sourcedId && keys.has(sourcedId)) return true
  return nameMatch(c.createdByName, name)
}

const interviewOwnedBy = (
  i: Interview,
  keys: Set<string>,
  name: string,
  email?: string,
) => {
  const recId = String((i as any).recruiterId || '').trim()
  if (recId && keys.has(recId)) return true
  const recEmail = norm((i as any).recruiterEmail)
  if (email && recEmail && recEmail === norm(email)) return true
  return nameMatch(i.recruiter, name)
}

/** Build one recruiter's live performance row from workspace data. */
export function buildHistoryItemForRecruiter(
  r: Pick<Recruiter, 'id' | 'name' | 'email' | 'lead' | 'submissions' | 'interviews' | 'placements'> & { _id?: string },
  requirements: Requirement[],
  submissions: Submission[],
  candidates: Candidate[] = [],
  interviews: Interview[] = [],
): RecruiterHistoryItem {
  const keys = recruiterIdentityKeys(r)
  const name = r.name || ''
  const email = r.email || ''
  const reqs = requirements.filter(q => reqAssignedTo(q, keys, name, email))
  const subs = submissions.filter(s => submissionOwnedBy(s, keys, name, email))
  const sourced = candidates.filter(c => candidateOwnedBy(c, keys, name))
  const ivs = interviews.filter(i => interviewOwnedBy(i, keys, name, email))

  // Repo profiles + any submissions not already represented by a sourced candidate.
  const sourcedRowsFromRepo = sourced.map(c => ({
    id: String(c._id || c.id),
    candidateName: c.name,
    requirementName: 'Candidate Repository',
    clientName: '—',
    sourcedDate: fmtDate(c.submissionDate),
    status: 'Sourced' as const,
    experience: c.totalExperience || '—',
    skills: String(c.skills || '')
      .split(',')
      .map(x => x.trim())
      .filter(Boolean),
    contactEmail: c.email,
  }))
  const sourcedRowsFromSubs = subs.map(s => {
    const candidateMongoId = isMongoObjectId(s.candidateId) ? String(s.candidateId) : undefined
    const skillList = Array.isArray((s as any).skills)
      ? (s as any).skills.map((x: unknown) => String(x || '').trim()).filter(Boolean)
      : []
    return {
      id: s.id,
      candidateMongoId,
      candidateName: s.candidate,
      requirementName:
        requirements.find(
          q =>
            q.id === s.req ||
            (q as any).reqCode === s.req ||
            String((q as any)._id || '') === String((s as any).requirementId || ''),
        )?.title || s.req,
      clientName: s.client,
      sourcedDate: fmtDate(s.submittedAt || s.createdAt || s.date),
      status: subStatus(s.stage),
      experience: s.experience || '—',
      contactEmail: s.email || undefined,
      contactPhone: s.phone || undefined,
      skills: skillList.length ? skillList : undefined,
      currentCompany: (s as any).currentCompany || undefined,
      currentLocation: (s as any).currentLocation || undefined,
      noticePeriod: (s as any).noticePeriod || undefined,
      currentCtc: (s as any).currentCtc || undefined,
      expectedCtc: (s as any).expectedCtc || undefined,
      resumeFileId: (s as any).resumeFileId ? String((s as any).resumeFileId) : undefined,
      resumeReference: (s as any).resumeFileName || (s as any).resumeReference || undefined,
    }
  })
  // Prefer submission pipeline status when the same person is already in repo.
  const seen = new Set<string>()
  const deduped = [...sourcedRowsFromSubs, ...sourcedRowsFromRepo].filter(row => {
    const key = norm(row.contactEmail) || `name:${norm(row.candidateName)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const clients = [
    ...new Set([...reqs.map(q => q.client), ...subs.map(s => s.client)].filter(Boolean)),
  ]

  const recruiterUserId = String(r._id || r.id || '').trim()

  return {
    id: `HIST-${r.id || r._id || name}`,
    recruiterUserId: recruiterUserId || undefined,
    recruiterName: name,
    recruiterEmail: email,
    recruiterAvatar: (name || '?').charAt(0).toUpperCase(),
    roleTitle: 'Recruiter',
    userRole: 'recruiter',
    teamLead: r.lead || '—',
    clientAccounts: clients,
    assignedRequirementsCount: reqs.length,
    // Prefer repo ownership count when caller patches via sourced-counts API.
    sourcedProfilesCount: Math.max(sourced.length, deduped.length),
    submittedProfilesCount: subs.length || r.submissions || 0,
    interviewsCount: ivs.length || r.interviews || 0,
    workingProfilesCount: subs.filter(s => subStatus(s.stage) === 'Working').length,
    onHoldProfilesCount: subs.filter(s => subStatus(s.stage) === 'On Hold').length,
    placedCount:
      subs.filter(s => /offer|placed|joined|selected/i.test(String(s.stage || ''))).length ||
      r.placements ||
      0,
    topSkillsSourced: [],
    recentSourcedCandidates: deduped,
    assignedRequirementsList: reqs.map(q => {
      const reqSubs = subs.filter(
        s =>
          s.req === q.id ||
          (s as any).requirementId === (q as any)._id ||
          (q as any).reqCode === s.req,
      )
      return {
        id: q.id,
        mongoId: String((q as any)._id || ''),
        reqCode: String((q as any).reqCode || ''),
        reqName: q.title,
        clientName: q.client,
        status: (q.status === 'Closed'
          ? 'Closed'
          : (q.submissions || reqSubs.length || 0) > 0
            ? 'In Progress'
            : 'Open') as 'Open' | 'In Progress' | 'Closed',
        assignedDate: fmtDate((q as any).createdAt || (q as any).firstDetectedAt),
        submissionsCount: reqSubs.length || q.submissions || 0,
        sourcedCount: reqSubs.length,
        workingCount: reqSubs.filter(s => subStatus(s.stage) === 'Working').length,
      }
    }),
  }
}

/** History rows built from live recruiters, their assigned requirements and their submissions. */
export function buildRecruiterHistory(
  recruiters: Recruiter[],
  requirements: Requirement[],
  submissions: Submission[],
  candidates: Candidate[] = [],
  interviews: Interview[] = [],
): RecruiterHistoryItem[] {
  const recruiterRows: RecruiterHistoryItem[] = recruiters.map(r =>
    buildHistoryItemForRecruiter(r, requirements, submissions, candidates, interviews),
  )
  // Each lead: the sum of the lead's recruiters.
  const leadNames = [...new Set(recruiters.map(r => r.lead).filter(Boolean))] as string[]
  const leadRows: RecruiterHistoryItem[] = leadNames.map(lead => {
    const team = recruiterRows.filter(x => x.teamLead === lead)
    const sum = (f: (x: RecruiterHistoryItem) => number) => team.reduce((n, x) => n + f(x), 0)
    return {
      id: `HIST-LEAD-${lead}`,
      recruiterName: lead,
      recruiterEmail: '',
      recruiterAvatar: lead.charAt(0).toUpperCase(),
      roleTitle: 'Team Lead',
      userRole: 'lead',
      teamLead: lead,
      clientAccounts: [...new Set(team.flatMap(x => x.clientAccounts))],
      assignedRequirementsCount: sum(x => x.assignedRequirementsCount),
      sourcedProfilesCount: sum(x => x.sourcedProfilesCount),
      submittedProfilesCount: sum(x => x.submittedProfilesCount),
      interviewsCount: sum(x => x.interviewsCount || 0),
      workingProfilesCount: sum(x => x.workingProfilesCount),
      onHoldProfilesCount: sum(x => x.onHoldProfilesCount),
      placedCount: sum(x => x.placedCount),
      topSkillsSourced: [],
      recentSourcedCandidates: team.flatMap(x => x.recentSourcedCandidates),
      assignedRequirementsList: team.flatMap(x => x.assignedRequirementsList),
    }
  })
  return [...leadRows, ...recruiterRows]
}

interface HistoryPageProps {
  role: Role
  recruiters?: Recruiter[]
  requirements?: Requirement[]
  submissions?: Submission[]
  candidates?: Candidate[]
  interviews?: Interview[]
  currentUserName?: string
  currentUserEmail?: string
  currentUserId?: string
  /** Workspace Candidate Repository count for the logged-in user. */
  myCandidatesCount?: number
  /** Opens the full requirement record. Reports uses this for Assigned Requirements rows. */
  onOpenRequirement?: (requirement: Requirement) => void
}

function isMongoObjectId(value?: string | null): boolean {
  return /^[a-fA-F0-9]{24}$/.test(String(value || '').trim())
}

function presentText(value?: string | null): string {
  const text = String(value ?? '').trim()
  if (!text || text === '—' || /^n\/?a$/i.test(text) || text.toLowerCase() === 'null') return ''
  return text
}

function presentMoney(value?: string | null): string {
  const text = presentText(value)
  if (!text || text === '0' || text === '0.0' || text === '0.00') return ''
  return text
}

/** Keep the pipeline row, and fill only fields that exist on the candidate record. */
function mergeCandidateProfile(
  row: HistorySourcedCandidateRow,
  fresh: HistorySourcedCandidateRow,
): HistorySourcedCandidateRow {
  const keep = (current?: string, next?: string) => presentText(next) || presentText(current)
  return {
    ...row,
    candidateCode: keep(row.candidateCode, fresh.candidateCode),
    contactEmail: keep(row.contactEmail, fresh.contactEmail),
    contactPhone: keep(row.contactPhone, fresh.contactPhone),
    currentCompany: keep(row.currentCompany, fresh.currentCompany),
    currentLocation: keep(row.currentLocation, fresh.currentLocation),
    noticePeriod: keep(row.noticePeriod, fresh.noticePeriod),
    currentCtc: presentMoney(fresh.currentCtc) || presentMoney(row.currentCtc),
    expectedCtc: presentMoney(fresh.expectedCtc) || presentMoney(row.expectedCtc),
    resumeFileId: presentText(fresh.resumeFileId) || presentText(row.resumeFileId) || undefined,
    resumeReference: keep(row.resumeReference, fresh.resumeReference),
    notes: keep(row.notes, fresh.notes),
    skills: fresh.skills && fresh.skills.length > 0 ? fresh.skills : row.skills,
    experience: presentText(row.experience) || presentText(fresh.experience) || '—',
    candidateMongoId: isMongoObjectId(fresh.id) ? fresh.id : row.candidateMongoId,
  }
}

export function HistoryPage({
  role,
  currentUserName,
  currentUserEmail,
  currentUserId,
  myCandidatesCount,
  recruiters = [],
  requirements = [],
  submissions = [],
  candidates = [],
  interviews = [],
  onOpenRequirement,
}: HistoryPageProps) {
  const session = getSessionUser()
  const meName = currentUserName || session?.name || ''
  const meEmail = currentUserEmail || session?.email || ''
  const meId = currentUserId || session?.id || ''

  /** Prefer recruiter directory Mongo `_id` (matches sourcedByRecruiterId). */
  const myMongoUserId = useMemo(() => {
    const fromDirectory = recruiters.find(
      r =>
        (meEmail && norm(r.email) === norm(meEmail)) ||
        (meId && (String(r._id || '') === meId || String(r.id) === meId)) ||
        (meName && nameMatch(r.name, meName)),
    )
    const fromDirId = String(fromDirectory?._id || '').trim()
    if (isMongoObjectId(fromDirId)) return fromDirId
    if (isMongoObjectId(meId)) return String(meId).trim()
    return fromDirId || String(meId || '').trim()
  }, [recruiters, meEmail, meId, meName])

  // True Candidate Repository counts keyed by sourcedByRecruiterId (user Mongo id).
  const [sourcedCountByUserId, setSourcedCountByUserId] = useState<Record<string, number>>({})
  const [orgSourcedTotal, setOrgSourcedTotal] = useState(0)
  /** Live repo total for the logged-in user — only set from per-user filtered APIs. */
  const [myLiveRepoCount, setMyLiveRepoCount] = useState<number | null>(null)

  const isOrgWideCount = (n: number | null | undefined) => {
    if (typeof n !== 'number' || n <= 0) return false
    if (orgSourcedTotal > 0 && n === orgSourcedTotal) return true
    // Hard guard: org repo is ~20k; never treat that as one user's sourced KPI.
    if (n >= 5000) return true
    return false
  }

  const acceptPersonalRepoCount = (n: number | null | undefined): number | null => {
    if (typeof n !== 'number' || Number.isNaN(n) || n < 0) return null
    if (isOrgWideCount(n)) return null
    return n
  }

  useEffect(() => {
    const scoped = acceptPersonalRepoCount(myCandidatesCount)
    if (scoped !== null) setMyLiveRepoCount(scoped)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCandidatesCount, orgSourcedTotal])

  useEffect(() => {
    let active = true
    candidatesService
      .sourcedCounts()
      .then(res => {
        if (!active) return
        setSourcedCountByUserId(res.counts || {})
        setOrgSourcedTotal(Number(res.total || 0))
      })
      .catch(() => {
        if (active) {
          setSourcedCountByUserId({})
          setOrgSourcedTotal(0)
        }
      })
    return () => {
      active = false
    }
  }, [])

  // Self view: fetch authoritative Candidate Repository total for THIS user only.
  useEffect(() => {
    if (!(role === 'recruiter' || role === 'lead')) return
    const userId = myMongoUserId
    if (!userId) return
    let active = true
    candidatesService
      .listPage({ page: 1, limit: 1, createdBy: userId })
      .then(res => {
        if (!active) return
        const total = acceptPersonalRepoCount(Number(res.total || 0))
        // If API ignored createdBy and returned org total, keep map/workspace value instead.
        if (total !== null) setMyLiveRepoCount(total)
      })
      .catch(() => {
        /* keep sourced-counts / workspace fallback */
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, myMongoUserId, orgSourcedTotal])

  const applyRepoSourcedCounts = (rows: RecruiterHistoryItem[]): RecruiterHistoryItem[] => {
    if (!Object.keys(sourcedCountByUserId).length) return rows
    const patched = rows.map(row => {
      let userKey = String(row.recruiterUserId || '').trim()
      if (!userKey || typeof sourcedCountByUserId[userKey] !== 'number') {
        const match = recruiters.find(
          r =>
            (row.recruiterEmail && norm(r.email) === norm(row.recruiterEmail)) ||
            nameMatch(r.name, row.recruiterName),
        )
        const mongoId = String(match?._id || '').trim()
        if (mongoId) userKey = mongoId
      }
      const count = userKey ? sourcedCountByUserId[userKey] : undefined
      if (typeof count !== 'number') return row
      return { ...row, recruiterUserId: userKey || row.recruiterUserId, sourcedProfilesCount: count }
    })
    // Re-sum synthetic lead aggregate rows from patched individuals.
    return patched.map(row => {
      if (!String(row.id || '').startsWith('HIST-LEAD-')) return row
      const team = patched.filter(
        x => !String(x.id || '').startsWith('HIST-LEAD-') && x.teamLead === row.recruiterName,
      )
      if (!team.length) return row
      return {
        ...row,
        sourcedProfilesCount: team.reduce((n, x) => n + (x.sourcedProfilesCount || 0), 0),
      }
    })
  }

  const RECRUITERS_HISTORY_DATA = useMemo(
    () =>
      applyRepoSourcedCounts(
        buildRecruiterHistory(recruiters, requirements, submissions, candidates, interviews),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyRepoSourcedCounts closes over sourcedCountByUserId
    [recruiters, requirements, submissions, candidates, interviews, sourcedCountByUserId],
  )
  // Determine if viewing as Super Admin / Admin or as a Recruiter / Lead
  const isSuperAdminOrAdmin = role === 'superadmin' || role === 'admin' || role === 'devteam'
  const isAuthorized = isSuperAdminOrAdmin || role === 'recruiter' || role === 'lead'

  // Search State
  const [searchQuery, setSearchQuery] = useState('')

  // Selected Recruiter Drawer / Modal State (for Super Admin View)
  const [selectedRecruiterDetail, setSelectedRecruiterDetail] = useState<RecruiterHistoryItem | null>(null)
  const [recruiterDetailModalTab, setRecruiterDetailModalTab] = useState<'requirements' | 'sourced'>('requirements')

  // Live Candidate Repository rows for Sourced KPI drill-down (paged).
  const [repoSourcedRows, setRepoSourcedRows] = useState<HistorySourcedCandidateRow[]>([])
  const [repoSourcedTotal, setRepoSourcedTotal] = useState(0)
  const [repoSourcedPage, setRepoSourcedPage] = useState(1)
  const [repoSourcedPageSize, setRepoSourcedPageSize] = useState(10)
  const [repoSourcedLoading, setRepoSourcedLoading] = useState(false)
  const [repoSourcedUserId, setRepoSourcedUserId] = useState<string>('')

  // Helpers to get full list of worked requirements and sourced profiles matching counts
  const getFullAssignedRequirements = (rec: RecruiterHistoryItem) => rec.assignedRequirementsList || []

  const getFullSourcedCandidates = (rec: RecruiterHistoryItem) => {
    if (
      recruiterDetailModalTab === 'sourced' &&
      repoSourcedUserId &&
      rec.recruiterUserId &&
      repoSourcedUserId === rec.recruiterUserId
    ) {
      return repoSourcedRows
    }
    return rec.recentSourcedCandidates || []
  }

  const mapApiCandidateToSourcedRow = (raw: any): HistorySourcedCandidateRow => {
    const ui = apiCandidateToUi(raw)
    const expYears =
      typeof (raw as any)?.totalExperienceYears === 'number'
        ? (raw as any).totalExperienceYears
        : Number(String(ui.totalExperience || '').match(/\d+/)?.[0] || 0)
    const created =
      (raw && (raw.createdAt || raw.updatedAt)) ||
      (ui as any).createdAt ||
      ''
    let sourcedDate = '—'
    if (created) {
      const d = new Date(created)
      if (!Number.isNaN(d.getTime())) sourcedDate = d.toLocaleDateString()
    }
    const skillsArr = Array.isArray(ui.skills)
      ? ui.skills
      : String(ui.skills || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
    return {
      id: String(ui._id || ui.id || raw?._id || raw?.id || raw?.candidateId || Math.random()),
      candidateCode: String(ui.candidateId || raw?.candidateId || ''),
      candidateName: ui.name || '—',
      requirementName: 'Candidate Repository',
      clientName: '—',
      sourcedDate,
      status: 'Sourced',
      experience: expYears ? `${expYears} yrs` : ui.totalExperience || '—',
      skills: skillsArr,
      contactEmail: ui.email || '',
      contactPhone: ui.phone || '',
      currentCompany: ui.company || '',
      currentLocation: ui.currentLocation || '',
      noticePeriod: ui.noticePeriod || '',
      currentCtc: ui.currentCtc || '',
      expectedCtc: ui.expectedCtc || '',
      resumeFileId: ui.resumeFileId || (raw?.resumeFileId ? String(raw.resumeFileId) : undefined),
      resumeReference: ui.resumeName || raw?.resumeFileName || '',
      notes: ui.notes || '',
    }
  }

  const loadRepoSourcedForUser = (userId: string, page = 1, pageSize = repoSourcedPageSize) => {
    const id = String(userId || '').trim()
    // Never load the unfiltered org repository — require a creator id.
    if (!id) {
      setRepoSourcedRows([])
      setRepoSourcedTotal(0)
      setRepoSourcedUserId('')
      setRepoSourcedLoading(false)
      return
    }
    setRepoSourcedLoading(true)
    setRepoSourcedUserId(id)
    setRepoSourcedPage(page)
    const mapTotal = typeof sourcedCountByUserId[id] === 'number' ? sourcedCountByUserId[id] : null

    candidatesService
      .listSourcedBy(id, { page, limit: pageSize })
      .then(res => {
        const apiTotal = Number(res.total || 0)
        const rows = (res.items || []).map((raw: any) => {
          try {
            return mapApiCandidateToSourcedRow(raw)
          } catch {
            return null
          }
        }).filter(Boolean) as HistorySourcedCandidateRow[]

        setRepoSourcedRows(rows)
        const personalTotal = acceptPersonalRepoCount(apiTotal)
        const nextTotal =
          personalTotal !== null ? personalTotal : mapTotal !== null ? mapTotal : rows.length
        setRepoSourcedTotal(nextTotal)
        if (id === myMongoUserId && personalTotal !== null) {
          setMyLiveRepoCount(personalTotal)
        }
      })
      .catch(() => {
        // Fallback to createdBy listPage if dedicated route is unavailable.
        return candidatesService
          .listPage({ page, limit: pageSize, createdBy: id })
          .then(res => {
            const apiTotal = Number(res.total || 0)
            if (isOrgWideCount(apiTotal)) {
              setRepoSourcedRows([])
              setRepoSourcedTotal(mapTotal ?? 0)
              return
            }
            const rows = (res.items || []).map((raw: any) => {
              try {
                return mapApiCandidateToSourcedRow(raw)
              } catch {
                return null
              }
            }).filter(Boolean) as HistorySourcedCandidateRow[]
            setRepoSourcedRows(rows)
            const personalTotal = acceptPersonalRepoCount(apiTotal)
            setRepoSourcedTotal(
              personalTotal !== null ? personalTotal : mapTotal !== null ? mapTotal : rows.length,
            )
          })
          .catch(() => {
            setRepoSourcedRows([])
            setRepoSourcedTotal(mapTotal ?? 0)
          })
      })
      .finally(() => setRepoSourcedLoading(false))
  }

  // Recruiter Personal View Active Tab & Status Filter
  const [recruiterTab, setRecruiterTab] = useState<'requirements' | 'sourced'>('requirements')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Working' | 'On Hold' | 'Sourced'>('All')
  const [selectedReqFilter, setSelectedReqFilter] = useState<string | null>(null)
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<HistorySourcedCandidateRow | null>(null)
  const [candidateDetailLoading, setCandidateDetailLoading] = useState(false)
  const [detailToast, setDetailToast] = useState('')
  const [selectedRequirementDetail, setSelectedRequirementDetail] = useState<any | null>(null)

  const openSourcedCandidateDetail = async (cand: HistorySourcedCandidateRow) => {
    // Open immediately with list-row data, then load the candidate record for contact and resume.
    setSelectedCandidateDetail(cand)
    const candidateId = String(cand.candidateMongoId || '').trim()
    const sourcedId = cand.status === 'Sourced' ? String(cand.id || '').trim() : ''
    const lookupId = isMongoObjectId(candidateId) ? candidateId : isMongoObjectId(sourcedId) ? sourcedId : ''
    if (!lookupId) return
    setCandidateDetailLoading(true)
    try {
      const fresh = await candidatesService.getById(lookupId)
      if (fresh) {
        const mapped = mapApiCandidateToSourcedRow(fresh)
        setSelectedCandidateDetail(prev => (prev ? mergeCandidateProfile(prev, mapped) : mapped))
      }
    } catch {
      // Keep the submission snapshot. Do not invent contact or resume fields.
    } finally {
      setCandidateDetailLoading(false)
    }
  }

  const openAssignedRequirement = (row: RecruiterHistoryItem['assignedRequirementsList'][number]) => {
    const full = requirements.find(q => {
      const mongoId = String((q as any)._id || '')
      const code = String(q.reqCode || '')
      return (
        q.id === row.id ||
        (!!row.mongoId && mongoId === row.mongoId) ||
        (!!row.reqCode && code === row.reqCode) ||
        (!!code && code === row.id)
      )
    })
    if (full && onOpenRequirement) {
      onOpenRequirement(full)
      return
    }
    setSelectedRequirementDetail(full || row)
  }

  const downloadCandidateResume = async (cand: HistorySourcedCandidateRow) => {
    const candidateId = String(cand.candidateMongoId || '').trim()
    const sourcedId = cand.status === 'Sourced' ? String(cand.id || '').trim() : ''
    const lookupId = isMongoObjectId(candidateId) ? candidateId : isMongoObjectId(sourcedId) ? sourcedId : ''
    const fileId = String(cand.resumeFileId || '').trim()
    if (!lookupId && !fileId) {
      setDetailToast('No resume file is stored for this candidate.')
      window.setTimeout(() => setDetailToast(''), 4000)
      return
    }
    setDetailToast('Downloading resume…')
    try {
      if (lookupId) await candidatesService.downloadResume(lookupId)
      else await filesService.download(fileId)
      setDetailToast('Resume download started.')
    } catch (err) {
      if (lookupId && fileId) {
        try {
          await filesService.download(fileId)
          setDetailToast('Resume download started.')
          window.setTimeout(() => setDetailToast(''), 4000)
          return
        } catch {
          /* use the candidate-download error below */
        }
      }
      const message = err instanceof Error && err.message ? err.message : 'Could not download the resume.'
      setDetailToast(message)
    }
    window.setTimeout(() => setDetailToast(''), 4000)
  }

  // Team Lead View Tab State: 'self' (My Individual Performance) | 'team' (Team Members Performance)
  const [leadViewTab, setLeadViewTab] = useState<'self' | 'team'>('self')

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [myReqsPage, setMyReqsPage] = useState(1)
  const [myReqsPageSize, setMyReqsPageSize] = useState(10)
  const [profileListPage, setProfileListPage] = useState(1)
  const profileListPageSize = 10
  const [modalReqsPage, setModalReqsPage] = useState(1)
  const [modalReqsPageSize, setModalReqsPageSize] = useState(5)

  // Identify logged in recruiter item for Recruiter / Lead view — always live from workspace.
  const myRecruiterHistory = useMemo(() => {
    let item: RecruiterHistoryItem | null = null
    if (role === 'recruiter' || role === 'lead') {
      const fromDirectory = recruiters.find(
        r =>
          (meEmail && norm(r.email) === norm(meEmail)) ||
          (meId && (String(r._id || '') === meId || String(r.id) === meId)) ||
          (meName && nameMatch(r.name, meName)),
      )
      // Always compute from live reqs/subs/candidates so KPIs never stick at 0
      // when directory metadata is incomplete.
      item = buildHistoryItemForRecruiter(
        {
          id: fromDirectory?.id || meId || meEmail || meName || 'me',
          _id: fromDirectory?._id || myMongoUserId || meId || undefined,
          name: fromDirectory?.name || meName || 'Recruiter',
          email: fromDirectory?.email || meEmail,
          lead: fromDirectory?.lead || (role === 'lead' ? meName : '—'),
          submissions: fromDirectory?.submissions || 0,
          interviews: fromDirectory?.interviews || 0,
          placements: fromDirectory?.placements || 0,
        },
        requirements,
        submissions,
        candidates,
        interviews,
      )
    } else if (meEmail) {
      item = RECRUITERS_HISTORY_DATA.find(r => norm(r.recruiterEmail) === norm(meEmail)) || null
    } else if (meName) {
      item = RECRUITERS_HISTORY_DATA.find(r => nameMatch(r.recruiterName, meName)) || null
    }

    if (!item) return null
    const userId = myMongoUserId || item.recruiterUserId || meId
    // Prefer per-user DB map first — never allow org-wide totals into this KPI.
    const fromMap = userId && typeof sourcedCountByUserId[userId] === 'number'
      ? sourcedCountByUserId[userId]
      : undefined
    const fromLive = acceptPersonalRepoCount(myLiveRepoCount)
    const fromWorkspace = acceptPersonalRepoCount(myCandidatesCount)
    const repoCount = fromMap ?? fromLive ?? fromWorkspace
    if (typeof repoCount === 'number') {
      return { ...item, recruiterUserId: userId || item.recruiterUserId, sourcedProfilesCount: repoCount }
    }
    return { ...item, recruiterUserId: userId || item.recruiterUserId }
  }, [
    RECRUITERS_HISTORY_DATA,
    role,
    meEmail,
    meName,
    meId,
    myMongoUserId,
    myLiveRepoCount,
    myCandidatesCount,
    recruiters,
    requirements,
    submissions,
    candidates,
    interviews,
    sourcedCountByUserId,
    orgSourcedTotal,
  ])

  // Filtered Recruiters List for Super Admin or Team Lead
  const filteredRecruiters = useMemo(() => {
    return RECRUITERS_HISTORY_DATA.filter(rec => {
      // If role is lead, filter recruiters belonging to this Team Lead's pod/team
      if (role === 'lead') {
        const myName = (myRecruiterHistory?.recruiterName || currentUserName || '').toLowerCase()
        const leadName = (rec.teamLead || '').toLowerCase()
        const recName = (rec.recruiterName || '').toLowerCase()

        const isMyTeam = !myName || leadName.includes(myName) || recName.includes(myName)
        if (!isMyTeam) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = rec.recruiterName.toLowerCase().includes(q)
        const matchEmail = rec.recruiterEmail.toLowerCase().includes(q)
        const matchLead = rec.teamLead.toLowerCase().includes(q)
        const matchClients = rec.clientAccounts.some(c => c.toLowerCase().includes(q))
        const matchSkills = rec.topSkillsSourced.some(s => s.toLowerCase().includes(q))
        if (!matchName && !matchEmail && !matchLead && !matchClients && !matchSkills) return false
      }
      return true
    })
  }, [searchQuery, role, myRecruiterHistory])

  // Super Admin / Team Lead Paginated List
  const paginatedRecruiters = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecruiters.slice(start, start + pageSize)
  }, [filteredRecruiters, currentPage])

  const totalPages = Math.ceil(filteredRecruiters.length / pageSize) || 1

  // Summary Totals for Super Admin / Admin / Team Lead View
  const totals = useMemo(() => {
    // Super Admin + Admin: org-wide accurate card totals (not a sum of table rows).
    // Table rows can miss unmatched/deleted users and double-count HIST-LEAD aggregates.
    if (role === 'superadmin' || role === 'admin') {
      const sourcedFromMap = Object.values(sourcedCountByUserId).reduce(
        (n, v) => n + (typeof v === 'number' ? v : 0),
        0,
      )
      return {
        requirements: requirements.length,
        sourced: orgSourcedTotal > 0 ? orgSourcedTotal : sourcedFromMap,
        submitted: submissions.length,
        working: submissions.filter(s => subStatus(s.stage) === 'Working').length,
        onHold: submissions.filter(s => subStatus(s.stage) === 'On Hold').length,
        placed: submissions.filter(s =>
          /offer|placed|joined|selected/i.test(String(s.stage || '')),
        ).length,
      }
    }

    // Lead (and others): sum individuals only — skip synthetic lead aggregate rows.
    return filteredRecruiters.reduce(
      (acc, r) => {
        if (String(r.id || '').startsWith('HIST-LEAD-')) return acc
        acc.requirements += r.assignedRequirementsCount
        acc.sourced += r.sourcedProfilesCount
        acc.submitted += r.submittedProfilesCount
        acc.working += r.workingProfilesCount
        acc.onHold += r.onHoldProfilesCount
        acc.placed += r.placedCount
        return acc
      },
      { requirements: 0, sourced: 0, submitted: 0, working: 0, onHold: 0, placed: 0 },
    )
  }, [
    role,
    filteredRecruiters,
    requirements,
    submissions,
    orgSourcedTotal,
    sourcedCountByUserId,
  ])

  // Filtered requirements for Recruiter View
  const filteredMyRequirements = useMemo(() => {
    if (!myRecruiterHistory) return []
    return myRecruiterHistory.assignedRequirementsList.filter(req => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        req.reqName.toLowerCase().includes(q) ||
        req.clientName.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q) ||
        req.status.toLowerCase().includes(q)
      )
    })
  }, [myRecruiterHistory, searchQuery])

  useEffect(() => {
    setMyReqsPage(1)
  }, [searchQuery, recruiterTab])

  const paginatedMyRequirements = useMemo(() => {
    const start = (myReqsPage - 1) * myReqsPageSize
    return filteredMyRequirements.slice(start, start + myReqsPageSize)
  }, [filteredMyRequirements, myReqsPage, myReqsPageSize])

  // When Sourced KPI (All) is open, load real Candidate Repository rows for this user.
  useEffect(() => {
    if (recruiterTab !== 'sourced' || statusFilter !== 'All') return
    const userId = myMongoUserId || myRecruiterHistory?.recruiterUserId || ''
    if (!userId) {
      setRepoSourcedRows([])
      setRepoSourcedTotal(0)
      return
    }
    loadRepoSourcedForUser(userId, 1, repoSourcedPageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterTab, statusFilter, myMongoUserId, myRecruiterHistory?.recruiterUserId, repoSourcedPageSize])

  // Admin/lead modal: load repo candidates when Sourced tab is selected.
  useEffect(() => {
    if (!selectedRecruiterDetail || recruiterDetailModalTab !== 'sourced') return
    const userId = selectedRecruiterDetail.recruiterUserId || ''
    if (!userId) {
      setRepoSourcedRows([])
      setRepoSourcedTotal(0)
      return
    }
    loadRepoSourcedForUser(userId, 1, repoSourcedPageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRecruiterDetail?.recruiterUserId, recruiterDetailModalTab, repoSourcedPageSize])

  // Keep modal KPI count in sync with live repo totals once loaded.
  useEffect(() => {
    if (!selectedRecruiterDetail?.recruiterUserId) return
    const count = sourcedCountByUserId[selectedRecruiterDetail.recruiterUserId]
    if (typeof count === 'number' && selectedRecruiterDetail.sourcedProfilesCount !== count) {
      setSelectedRecruiterDetail(prev => (prev ? { ...prev, sourcedProfilesCount: count } : prev))
    }
  }, [sourcedCountByUserId, selectedRecruiterDetail?.recruiterUserId])

  // Individual Analytics → Sourced: open the same candidate-info view as History Sourced KPI.
  useEffect(() => {
    let view = ''
    let rid = ''
    try {
      view = sessionStorage.getItem('pending_history_view') || ''
      rid = sessionStorage.getItem('pending_history_recruiter_id') || ''
    } catch {
      return
    }
    if (view !== 'sourced') return

    const clearPending = () => {
      try {
        sessionStorage.removeItem('pending_history_view')
        sessionStorage.removeItem('pending_history_recruiter_id')
      } catch {
        // ignore
      }
    }

    const isSelfView = role === 'recruiter' || (role === 'lead' && leadViewTab === 'self')
    const viewingOwn =
      !rid ||
      rid === myMongoUserId ||
      rid === meId ||
      (myRecruiterHistory?.recruiterUserId && rid === myRecruiterHistory.recruiterUserId)

    if (isSelfView && viewingOwn) {
      setRecruiterTab('sourced')
      setStatusFilter('All')
      setSelectedReqFilter(null)
      clearPending()
      return
    }

    // Admin / lead team view: wait for history rows, then open recruiter sourced modal.
    if (!rid) {
      clearPending()
      return
    }
    if (!RECRUITERS_HISTORY_DATA.length) return

    const item =
      RECRUITERS_HISTORY_DATA.find(r => r.recruiterUserId === rid) ||
      RECRUITERS_HISTORY_DATA.find(r => norm(r.recruiterEmail) === norm(rid)) ||
      null
    if (item) {
      if (role === 'lead') setLeadViewTab('team')
      setSelectedRecruiterDetail(item)
      setRecruiterDetailModalTab('sourced')
    }
    clearPending()
  }, [
    role,
    leadViewTab,
    myMongoUserId,
    meId,
    myRecruiterHistory?.recruiterUserId,
    RECRUITERS_HISTORY_DATA,
  ])

  // Filtered sourced candidates for Recruiter View
  const filteredMySourcedCandidates = useMemo(() => {
    if (!myRecruiterHistory) return []
    // Sourced Profiles KPI → real Candidate Repository list for this user
    if (statusFilter === 'All' && !selectedReqFilter) {
      const q = searchQuery.trim().toLowerCase()
      return repoSourcedRows.filter(cand => {
        if (!q) return true
        return (
          cand.candidateName.toLowerCase().includes(q) ||
          cand.requirementName.toLowerCase().includes(q) ||
          cand.clientName.toLowerCase().includes(q) ||
          cand.status.toLowerCase().includes(q) ||
          (cand.contactEmail || '').toLowerCase().includes(q) ||
          (cand.skills && cand.skills.some(s => s.toLowerCase().includes(q)))
        )
      })
    }
    return myRecruiterHistory.recentSourcedCandidates.filter(cand => {
      if (selectedReqFilter && cand.requirementName !== selectedReqFilter) return false
      if (statusFilter !== 'All' && cand.status !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        cand.candidateName.toLowerCase().includes(q) ||
        cand.requirementName.toLowerCase().includes(q) ||
        cand.clientName.toLowerCase().includes(q) ||
        cand.status.toLowerCase().includes(q) ||
        (cand.skills && cand.skills.some(s => s.toLowerCase().includes(q)))
      )
    })
  }, [myRecruiterHistory, searchQuery, selectedReqFilter, statusFilter, repoSourcedRows])

  const isSubmittedOrWorkingTable = statusFilter === 'Submitted' || statusFilter === 'Working'

  useEffect(() => {
    setProfileListPage(1)
  }, [statusFilter, searchQuery, selectedReqFilter])

  const paginatedProfileRows = useMemo(() => {
    if (!isSubmittedOrWorkingTable) return filteredMySourcedCandidates
    const start = (profileListPage - 1) * profileListPageSize
    return filteredMySourcedCandidates.slice(start, start + profileListPageSize)
  }, [filteredMySourcedCandidates, isSubmittedOrWorkingTable, profileListPage])

  // Export Super Admin CSV Handler
  const handleExportSuperAdminCSV = () => {
    const headers = [
      'Recruiter Name',
      'Email',
      'Role Title',
      'Team Lead',
      'Assigned Requirements',
      'Sourced Profiles (Repo History)',
      'Profiles Submitted',
      'Working Profiles (In Progress)',
      'On Hold Profiles',
      'Placed Candidates',
    ]

    const rows = filteredRecruiters.map(r => {
      return [
        `"${r.recruiterName}"`,
        `"${r.recruiterEmail}"`,
        `"${r.roleTitle}"`,
        `"${r.teamLead}"`,
        r.assignedRequirementsCount,
        r.sourcedProfilesCount,
        r.submittedProfilesCount,
        r.workingProfilesCount,
        r.onHoldProfilesCount,
        r.placedCount,
      ]
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `All_Recruiters_Performance_History_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export Recruiter Personal CSV Handler
  const handleExportRecruiterCSV = () => {
    if (!myRecruiterHistory) return

    const headersReq = ['Type', 'ID / Code', 'Name / Candidate', 'Client Account', 'Assigned / Sourced Date', 'Submissions / Status', 'Working Pipeline']
    const reqRows = myRecruiterHistory.assignedRequirementsList.map(r => [
      '"Requirement"',
      `"${r.id}"`,
      `"${r.reqName}"`,
      `"${r.clientName}"`,
      `"${r.assignedDate}"`,
      `"${r.submissionsCount} Submissions (${r.status})"`,
      `"${r.workingCount || 0} Working"`,
    ])

    const candRows = myRecruiterHistory.recentSourcedCandidates.map(c => [
      '"Sourced Candidate"',
      `"${c.id}"`,
      `"${c.candidateName} (${c.experience})"`,
      `"${c.clientName}"`,
      `"${c.sourcedDate}"`,
      `"${c.status}"`,
      `"${c.requirementName}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headersReq.join(','),
      ...reqRows.map(e => e.join(',')),
      '',
      ...candRows.map(e => e.join(',')),
    ].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `My_Sourcing_and_Requirement_History_${myRecruiterHistory.recruiterName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xl font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Access Module</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          The <strong>History</strong> module is accessible exclusively to active portal users.
        </p>
      </div>
    )
  }

  const sourcedCandidateDetailModal = selectedCandidateDetail ? (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 font-sans max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[#6B3BF6] text-white font-bold flex items-center justify-center text-sm shrink-0">
              {selectedCandidateDetail.candidateName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-slate-900 truncate">{selectedCandidateDetail.candidateName}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedCandidateDetail.candidateCode ? `ID: ${selectedCandidateDetail.candidateCode} · ` : ''}
                Exp: {selectedCandidateDetail.experience}
                {candidateDetailLoading ? ' · Refreshing…' : ''}
              </p>
              {(presentText(selectedCandidateDetail.requirementName) &&
                selectedCandidateDetail.requirementName !== 'Candidate Repository') ||
              (presentText(selectedCandidateDetail.clientName) && selectedCandidateDetail.clientName !== '—') ? (
                <p className="text-[11px] text-slate-500 font-semibold truncate">
                  {[
                    presentText(selectedCandidateDetail.requirementName) &&
                    selectedCandidateDetail.requirementName !== 'Candidate Repository'
                      ? selectedCandidateDetail.requirementName
                      : '',
                    presentText(selectedCandidateDetail.clientName) && selectedCandidateDetail.clientName !== '—'
                      ? selectedCandidateDetail.clientName
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCandidateDetail(null)}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
              <span className="font-bold text-slate-900 text-xs break-all">{selectedCandidateDetail.contactEmail || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
              <span className="font-bold text-slate-900 text-xs">{selectedCandidateDetail.contactPhone || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Company</span>
              <span className="font-bold text-slate-900 text-xs">{selectedCandidateDetail.currentCompany || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
              <span className="font-bold text-slate-900 text-xs">{selectedCandidateDetail.currentLocation || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Notice Period</span>
              <span className="font-bold text-slate-900 text-xs">{selectedCandidateDetail.noticePeriod || '—'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">CTC (Current / Expected)</span>
              <span className="font-bold text-slate-900 text-xs">
                {presentMoney(selectedCandidateDetail.currentCtc) || '—'} / {presentMoney(selectedCandidateDetail.expectedCtc) || '—'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Sourced Date</span>
              <span className="font-mono font-bold text-slate-900 text-xs">{selectedCandidateDetail.sourcedDate}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Status</span>
              <span className="font-extrabold text-purple-700 text-xs">{selectedCandidateDetail.status}</span>
            </div>
          </div>

          {selectedCandidateDetail.skills && selectedCandidateDetail.skills.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCandidateDetail.skills.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold border border-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Resume</span>
            <div className="flex flex-wrap items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                {selectedCandidateDetail.resumeReference || (selectedCandidateDetail.resumeFileId ? 'Resume on file' : 'No resume attached')}
              </span>
              <button
                type="button"
                onClick={() => downloadCandidateResume(selectedCandidateDetail)}
                disabled={!selectedCandidateDetail.resumeFileId && !selectedCandidateDetail.resumeReference}
                className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                  selectedCandidateDetail.resumeFileId || selectedCandidateDetail.resumeReference
                    ? 'bg-[#6B3BF6] hover:bg-[#5833E0] text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Download Resume
              </button>
            </div>
            {detailToast && (
              <p className="text-[11px] font-semibold text-[#6B3BF6]">{detailToast}</p>
            )}
          </div>

          {selectedCandidateDetail.notes && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notes</span>
              <p className="text-xs text-slate-700 bg-white border border-slate-200 rounded-xl p-3 leading-relaxed">
                {selectedCandidateDetail.notes}
              </p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedCandidateDetail(null)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  ) : null

  const requirementRecord = selectedRequirementDetail as (Requirement & RecruiterHistoryItem['assignedRequirementsList'][number]) | null
  const requirementDetailModal = requirementRecord ? (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-2xl font-sans max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="min-w-0">
            <p className="text-[11px] font-mono font-bold text-[#6B3BF6]">
              {requirementRecord.reqCode || requirementRecord.id}
            </p>
            <h3 className="text-base font-black text-slate-900 mt-1">{requirementRecord.title || requirementRecord.reqName}</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">{requirementRecord.client || requirementRecord.clientName || '—'}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedRequirementDetail(null)}
            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            ['Status', requirementRecord.status],
            ['Priority', requirementRecord.priority],
            ['Assignment', requirementRecord.assignmentStatus],
            ['Location', requirementRecord.location],
            ['Work mode', requirementRecord.workMode],
            ['Employment', requirementRecord.employmentType],
            ['Experience', requirementRecord.experience || requirementRecord.experienceLevel],
            ['Openings', requirementRecord.openings != null ? String(requirementRecord.openings) : ''],
            ['Client email', requirementRecord.clientEmail],
            ['Assigned to', requirementRecord.assignedRecruiterNames],
            ['Budget', presentText(requirementRecord.budget)],
            ['Submissions', requirementRecord.submissionsCount != null ? String(requirementRecord.submissionsCount) : (requirementRecord.submissions != null ? String(requirementRecord.submissions) : '')],
            ['Working', requirementRecord.workingCount != null ? String(requirementRecord.workingCount) : ''],
          ].filter(([, value]) => presentText(value)).map(([label, value]) => (
            <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">{label}</span>
              <span className="font-bold text-slate-900 text-xs break-all">{value}</span>
            </div>
          ))}
        </div>
        {Array.isArray(requirementRecord.skills) && requirementRecord.skills.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {requirementRecord.skills.filter(Boolean).map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {presentText(requirementRecord.description) && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</span>
            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
              {requirementRecord.description}
            </p>
          </div>
        )}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedRequirementDetail(null)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold cursor-pointer"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  ) : null

  // =========================================================================
  // VIEW A: RECRUITER PERSONAL HISTORY VIEW (Or Team Lead Individual View)
  // =========================================================================
  if (role === 'recruiter' || (role === 'lead' && leadViewTab === 'self')) {
    return (
      <div className="space-y-6 w-full pb-20 font-sans text-slate-800 animate-in fade-in duration-200">
        {/* TEAM LEAD SUB-TAB CONTROL BAR */}
        {role === 'lead' && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeadViewTab('self')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  leadViewTab === 'self'
                    ? 'bg-[#6B3BF6] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>My Individual Performance & History</span>
              </button>
              <button
                type="button"
                onClick={() => setLeadViewTab('team')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  leadViewTab === 'team'
                    ? 'bg-[#6B3BF6] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team Members Performance ({filteredRecruiters.length})</span>
              </button>
            </div>

            <div className="text-xs font-extrabold text-[#6B3BF6] bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
              Team Lead Module • {myRecruiterHistory?.recruiterName || currentUserName || '—'}
            </div>
          </div>
        )}

        {/* 1. HEADER & EXPORT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                My Performance & Requirement History
              </h1>
              <span className="px-2.5 py-0.5 bg-purple-50 text-[#6B3BF6] text-[11px] font-extrabold rounded-full border border-purple-200 flex items-center gap-1 shadow-2xs">
                <History className="w-3 h-3 text-[#6B3BF6]" />
                <span>{role === 'lead' ? 'Team Lead Module' : 'Recruiter Module'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Personal history tracking your assigned requirements, candidate repo profiles, submissions, pipeline, and on-hold records.
            </p>
          </div>

          {role !== 'recruiter' && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportRecruiterCSV}
                className="px-3 py-1.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export History Report (CSV)</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. COMPACT INTERACTIVE RECRUITER PERSONAL KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* ASSIGNED REQS */}
          <button
            onClick={() => {
              setRecruiterTab('requirements')
              setStatusFilter('All')
              setSelectedReqFilter(null)
            }}
            className={`rounded-xl p-2.5 shadow-2xs flex items-center justify-between text-left transition-all duration-200 ease-in-out cursor-pointer active:scale-98 ${
              recruiterTab === 'requirements' && !selectedReqFilter && statusFilter === 'All'
                ? 'bg-purple-100/90 border-2 border-[#6B3BF6] ring-2 ring-purple-500/30'
                : 'bg-purple-50/80 border border-purple-200/90 hover:border-purple-300 hover:shadow-xs'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B3BF6] block">Assigned Reqs</span>
              <div className="text-lg font-black text-slate-900 tracking-tight font-mono">
                {myRecruiterHistory?.assignedRequirementsCount ?? 0} Reqs
              </div>
              <span className="text-[9px] text-[#6B3BF6] font-bold block mt-0.5">Click to view list →</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#6B3BF6] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </button>

          {/* SOURCED PROFILES */}
          <button
            onClick={() => {
              setRecruiterTab('sourced')
              setStatusFilter('All')
              setSelectedReqFilter(null)
            }}
            className={`rounded-xl p-2.5 shadow-2xs flex items-center justify-between text-left transition-all duration-200 ease-in-out cursor-pointer active:scale-98 ${
              recruiterTab === 'sourced' && statusFilter === 'All' && !selectedReqFilter
                ? 'bg-purple-100/90 border-2 border-[#6B3BF6] ring-2 ring-purple-500/30'
                : 'bg-purple-50/80 border border-purple-200/90 hover:border-purple-300 hover:shadow-xs'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B3BF6] block">Sourced Profiles</span>
              <div className="text-lg font-black text-slate-900 tracking-tight font-mono">
                {myRecruiterHistory?.sourcedProfilesCount ?? 0} Sourced
              </div>
              <span className="text-[9px] text-[#6B3BF6] font-bold block mt-0.5">Click to view repo →</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#6B3BF6] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </button>

          {/* PROFILES SUBMITTED */}
          <button
            onClick={() => {
              setRecruiterTab('sourced')
              setStatusFilter('Submitted')
              setSelectedReqFilter(null)
            }}
            className={`rounded-xl p-2.5 shadow-2xs flex items-center justify-between text-left transition-all duration-200 ease-in-out cursor-pointer active:scale-98 ${
              recruiterTab === 'sourced' && statusFilter === 'Submitted'
                ? 'bg-slate-200/90 border-2 border-slate-600 ring-2 ring-slate-400/30'
                : 'bg-slate-100/90 border border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">Submitted Profiles</span>
              <div className="text-lg font-black text-slate-900 tracking-tight font-mono">
                {myRecruiterHistory?.submittedProfilesCount ?? 0} Submitted
              </div>
              <span className="text-[9px] text-slate-600 font-bold block mt-0.5">Click to view list →</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </button>

          {/* WORKING PROFILES */}
          <button
            onClick={() => {
              setRecruiterTab('sourced')
              setStatusFilter('Working')
              setSelectedReqFilter(null)
            }}
            className={`rounded-xl p-2.5 shadow-2xs flex items-center justify-between text-left transition-all duration-200 ease-in-out cursor-pointer active:scale-98 ${
              recruiterTab === 'sourced' && statusFilter === 'Working'
                ? 'bg-slate-200/90 border-2 border-slate-600 ring-2 ring-slate-400/30'
                : 'bg-slate-100/90 border border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 block">Working Profiles</span>
              <div className="text-lg font-black text-slate-900 tracking-tight font-mono">
                {myRecruiterHistory?.workingProfilesCount ?? 0} Working
              </div>
              <span className="text-[9px] text-slate-600 font-bold block mt-0.5">Click to view current working requirements →</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <PlayCircle className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* 4. CONTROLS BAR: SEARCH & TAB NAVIGATION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* SEARCH INPUT & BACK BUTTON */}
            <div className="flex items-center gap-2.5 w-full">
              {(recruiterTab === 'sourced' || selectedReqFilter || statusFilter !== 'All') && (
                <BackButton
                  label="Back to Requirements"
                  onClick={() => {
                    setRecruiterTab('requirements')
                    setSelectedReqFilter(null)
                    setStatusFilter('All')
                  }}
                />
              )}
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={recruiterTab === 'requirements' ? "Search assigned requirements, client, ID..." : "Search sourced candidates, requirements, skills..."}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
                />
              </div>
            </div>
          </div>

          {(selectedReqFilter || statusFilter !== 'All') && (
            <div className="flex flex-wrap items-center gap-2 bg-purple-50 text-[#6B3BF6] px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-medium">
              {selectedReqFilter && (
                <span>Requirement Filter: <strong>{selectedReqFilter}</strong></span>
              )}
              {statusFilter !== 'All' && (
                <span>Pipeline Status: <strong className="uppercase">{statusFilter}</strong></span>
              )}
              <button
                onClick={() => {
                  setSelectedReqFilter(null)
                  setStatusFilter('All')
                }}
                className="ml-auto text-purple-700 hover:text-purple-900 font-extrabold text-xs cursor-pointer flex items-center gap-1"
              >
                Clear Filter ✕
              </button>
            </div>
          )}
        </div>

        {/* 5. TAB CONTENT TABLES WITH SMOOTH FADE ANIMATION */}
        <div key={`${recruiterTab}-${statusFilter}-${selectedReqFilter || ''}`} className="animate-in fade-in duration-300 transition-all ease-in-out">

        {/* TAB 1: ASSIGNED REQUIREMENTS TABLE */}
        {recruiterTab === 'requirements' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6B3BF6]" />
                <h3 className="font-extrabold text-slate-900 text-sm">Assigned Requirements History</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Showing {filteredMyRequirements.length} assigned requirements</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">REQUIREMENT ID & TITLE</th>
                    <th className="py-3.5 px-4">CLIENT ACCOUNT</th>
                    <th className="py-3.5 px-4">ASSIGNED DATE</th>
                    <th className="py-3.5 px-4 text-center">SOURCED PROFILES</th>
                    <th className="py-3.5 px-4 text-center">SUBMISSIONS</th>
                    <th className="py-3.5 px-4 text-center">WORKING PIPELINE</th>
                    <th className="py-3.5 px-4 text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredMyRequirements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-sm">
                        No assigned requirement history matches your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedMyRequirements.map(req => (
                      <tr
                        key={req.id}
                        onClick={() => openAssignedRequirement(req)}
                        className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                        title="View requirement details"
                      >
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-extrabold text-slate-900 text-xs group-hover:text-[#6B3BF6] transition-colors">
                            {req.reqName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{req.id}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                            {req.clientName}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {req.assignedDate}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 bg-purple-50 text-[#6B3BF6] border border-purple-200 rounded-lg text-xs font-bold font-mono">
                            {req.sourcedCount || 0} Sourced
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono">
                            {req.submissionsCount} Submitted
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold font-mono">
                            {req.workingCount || 0} Working
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            req.status === 'In Progress' || req.status === 'Open'
                              ? 'bg-purple-50 text-[#6B3BF6] border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationFooter
              currentPage={myReqsPage}
              totalPages={Math.max(1, Math.ceil(filteredMyRequirements.length / myReqsPageSize))}
              totalItems={filteredMyRequirements.length}
              pageSize={myReqsPageSize}
              onPageChange={setMyReqsPage}
              onPageSizeChange={size => {
                setMyReqsPageSize(size)
                setMyReqsPage(1)
              }}
              itemLabel="requirements"
            />
          </div>
        )}

        {/* TAB 2: SOURCED PROFILES HISTORY TABLE */}
        {recruiterTab === 'sourced' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <BackButton
                  label="Back to Requirements"
                  onClick={() => {
                    setRecruiterTab('requirements')
                    setSelectedReqFilter(null)
                    setStatusFilter('All')
                  }}
                />
                <div className="h-5 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6B3BF6]" />
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {statusFilter === 'Submitted'
                      ? 'Submitted Profiles Sourcing History'
                      : statusFilter === 'Working'
                      ? 'Working Pipeline Candidates History'
                      : statusFilter === 'On Hold'
                      ? 'On-Hold Candidate Records History'
                      : 'Sourced Candidate Repository History'}
                  </h3>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {statusFilter === 'All' && !selectedReqFilter
                  ? repoSourcedLoading
                    ? 'Loading candidate repository…'
                    : `Showing ${filteredMySourcedCandidates.length} of ${repoSourcedTotal || myRecruiterHistory?.sourcedProfilesCount || 0} repository candidates`
                  : `Showing ${filteredMySourcedCandidates.length} sourced candidate records`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">CANDIDATE NAME & EXP</th>
                    <th className="py-3.5 px-4">TARGET REQUIREMENT</th>
                    <th className="py-3.5 px-4">CLIENT ACCOUNT</th>
                    <th className="py-3.5 px-4">SOURCED DATE</th>
                    <th className="py-3.5 px-4 text-center">PIPELINE STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {repoSourcedLoading && statusFilter === 'All' && !selectedReqFilter ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-sm">
                        Loading candidates from repository…
                      </td>
                    </tr>
                  ) : filteredMySourcedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-sm">
                        No sourced candidates match the specified search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedProfileRows.map(cand => (
                      <tr
                        key={cand.id}
                        onClick={() => openSourcedCandidateDetail(cand)}
                        className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
                        title="Click to view candidate details and resume"
                      >
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              openSourcedCandidateDetail(cand)
                            }}
                            className="text-left font-extrabold text-slate-900 text-xs group-hover:text-[#6B3BF6] hover:underline transition-colors cursor-pointer"
                          >
                            {cand.candidateName}
                          </button>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Exp: {cand.experience} • {cand.contactEmail || '—'}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{cand.requirementName}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                            {cand.clientName}
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {cand.sourcedDate}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          {cand.status === 'Submitted' || cand.status === 'Sourced' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-[#6B3BF6]" />
                              <span>{cand.status}</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                              <PauseCircle className="w-3 h-3 text-slate-500" />
                              <span>{cand.status}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {isSubmittedOrWorkingTable && (
              <PaginationFooter
                currentPage={profileListPage}
                totalPages={Math.max(1, Math.ceil(filteredMySourcedCandidates.length / profileListPageSize))}
                totalItems={filteredMySourcedCandidates.length}
                pageSize={profileListPageSize}
                onPageChange={setProfileListPage}
                itemLabel="profiles"
              />
            )}

            {statusFilter === 'All' && !selectedReqFilter && repoSourcedTotal > repoSourcedPageSize && (
              <PaginationFooter
                currentPage={repoSourcedPage}
                totalPages={Math.max(1, Math.ceil(repoSourcedTotal / repoSourcedPageSize))}
                totalItems={repoSourcedTotal}
                pageSize={repoSourcedPageSize}
                onPageChange={page => {
                  const userId = myMongoUserId || myRecruiterHistory?.recruiterUserId || ''
                  if (userId) loadRepoSourcedForUser(userId, page, repoSourcedPageSize)
                }}
                onPageSizeChange={size => {
                  setRepoSourcedPageSize(size)
                  const userId = myMongoUserId || myRecruiterHistory?.recruiterUserId || ''
                  if (userId) loadRepoSourcedForUser(userId, 1, size)
                }}
                itemLabel="candidates"
              />
            )}
          </div>
        )}
        </div>

        {sourcedCandidateDetailModal}
        {requirementDetailModal}
      </div>
    )
  }

  // =========================================================================
  // VIEW B: SUPER ADMIN / ADMIN / TEAM LEAD DASHBOARD HISTORY VIEW (TEAM MEMBERS / ALL RECRUITERS)
  // =========================================================================
  return (
    <div className="space-y-6 w-full pb-20 font-sans text-slate-800 animate-in fade-in duration-200">
      {/* TEAM LEAD SUB-TAB CONTROL BAR */}
      {role === 'lead' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLeadViewTab('self')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                leadViewTab === 'self'
                  ? 'bg-[#6B3BF6] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>My Individual Performance & History</span>
            </button>
            <button
              type="button"
              onClick={() => setLeadViewTab('team')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                leadViewTab === 'team'
                  ? 'bg-[#6B3BF6] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team Members Performance ({filteredRecruiters.length})</span>
            </button>
          </div>

          <div className="text-xs font-extrabold text-[#6B3BF6] bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
            Team Lead Module • {myRecruiterHistory?.recruiterName || currentUserName || '—'}
          </div>
        </div>
      )}

      {/* 1. HEADER & EXPORT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {role === 'lead' ? 'Team Members Performance & Sourcing History' : 'Recruiter Performance & Sourcing History'}
            </h1>
            <span className="px-3 py-1 bg-purple-50 text-[#6B3BF6] text-xs font-extrabold rounded-full border border-purple-200 flex items-center gap-1.5 shadow-2xs">
              <History className="w-3.5 h-3.5 text-[#6B3BF6]" />
              <span>{role === 'lead' ? 'Team Lead Module' : 'Admin & Super Admin Module'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'lead'
              ? `Tracking assigned requirements, repository sourced profiles, submitted candidates, and working pipeline records for ${myRecruiterHistory?.recruiterName || currentUserName || '—'}'s team members.`
              : 'Centralized history tracking assigned requirements, repository sourced profiles, submitted candidates, active working pipeline, and on-hold candidate records per recruiter.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSuperAdminCSV}
            className="px-4 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{role === 'lead' ? 'Export Team History Report (CSV)' : 'Export History Report (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI CARDS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ASSIGNED REQUIREMENTS */}
        <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B3BF6]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Assigned Reqs</span>
            <Layers className="w-4 h-4 text-[#6B3BF6]" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totals.requirements} Reqs
          </div>
          <div className="text-[11px] text-[#6B3BF6] font-semibold">
            {role === 'superadmin' || role === 'admin'
              ? 'All requirements in the organization'
              : 'Active requirement allocations'}
          </div>
        </div>

        {/* SOURCED PROFILES (CANDIDATE REPO HISTORY) */}
        <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-[#6B3BF6]">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Sourced Profiles</span>
            <Users className="w-4 h-4 text-[#6B3BF6]" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totals.sourced} Sourced
          </div>
          <div className="text-[11px] text-[#6B3BF6] font-semibold">
            {role === 'superadmin' || role === 'admin'
              ? 'Total candidate repository (org-wide)'
              : 'Added to candidate repository'}
          </div>
        </div>

        {/* PROFILES SUBMITTED */}
        <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Submitted Profiles</span>
            <FileText className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totals.submitted} Submitted
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            {role === 'superadmin' || role === 'admin'
              ? 'All client submissions in the organization'
              : 'Pushed to client submissions'}
          </div>
        </div>

        {/* WORKING PROFILES */}
        <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Working Profiles</span>
            <PlayCircle className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totals.working} Working
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            {role === 'superadmin' || role === 'admin'
              ? 'Org-wide active interview pipeline'
              : 'Active in interview pipeline'}
          </div>
        </div>

        {/* ON HOLD PROFILES */}
        <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">On-Hold Profiles</span>
            <PauseCircle className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {totals.onHold} On Hold
          </div>
          <div className="text-[11px] text-slate-600 font-semibold">
            {role === 'superadmin' || role === 'admin'
              ? 'Org-wide paused candidates'
              : 'Temporarily paused candidates'}
          </div>
        </div>
      </div>

      {/* 3. SEARCH CONTROL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recruiter, email, client, skills..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
          />
        </div>
      </div>

      {/* 4. RECRUITER HISTORY MASTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4">RECRUITER NAME & TEAM LEAD</th>
                <th className="py-3.5 px-4 text-center">ASSIGNED REQS</th>
                <th className="py-3.5 px-4 text-center">SOURCED PROFILES (REPO)</th>
                <th className="py-3.5 px-4 text-center">SUBMISSIONS</th>
                <th className="py-3.5 px-4">SUBMITTED CLIENTS</th>
                <th className="py-3.5 px-4 text-center">INTERVIEWS</th>
                <th className="py-3.5 px-4 text-center">WORKING PROFILES</th>
                <th className="py-3.5 px-4 text-center">ON HOLD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {paginatedRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold text-sm">
                    No recruiter history records match the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecruiters.map(item => {
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setModalReqsPage(1)
                        setSelectedRecruiterDetail(item)
                      }}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                    >
                      {/* RECRUITER NAME & TEAM LEAD */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B3BF6] border border-purple-200 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                            {item.recruiterAvatar}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs group-hover:text-[#6B3BF6] transition-colors">
                              {item.recruiterName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">{item.roleTitle}</div>
                            <div className="text-[10px] text-[#6B3BF6] font-extrabold flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3 text-[#6B3BF6]" />
                              <span>Team Lead: {item.teamLead}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ASSIGNED REQS */}
                      <td className="py-4 px-4 whitespace-nowrap text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setModalReqsPage(1)
                            setRecruiterDetailModalTab('requirements')
                            setSelectedRecruiterDetail(item)
                          }}
                          className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 tabular-nums transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                          title={`Click to view all ${item.assignedRequirementsCount} worked requirements for ${item.recruiterName}`}
                        >
                          {item.assignedRequirementsCount} Reqs
                        </button>
                      </td>

                      {/* SOURCED PROFILES (REPO HISTORY) */}
                      <td className="py-4 px-4 whitespace-nowrap text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setRecruiterDetailModalTab('sourced')
                            setSelectedRecruiterDetail(item)
                          }}
                          className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 tabular-nums transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                          title={`Click to view all ${item.sourcedProfilesCount} sourced profiles for ${item.recruiterName}`}
                        >
                          {item.sourcedProfilesCount} Sourced
                        </button>
                      </td>

                      {/* SUBMISSIONS */}
                      <td className="py-4 px-4 whitespace-nowrap text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setRecruiterDetailModalTab('sourced')
                            setSelectedRecruiterDetail(item)
                          }}
                          className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#5B51D8] border border-[#C7D2FE] tabular-nums transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                          title={`Click to view all ${item.submittedProfilesCount} submissions by ${item.recruiterName}`}
                        >
                          {item.submittedProfilesCount} Submissions
                        </button>
                      </td>

                      {/* SUBMITTED CLIENTS */}
                      <td className="py-4 px-4 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <SubmittedClientsPillCell
                          clients={item.clientAccounts}
                          onSelectClient={(selectedClient) => {
                            setSearchQuery(selectedClient)
                          }}
                        />
                      </td>

                      {/* INTERVIEWS */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                          {item.interviewsCount ?? 0} Interviews
                        </span>
                      </td>

                      {/* WORKING PROFILES */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                          {item.workingProfilesCount} Working
                        </span>
                      </td>

                      {/* ON HOLD PROFILES */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                          {item.onHoldProfilesCount} On Hold
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredRecruiters.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. RECRUITER FULL HISTORY INSPECTION MODAL */}
      {sourcedCandidateDetailModal}
      {requirementDetailModal}

      {selectedRecruiterDetail && (() => {
        const fullReqsList = getFullAssignedRequirements(selectedRecruiterDetail)
        const fullSourcedList = getFullSourcedCandidates(selectedRecruiterDetail)
        const modalReqsStart = (modalReqsPage - 1) * modalReqsPageSize
        const paginatedModalReqs = fullReqsList.slice(modalReqsStart, modalReqsStart + modalReqsPageSize)

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 font-sans max-h-[90vh] overflow-y-auto">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6B3BF6] font-black text-base flex items-center justify-center shrink-0 border border-purple-200 shadow-xs">
                    {selectedRecruiterDetail.recruiterAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{selectedRecruiterDetail.recruiterName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                        {selectedRecruiterDetail.roleTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Lead: <strong>{selectedRecruiterDetail.teamLead}</strong> • Clients: <strong>{selectedRecruiterDetail.clientAccounts.join(', ')}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRecruiterDetail(null)}
                  className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* STATS OVERVIEW CARDS (Interactive - 2 Pastel Colors) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setRecruiterDetailModalTab('requirements')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    recruiterDetailModalTab === 'requirements'
                      ? 'bg-purple-100/90 border-purple-300 shadow-xs ring-2 ring-purple-400/30 scale-102'
                      : 'bg-purple-50/80 hover:bg-purple-100/50 border-purple-200'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#6B3BF6] uppercase block">Assigned Reqs</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{selectedRecruiterDetail.assignedRequirementsCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecruiterDetailModalTab('sourced')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    recruiterDetailModalTab === 'sourced'
                      ? 'bg-purple-100/90 border-purple-300 shadow-xs ring-2 ring-purple-400/30 scale-102'
                      : 'bg-purple-50/80 hover:bg-purple-100/50 border-purple-200'
                  }`}
                >
                  <span className="text-[10px] font-bold text-[#6B3BF6] uppercase block">Sourced Profiles</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{selectedRecruiterDetail.sourcedProfilesCount}</span>
                </button>

                <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-700 uppercase block">Submissions</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{selectedRecruiterDetail.submittedProfilesCount}</span>
                </div>

                <div className="p-3 bg-slate-100/90 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-700 uppercase block">Working Pipeline</span>
                  <span className="text-xl font-black text-slate-900 font-mono">{selectedRecruiterDetail.workingProfilesCount}</span>
                </div>
              </div>

              {/* MODAL NAVIGATION TABS */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setRecruiterDetailModalTab('requirements')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    recruiterDetailModalTab === 'requirements'
                      ? 'bg-[#6B3BF6] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Assigned Requirements ({fullReqsList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecruiterDetailModalTab('sourced')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    recruiterDetailModalTab === 'sourced'
                      ? 'bg-[#6B3BF6] text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    Sourced Profiles (
                    {selectedRecruiterDetail.sourcedProfilesCount ||
                      repoSourcedTotal ||
                      fullSourcedList.length}
                    )
                  </span>
                </button>
              </div>

              {/* TAB CONTENT 1: ASSIGNED REQUIREMENTS TABLE */}
              {recruiterDetailModalTab === 'requirements' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    All Worked & Assigned Requirements for {selectedRecruiterDetail.recruiterName} ({fullReqsList.length} REQs)
                  </h4>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] font-bold text-slate-600 uppercase">
                            <th className="py-2.5 px-3">REQ ID</th>
                            <th className="py-2.5 px-3">JOB TITLE</th>
                            <th className="py-2.5 px-3">CLIENT</th>
                            <th className="py-2.5 px-3">ASSIGNED DATE</th>
                            <th className="py-2.5 px-3 text-center">SOURCED</th>
                            <th className="py-2.5 px-3 text-center">SUBMISSIONS</th>
                            <th className="py-2.5 px-3 text-center">WORKING</th>
                            <th className="py-2.5 px-3 text-center">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 text-slate-800 font-medium">
                          {paginatedModalReqs.map((req, idx) => (
                            <tr
                              key={req.id || idx}
                              onClick={() => openAssignedRequirement(req)}
                              className="hover:bg-white transition-colors cursor-pointer"
                              title="View requirement details"
                            >
                              <td className="py-2.5 px-3 font-mono font-extrabold text-[#6B3BF6]">
                                {req.id}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate">
                                {req.reqName}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                                  {req.clientName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                                {req.assignedDate}
                              </td>
                              <td className="py-2.5 px-3 text-center font-extrabold text-[#6B3BF6]">
                                {req.sourcedCount || 0}
                              </td>
                              <td className="py-2.5 px-3 text-center font-extrabold text-slate-700">
                                {req.submissionsCount}
                              </td>
                              <td className="py-2.5 px-3 text-center font-extrabold text-slate-700">
                                {req.workingCount || 0}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                  req.status === 'In Progress' || req.status === 'Open'
                                    ? 'bg-purple-50 text-[#6B3BF6] border-purple-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <PaginationFooter
                      currentPage={modalReqsPage}
                      totalPages={Math.max(1, Math.ceil(fullReqsList.length / modalReqsPageSize))}
                      totalItems={fullReqsList.length}
                      pageSize={modalReqsPageSize}
                      onPageChange={setModalReqsPage}
                      onPageSizeChange={size => {
                        setModalReqsPageSize(size)
                        setModalReqsPage(1)
                      }}
                      itemLabel="requirements"
                    />
                  </div>
                </div>
              )}

              {/* TAB CONTENT 2: SOURCED PROFILES HISTORY TABLE */}
              {recruiterDetailModalTab === 'sourced' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Candidate Repository for {selectedRecruiterDetail.recruiterName} (
                    {selectedRecruiterDetail.sourcedProfilesCount || repoSourcedTotal || fullSourcedList.length} Profiles
                    )
                    {repoSourcedLoading ? ' · Loading…' : ''}
                  </h4>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] font-bold text-slate-600 uppercase">
                            <th className="py-2.5 px-3">CANDIDATE NAME</th>
                            <th className="py-2.5 px-3">REQUIREMENT & CLIENT</th>
                            <th className="py-2.5 px-3">SOURCED DATE</th>
                            <th className="py-2.5 px-3 text-center">CURRENT STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 text-slate-800 font-medium">
                          {repoSourcedLoading ? (
                            <tr>
                              <td colSpan={4} className="py-10 text-center text-slate-400 font-bold">
                                Loading candidates from repository…
                              </td>
                            </tr>
                          ) : fullSourcedList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-10 text-center text-slate-400 font-bold">
                                No candidates found in repository for this user.
                              </td>
                            </tr>
                          ) : fullSourcedList.map((cand, idx) => (
                            <tr
                              key={cand.id || idx}
                              onClick={() => openSourcedCandidateDetail(cand)}
                              className="hover:bg-white transition-colors cursor-pointer group"
                              title="Click to view candidate details and resume"
                            >
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation()
                                    openSourcedCandidateDetail(cand)
                                  }}
                                  className="text-left font-bold text-slate-900 group-hover:text-[#6B3BF6] hover:underline cursor-pointer"
                                >
                                  {cand.candidateName}
                                </button>
                                <span className="text-[10px] text-slate-400 font-normal block">{cand.experience}</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{cand.requirementName}</div>
                                <div className="text-[10px] text-[#6B3BF6] font-bold">{cand.clientName}</div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                                {cand.sourcedDate}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {cand.status === 'Submitted' || cand.status === 'Sourced' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                                    {cand.status}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                                    {cand.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {repoSourcedTotal > repoSourcedPageSize && selectedRecruiterDetail.recruiterUserId && (
                      <PaginationFooter
                        currentPage={repoSourcedPage}
                        totalPages={Math.max(1, Math.ceil(repoSourcedTotal / repoSourcedPageSize))}
                        totalItems={repoSourcedTotal}
                        pageSize={repoSourcedPageSize}
                        onPageChange={page =>
                          loadRepoSourcedForUser(
                            selectedRecruiterDetail.recruiterUserId || '',
                            page,
                            repoSourcedPageSize,
                          )
                        }
                        onPageSizeChange={size => {
                          setRepoSourcedPageSize(size)
                          loadRepoSourcedForUser(selectedRecruiterDetail.recruiterUserId || '', 1, size)
                        }}
                        itemLabel="candidates"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedRecruiterDetail(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
                >
                  Close History Details
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
