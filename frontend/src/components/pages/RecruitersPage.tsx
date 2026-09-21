import React, { useState, useMemo } from 'react'
import {
  Users,
  UserCheck,
  Building2,
  Search,
  Clock,
  Send,
  FileText,
  ShieldCheck,
  ChevronDown,
  TrendingUp,
  Award,
  Zap,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Plus,
  X,
  User,
  Lock,
  Save,
} from 'lucide-react'
import { Role } from '../../types'
import { PaginationFooter } from '../ui/PaginationFooter'
import { DEMO_ACCOUNTS } from '../../data/mockData'
import { getRecruiterScreenTime, formatDurationShort, canViewScreenTime } from '../../utils/screenTimeTracker'

export interface RecruiterOverviewItem {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  teamLead: string
  clientNames: string[]
  totalRequirements: number
  totalSubmissions: number
  tatDays: number // e.g. 1.8 Days
  totalInterviews: number
  performanceStatus: 'Top Performer' | 'On Track' | 'Needs Attention'
}

const INITIAL_RECRUITERS_DATA: RecruiterOverviewItem[] = [
  {
    id: 'rec-1',
    name: 'Harish Gadipally',
    email: 'harish.g@metaforgeit.com',
    avatar: 'H',
    role: 'Team Lead & Senior Recruiter',
    teamLead: 'Harish Gadipally (Self)',
    clientNames: ['Accenture', 'LTTS'],
    totalRequirements: 45,
    totalSubmissions: 142,
    tatDays: 1.5,
    totalInterviews: 38,
    performanceStatus: 'Top Performer',
  },
  {
    id: 'rec-2',
    name: 'Marcus Chen',
    email: 'm.chen@talentflow.io',
    avatar: 'M',
    role: 'Senior Technical Recruiter',
    teamLead: 'Harish Gadipally',
    clientNames: ['Accenture'],
    totalRequirements: 14,
    totalSubmissions: 48,
    tatDays: 1.8,
    totalInterviews: 12,
    performanceStatus: 'Top Performer',
  },
  {
    id: 'rec-3',
    name: 'Priya Sharma',
    email: 'p.sharma@talentflow.io',
    avatar: 'P',
    role: 'IT Recruiter',
    teamLead: 'Harish Gadipally',
    clientNames: ['Accenture'],
    totalRequirements: 12,
    totalSubmissions: 36,
    tatDays: 2.1,
    totalInterviews: 9,
    performanceStatus: 'On Track',
  },
  {
    id: 'rec-4',
    name: 'Suresh kulkarni',
    email: 'suresh.k@talentflow.io',
    avatar: 'S',
    role: 'Technical Recruiter',
    teamLead: 'Harish Gadipally',
    clientNames: ['Accenture'],
    totalRequirements: 8,
    totalSubmissions: 24,
    tatDays: 2.4,
    totalInterviews: 6,
    performanceStatus: 'On Track',
  },
  {
    id: 'rec-5',
    name: 'lakshmi.v Recruiter',
    email: 'lakshmi.v@talentflow.io',
    avatar: 'L',
    role: 'Lead Recruiter',
    teamLead: 'Tom Walsh',
    clientNames: ['Goldman Sachs'],
    totalRequirements: 18,
    totalSubmissions: 54,
    tatDays: 1.9,
    totalInterviews: 14,
    performanceStatus: 'Top Performer',
  },
  {
    id: 'rec-6',
    name: 'Lingoji Pavani',
    email: 'lingoji.p@talentflow.io',
    avatar: 'L',
    role: 'Senior Technical Recruiter',
    teamLead: 'Tom Walsh',
    clientNames: ['Goldman Sachs'],
    totalRequirements: 10,
    totalSubmissions: 28,
    tatDays: 2.3,
    totalInterviews: 7,
    performanceStatus: 'On Track',
  },
  {
    id: 'rec-7',
    name: 'Arvind GR',
    email: 'arvind.g@talentflow.io',
    avatar: 'A',
    role: 'Technical Sourcing Recruiter',
    teamLead: 'Tom Walsh',
    clientNames: ['Goldman Sachs'],
    totalRequirements: 6,
    totalSubmissions: 16,
    tatDays: 2.8,
    totalInterviews: 4,
    performanceStatus: 'On Track',
  },
  {
    id: 'rec-8',
    name: 'rahimoon Shaik',
    email: 'rahimoon.s@talentflow.io',
    avatar: 'R',
    role: 'Automotive Sourcing Specialist',
    teamLead: 'Nina Brooks',
    clientNames: ['Tesla'],
    totalRequirements: 14,
    totalSubmissions: 42,
    tatDays: 2.0,
    totalInterviews: 11,
    performanceStatus: 'Top Performer',
  },
  {
    id: 'rec-9',
    name: 'Adirala sathvika',
    email: 'adirala.s@talentflow.io',
    avatar: 'A',
    role: 'Software Recruiter',
    teamLead: 'Nina Brooks',
    clientNames: ['Tesla'],
    totalRequirements: 8,
    totalSubmissions: 22,
    tatDays: 2.5,
    totalInterviews: 5,
    performanceStatus: 'On Track',
  },
  {
    id: 'rec-10',
    name: 'Charlie Darwin',
    email: 'charlie.d@talentflow.io',
    avatar: 'C',
    role: 'Technical Sourcing Lead',
    teamLead: 'Nina Brooks',
    clientNames: ['Tesla'],
    totalRequirements: 6,
    totalSubmissions: 20,
    tatDays: 2.2,
    totalInterviews: 4,
    performanceStatus: 'On Track',
  },
  {
    id: 'rec-11',
    name: 'Harini Sindey',
    email: 'harini.s@talentflow.io',
    avatar: 'H',
    role: 'Enterprise Recruiter',
    teamLead: 'Ray Diaz',
    clientNames: ['ITC Limited'],
    totalRequirements: 10,
    totalSubmissions: 32,
    tatDays: 2.1,
    totalInterviews: 8,
    performanceStatus: 'On Track',
  },
  {
    id: 'rec-12',
    name: 'Viswanath Reddy',
    email: 'viswanath.r@talentflow.io',
    avatar: 'V',
    role: 'SAP Recruiter',
    teamLead: 'Ray Diaz',
    clientNames: ['ITC Limited'],
    totalRequirements: 8,
    totalSubmissions: 24,
    tatDays: 2.6,
    totalInterviews: 6,
    performanceStatus: 'On Track',
  },
]

interface RecruitersPageProps {
  role?: Role
}

export function RecruitersPage({ role = 'superadmin' }: RecruitersPageProps) {
  const [recruitersList, setRecruitersList] = useState<RecruiterOverviewItem[]>(INITIAL_RECRUITERS_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [clientFilter, setClientFilter] = useState('All Clients')
  const [teamLeadFilter, setTeamLeadFilter] = useState('All Team Leads')
  const [sortBy, setSortBy] = useState<'submissions' | 'tat' | 'reqs'>('submissions')

  // Add Recruiter Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newRecruiterName, setNewRecruiterName] = useState('')
  const [newRecruiterEmail, setNewRecruiterEmail] = useState('')
  const [newRecruiterRole, setNewRecruiterRole] = useState('Technical Recruiter')
  const [newAssignedLead, setNewAssignedLead] = useState('Harish Gadipally')
  const [newAssignedClient, setNewAssignedClient] = useState('Accenture')
  const [newTatTarget, setNewTatTarget] = useState('2.0')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleCreateRecruiter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRecruiterName.trim() || !newRecruiterEmail.trim()) return

    const newRecord: RecruiterOverviewItem = {
      id: `rec-${Date.now()}`,
      name: newRecruiterName.trim(),
      email: newRecruiterEmail.trim(),
      avatar: newRecruiterName.trim().charAt(0).toUpperCase(),
      role: newRecruiterRole,
      teamLead: newAssignedLead,
      clientNames: [newAssignedClient],
      totalRequirements: 5,
      totalSubmissions: 12,
      tatDays: parseFloat(newTatTarget) || 2.0,
      totalInterviews: 3,
      performanceStatus: 'On Track',
    }

    setRecruitersList([newRecord, ...recruitersList])
    setIsAddModalOpen(false)
    setNewRecruiterName('')
    setNewRecruiterEmail('')
    showToast(`Successfully onboarded recruiter ${newRecord.name} assigned to ${newAssignedLead} (${newAssignedClient})!`)
  }

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Adjust Client Modal State
  const [adjustClientRecruiter, setAdjustClientRecruiter] = useState<RecruiterOverviewItem | null>(null)
  const [selectedClientForAdjust, setSelectedClientForAdjust] = useState<string>('Accenture')

  // Unique clients list
  const uniqueClients = useMemo(() => {
    const clients = new Set<string>()
    recruitersList.forEach(r => r.clientNames.forEach(c => clients.add(c)))
    return Array.from(clients)
  }, [recruitersList])

  // Unique team leads list
  const uniqueTeamLeads = useMemo(() => {
    const leads = new Set<string>()
    recruitersList.forEach(r => leads.add(r.teamLead))
    return Array.from(leads)
  }, [recruitersList])

  // Summary Metrics
  const totalRecruiters = recruitersList.length
  const avgTatDays = useMemo(() => {
    const sum = recruitersList.reduce((acc, r) => acc + r.tatDays, 0)
    return (sum / recruitersList.length).toFixed(1)
  }, [recruitersList])

  const totalReqsHandled = useMemo(() => {
    return recruitersList.reduce((acc, r) => acc + r.totalRequirements, 0)
  }, [recruitersList])

  const totalSubmissionsSourced = useMemo(() => {
    return recruitersList.reduce((acc, r) => acc + r.totalSubmissions, 0)
  }, [recruitersList])

  // Filtered & Sorted Recruiters
  const filteredRecruiters = useMemo(() => {
    let result = recruitersList.filter(r => {
      if (clientFilter !== 'All Clients' && !r.clientNames.includes(clientFilter)) return false
      if (teamLeadFilter !== 'All Team Leads' && r.teamLead !== teamLeadFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = r.name.toLowerCase().includes(q)
        const matchEmail = r.email.toLowerCase().includes(q)
        const matchLead = r.teamLead.toLowerCase().includes(q)
        const matchClient = r.clientNames.some(c => c.toLowerCase().includes(q))
        if (!matchName && !matchEmail && !matchLead && !matchClient) return false
      }

      return true
    })

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'tat') return a.tatDays - b.tatDays // Faster TAT first
      if (sortBy === 'reqs') return b.totalRequirements - a.totalRequirements
      return b.totalSubmissions - a.totalSubmissions // Default: Highest submissions
    })

    return result
  }, [recruitersList, clientFilter, teamLeadFilter, searchQuery, sortBy])

  // Paginated List
  const paginatedRecruiters = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecruiters.slice(start, start + pageSize)
  }, [filteredRecruiters, currentPage, pageSize])

  const totalPages = Math.ceil(filteredRecruiters.length / pageSize) || 1

  const getStatusBadge = (status: RecruiterOverviewItem['performanceStatus']) => {
    switch (status) {
      case 'Top Performer':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Top Performer</span>
          </span>
        )
      case 'On Track':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>On Track</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 w-full pb-20 font-sans text-slate-800 animate-in fade-in duration-200">
      {/* 1. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiters Performance & Assignments</h1>
            <span className="px-3 py-1 bg-purple-50 text-[#6B3BF6] text-xs font-extrabold rounded-full border border-purple-200 flex items-center gap-1.5 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#6B3BF6]" />
              <span>All Active Recruiters</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track recruiter performance metrics including assigned client accounts, total requirements, submissions, and SLA TAT speed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (role === 'admin') {
                showToast('Notice: User/Recruiter creation is permitted by Super Admin and Dev Team only.')
              } else {
                setIsAddModalOpen(true)
              }
            }}
            className="px-4 py-2.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>+ Add New Recruiter</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Recruiters */}
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider">Total Active Recruiters</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalRecruiters} Recruiters</p>
          <span className="text-[10px] text-purple-700 font-bold">Across 4 Dedicated Client Teams</span>
        </div>

        {/* Avg SLA Turnaround Time (TAT) */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">Average SLA TAT</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{avgTatDays} Days TAT</p>
          <span className="text-[10px] text-emerald-700 font-bold">Fastest Turnaround Time: 1.5 Days</span>
        </div>

        {/* Total Requirements */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider">Requirements Handled</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalReqsHandled} Reqs</p>
          <span className="text-[10px] text-blue-700 font-bold">Assigned by Team Leads</span>
        </div>

        {/* Total Sourced Submissions */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 shadow-2xs border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-purple-300 uppercase tracking-wider">Total Submissions Sourced</span>
            <Send className="w-4 h-4 text-purple-300" />
          </div>
          <p className="text-3xl font-extrabold text-white tabular-nums">{totalSubmissionsSourced}</p>
          <span className="text-[10px] text-slate-300 font-medium">Candidate profiles submitted to clients</span>
        </div>
      </div>

      {/* 3. CONTROLS & FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recruiter name, team lead, or client..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Client Filter */}
            <div className="relative">
              <select
                value={clientFilter}
                onChange={e => {
                  setClientFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
              >
                <option value="All Clients">All Assigned Clients</option>
                {uniqueClients.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Team Lead Filter */}
            <div className="relative">
              <select
                value={teamLeadFilter}
                onChange={e => {
                  setTeamLeadFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
              >
                <option value="All Team Leads">All Team Leads</option>
                {uniqueTeamLeads.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-purple-50 text-[#6B3BF6] border border-purple-200 rounded-xl font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="submissions">Sort: Highest Submissions</option>
                <option value="tat">Sort: Fastest TAT (Turnaround)</option>
                <option value="reqs">Sort: Total Requirements</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B3BF6] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECRUITERS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">RECRUITER NAME</th>
                {role !== 'recruiter' && (
                  <th className="py-3.5 px-4 text-center">SCREEN TIME (RECORDED)</th>
                )}
                <th className="py-3.5 px-4">TEAM LEAD</th>
                <th className="py-3.5 px-4">ASSIGNED CLIENT(S)</th>
                <th className="py-3.5 px-4 text-center">TOTAL REQUIREMENTS</th>
                <th className="py-3.5 px-4 text-center">TOTAL SUBMISSIONS</th>
                <th className="py-3.5 px-4 text-center">TAT (TURNAROUND TIME)</th>
                <th className="py-3.5 px-4 text-center">INTERVIEWS</th>
                <th className="py-3.5 px-4">PERFORMANCE STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {paginatedRecruiters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-bold text-sm">
                    No recruiters match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecruiters.map((recruiter, idx) => (
                  <tr key={recruiter.id} className="hover:bg-purple-50/40 transition-colors">
                    {/* # */}
                    <td className="py-4 px-4 font-extrabold text-slate-400 text-xs">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    {/* RECRUITER NAME */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                          {recruiter.avatar}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{recruiter.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{recruiter.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* SCREEN TIME (RECORDED) */}
                    {role !== 'recruiter' && (
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {(() => {
                          const currentUser = DEMO_ACCOUNTS[role] || { name: 'Current User' }
                          const isAllowed = canViewScreenTime(role, currentUser.name, recruiter.name, recruiter.teamLead)
                          if (!isAllowed) {
                            return (
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-[11px] font-bold"
                                title="Screen time privacy: Only visible to self, team lead, and admin"
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>Private</span>
                              </span>
                            )
                          }
                          const recST = getRecruiterScreenTime(recruiter.name)
                          return (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-[#6B3BF6] border border-purple-200 text-xs font-black">
                                <Clock className="w-3 h-3 text-[#6B3BF6]" />
                                <span>{formatDurationShort(recST.activeSeconds)}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${recST.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Recorded Usage</span>
                            </div>
                          )
                        })()}
                      </td>
                    )}

                    {/* TEAM LEAD */}
                    <td className="py-4 px-4 whitespace-nowrap font-extrabold text-slate-800">
                      <div className="flex items-center gap-1.5 text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{recruiter.teamLead}</span>
                      </div>
                    </td>

                    {/* ASSIGNED CLIENT(S) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {recruiter.clientNames.map(client => (
                          <span
                            key={client}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200 flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-purple-600" />
                            <span>{client}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* TOTAL REQUIREMENTS */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 tabular-nums">
                        {recruiter.totalRequirements} Reqs
                      </span>
                    </td>

                    {/* TOTAL SUBMISSIONS */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-900 border border-purple-200 tabular-nums">
                        {recruiter.totalSubmissions} Submissions
                      </span>
                    </td>

                    {/* TAT (TURNAROUND TIME) */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 tabular-nums">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>{recruiter.tatDays} Days TAT</span>
                      </div>
                    </td>

                    {/* INTERVIEWS */}
                    <td className="py-4 px-4 whitespace-nowrap text-center font-extrabold text-slate-800 tabular-nums text-xs">
                      {recruiter.totalInterviews} Interviews
                    </td>

                    {/* PERFORMANCE STATUS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getStatusBadge(recruiter.performanceStatus)}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setAdjustClientRecruiter(recruiter)
                          setSelectedClientForAdjust(recruiter.clientNames[0] || 'Accenture')
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] font-extrabold text-xs border border-purple-200 shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1 active:scale-98"
                        title="Adjust Assigned Client for Recruiter"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#6B3BF6]" />
                        <span>Adjust Client</span>
                      </button>
                    </td>
                  </tr>
                ))
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
        />
      </div>

      {/* 5. ADD NEW RECRUITER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-sm border border-purple-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Onboard New Recruiter</h3>
                  <p className="text-xs text-slate-500">Assign team lead, primary client partner, and SLA TAT target</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateRecruiter} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newRecruiterName}
                  onChange={e => setNewRecruiterName(e.target.value)}
                  placeholder="e.g. Ananya Rao"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newRecruiterEmail}
                  onChange={e => setNewRecruiterEmail(e.target.value)}
                  placeholder="e.g. a.rao@talentflow.io"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Role Designation</label>
                  <select
                    value={newRecruiterRole}
                    onChange={e => setNewRecruiterRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-[#6B3BF6]"
                  >
                    <option value="Technical Recruiter">Technical Recruiter</option>
                    <option value="Senior IT Recruiter">Senior IT Recruiter</option>
                    <option value="Lead Recruiter">Lead Recruiter</option>
                    <option value="Sourcing Specialist">Sourcing Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Team Lead</label>
                  <select
                    value={newAssignedLead}
                    onChange={e => setNewAssignedLead(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6]"
                  >
                    <option value="Harish Gadipally">Harish Gadipally (Accenture Lead)</option>
                    <option value="Tom Walsh">Tom Walsh (Goldman Sachs Lead)</option>
                    <option value="Nina Brooks">Nina Brooks (Tesla Lead)</option>
                    <option value="Ray Diaz">Ray Diaz (ITC Infotech Lead)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Primary Client Account</label>
                  <select
                    value={newAssignedClient}
                    onChange={e => setNewAssignedClient(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6]"
                  >
                    <option value="Accenture">Accenture</option>
                    <option value="Goldman Sachs">Goldman Sachs</option>
                    <option value="Tesla">Tesla</option>
                    <option value="ITC Limited">ITC Limited</option>
                    <option value="LTTS Mobility">LTTS Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target SLA TAT (Days)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newTatTarget}
                    onChange={e => setNewTatTarget(e.target.value)}
                    placeholder="2.0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Save & Onboard Recruiter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADJUST CLIENT ACCOUNT MODAL */}
      {adjustClientRecruiter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6B3BF6]" />
                <h3 className="font-extrabold text-slate-900 text-base">Adjust Client Account Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustClientRecruiter(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200">
                <p className="text-xs font-extrabold text-slate-900">{adjustClientRecruiter.name}</p>
                <p className="text-[11px] text-[#6B3BF6] font-bold mt-0.5">{adjustClientRecruiter.role} • Team Lead: {adjustClientRecruiter.teamLead}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold text-xs mb-1.5">
                  Assigned Client Account *
                </label>
                <select
                  value={selectedClientForAdjust}
                  onChange={e => setSelectedClientForAdjust(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                >
                  <option value="Accenture">Accenture</option>
                  <option value="Deloitte">Deloitte</option>
                  <option value="MetaForge">MetaForge IT Solutions</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="TCS">Tata Consultancy Services (TCS)</option>
                  <option value="Infosys">Infosys</option>
                  <option value="Wipro">Wipro</option>
                  <option value="All Clients">All Clients (Executive Oversight)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Reassigning this client updates requirement allocations, candidate submission targets, and performance SLAs for this recruiter.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustClientRecruiter(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecruitersList(prev =>
                    prev.map(r =>
                      r.id === adjustClientRecruiter.id
                        ? { ...r, clientNames: [selectedClientForAdjust] }
                        : r
                    )
                  )
                  showToast(`Adjusted assigned client for ${adjustClientRecruiter.name} to "${selectedClientForAdjust}"!`)
                  setAdjustClientRecruiter(null)
                }}
                className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Save Client Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
