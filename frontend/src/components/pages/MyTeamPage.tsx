import React, { useState } from 'react'
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  Crown,
  Plus,
  Mail,
  Sliders,
  ChevronRight,
  Sparkles,
  ArrowRight,
  PieChart,
  X,
  Save,
} from 'lucide-react'
import {
  RecruiterDetailAnalyticsPage,
  RecruiterDetailData,
} from './RecruiterDetailAnalyticsPage'

export interface TeamMemberData {
  id: string
  name: string
  role: string
  isLead?: boolean
  email: string
  avatar: string
  assignedClients: {
    clientName: string
    activeReqCount: number
    submissionsCount: number
    status: 'High Priority' | 'Active' | 'On Track'
  }[]
  totalActiveReqs: number
  totalSubmissions: number
  interviewsCount: number
  hiresCount: number
  avgTatDays: number
  status: 'Active' | 'On Leave'
}

const MY_TEAM_LEAD_POD_MEMBERS: TeamMemberData[] = [
  {
    id: 'rec-1',
    name: 'Harish Gadipally',
    role: 'Team Lead',
    isLead: true,
    email: 'h.gadipally@talentflow.io',
    avatar: 'H',
    assignedClients: [
      { clientName: 'Accenture', activeReqCount: 4, submissionsCount: 42, status: 'High Priority' },
      { clientName: 'Goldman Sachs', activeReqCount: 3, submissionsCount: 28, status: 'Active' },
      { clientName: 'LTTS Automotive', activeReqCount: 2, submissionsCount: 18, status: 'On Track' },
      { clientName: 'JPMorgan Chase', activeReqCount: 2, submissionsCount: 16, status: 'Active' },
      { clientName: 'Infosys', activeReqCount: 1, submissionsCount: 14, status: 'On Track' },
    ],
    totalActiveReqs: 12,
    totalSubmissions: 118,
    interviewsCount: 28,
    hiresCount: 9,
    avgTatDays: 1.8,
    status: 'Active',
  },
  {
    id: 'rec-2',
    name: 'Marcus Chen',
    role: 'Senior Technical Recruiter',
    isLead: false,
    email: 'm.chen@talentflow.io',
    avatar: 'M',
    assignedClients: [
      { clientName: 'Accenture', activeReqCount: 3, submissionsCount: 28, status: 'High Priority' },
      { clientName: 'Goldman Sachs', activeReqCount: 2, submissionsCount: 18, status: 'Active' },
      { clientName: 'LTTS Automotive', activeReqCount: 2, submissionsCount: 16, status: 'On Track' },
    ],
    totalActiveReqs: 7,
    totalSubmissions: 62,
    interviewsCount: 16,
    hiresCount: 5,
    avgTatDays: 1.9,
    status: 'Active',
  },
  {
    id: 'rec-3',
    name: 'Priya Sharma',
    role: 'IT Recruiter',
    isLead: false,
    email: 'p.sharma@talentflow.io',
    avatar: 'P',
    assignedClients: [
      { clientName: 'Accenture', activeReqCount: 2, submissionsCount: 22, status: 'High Priority' },
      { clientName: 'Infosys', activeReqCount: 2, submissionsCount: 14, status: 'Active' },
      { clientName: 'JPMorgan Chase', activeReqCount: 1, submissionsCount: 10, status: 'On Track' },
    ],
    totalActiveReqs: 5,
    totalSubmissions: 46,
    interviewsCount: 12,
    hiresCount: 4,
    avgTatDays: 2.1,
    status: 'Active',
  },
  {
    id: 'rec-4',
    name: 'Suresh Kulkarni',
    role: 'ERP Technical Recruiter',
    isLead: false,
    email: 's.kulkarni@talentflow.io',
    avatar: 'S',
    assignedClients: [
      { clientName: 'LTTS Automotive', activeReqCount: 2, submissionsCount: 14, status: 'High Priority' },
      { clientName: 'Infosys', activeReqCount: 2, submissionsCount: 12, status: 'Active' },
      { clientName: 'Wipro', activeReqCount: 1, submissionsCount: 8, status: 'On Track' },
    ],
    totalActiveReqs: 5,
    totalSubmissions: 34,
    interviewsCount: 9,
    hiresCount: 3,
    avgTatDays: 2.3,
    status: 'Active',
  },
  {
    id: 'rec-5',
    name: 'Adirala Sathvika',
    role: 'Junior Recruiter',
    isLead: false,
    email: 'a.sathvika@talentflow.io',
    avatar: 'A',
    assignedClients: [
      { clientName: 'Accenture', activeReqCount: 2, submissionsCount: 14, status: 'Active' },
      { clientName: 'Goldman Sachs', activeReqCount: 1, submissionsCount: 10, status: 'On Track' },
    ],
    totalActiveReqs: 3,
    totalSubmissions: 24,
    interviewsCount: 6,
    hiresCount: 2,
    avgTatDays: 2.4,
    status: 'Active',
  },
  {
    id: 'rec-6',
    name: 'Arvind GR',
    role: 'Sourcing Specialist',
    isLead: false,
    email: 'a.gr@talentflow.io',
    avatar: 'A',
    assignedClients: [
      { clientName: 'LTTS Automotive', activeReqCount: 2, submissionsCount: 12, status: 'Active' },
      { clientName: 'HCL Technologies', activeReqCount: 1, submissionsCount: 10, status: 'On Track' },
    ],
    totalActiveReqs: 3,
    totalSubmissions: 22,
    interviewsCount: 5,
    hiresCount: 2,
    avgTatDays: 2.5,
    status: 'Active',
  },
]

export function MyTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>(MY_TEAM_LEAD_POD_MEMBERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [clientFilter, setClientFilter] = useState('All Clients')
  const [selectedRecruiterForDetail, setSelectedRecruiterForDetail] = useState<RecruiterDetailData | null>(null)
  const [adjustClientMember, setAdjustClientMember] = useState<TeamMemberData | null>(null)
  const [selectedClientForMember, setSelectedClientForMember] = useState<string>('Accenture')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Filtered members list
  const filteredMembers = teamMembers.filter(member => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesName = member.name.toLowerCase().includes(q)
      const matchesEmail = member.email.toLowerCase().includes(q)
      const matchesClient = member.assignedClients.some(c => c.clientName.toLowerCase().includes(q))
      if (!matchesName && !matchesEmail && !matchesClient) return false
    }
    if (clientFilter !== 'All Clients') {
      const hasClient = member.assignedClients.some(c => c.clientName === clientFilter)
      if (!hasClient) return false
    }
    return true
  })

  // Drill down to recruiter detail analytics page
  if (selectedRecruiterForDetail) {
    return (
      <RecruiterDetailAnalyticsPage
        recruiter={selectedRecruiterForDetail}
        onBack={() => setSelectedRecruiterForDetail(null)}
      />
    )
  }

  return (
    <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-150">
      {/* 1. TOP HEADER & POD BADGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-[#6B3BF6]" />
              <span>My Team Overview</span>
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 inline-flex items-center gap-1.5 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Engineering Pod</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recruiter team member list, assigned client accounts, active requirement workloads, and sourcing throughput.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs font-extrabold text-[#6B3BF6]">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Team Lead: Harish Gadipally</span>
          </div>
        </div>
      </div>

      {/* 2. POD OVERVIEW KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Team Members</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">{teamMembers.length}</p>
          <span className="text-[10px] text-purple-700 font-semibold">6 Active Recruiters</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Assigned Clients</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">6 Accounts</p>
          <span className="text-[10px] text-blue-700 font-semibold">Accenture, Goldman, LTTS...</span>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Active Requirements</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">35 Job Demands</p>
          <span className="text-[10px] text-amber-700 font-semibold">In Sourcing Phase</span>
        </div>

        <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-[#5B51D8] uppercase tracking-wider block">Total Submissions</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">306 Submissions</p>
          <span className="text-[10px] text-[#5B51D8] font-bold">Pod Overall Total</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Interview Pipeline</span>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">75 Scheduled</p>
          <span className="text-[10px] text-emerald-700 font-bold">27 Final Placements</span>
        </div>
      </div>

      {/* 3. CLIENT WORKLOAD ALLOCATION OVERVIEW */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#6B3BF6]" />
            <h3 className="text-base font-bold text-slate-900">
              Client Account Workload Distribution Across Team
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Recruiter allocations per client account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              client: 'Accenture',
              recruiterCount: 4,
              recruiters: ['Marcus Chen', 'Priya Sharma', 'Adirala Sathvika', 'Harish Gadipally'],
              activeReqs: 11,
              subs: 126,
            },
            {
              client: 'Goldman Sachs',
              recruiterCount: 3,
              recruiters: ['Marcus Chen', 'Adirala Sathvika', 'Harish Gadipally'],
              activeReqs: 6,
              subs: 56,
            },
            {
              client: 'LTTS Automotive',
              recruiterCount: 4,
              recruiters: ['Marcus Chen', 'Suresh Kulkarni', 'Arvind GR', 'Harish Gadipally'],
              activeReqs: 8,
              subs: 60,
            },
            {
              client: 'Infosys',
              recruiterCount: 3,
              recruiters: ['Priya Sharma', 'Suresh Kulkarni', 'Harish Gadipally'],
              activeReqs: 5,
              subs: 40,
            },
          ].map(c => (
            <div key={c.client} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">{c.client}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#6B3BF6]">
                  {c.recruiterCount} Recruiters
                </span>
              </div>

              <div className="text-[11px] text-slate-600 font-medium">
                <strong className="text-slate-800">Assigned:</strong> {c.recruiters.join(', ')}
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                <span>Active Reqs: <strong className="text-blue-700">{c.activeReqs}</strong></span>
                <span>Submissions: <strong className="text-[#6B3BF6]">{c.subs}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. TEAM MEMBERS & ASSIGNED CLIENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6B3BF6]" />
              <span>Team Members & Client Account Assignments</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing detailed breakdown of names, assigned roles, working client accounts, and output metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recruiter name, client, or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6]"
              />
            </div>

            <select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Clients">All Clients</option>
              <option value="Accenture">Accenture</option>
              <option value="Goldman Sachs">Goldman Sachs</option>
              <option value="LTTS Automotive">LTTS Automotive</option>
              <option value="Infosys">Infosys</option>
              <option value="JPMorgan Chase">JPMorgan Chase</option>
              <option value="Wipro">Wipro</option>
              <option value="HCL Technologies">HCL Technologies</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">RECRUITER NAME & ROLE</th>
                <th className="py-3.5 px-4">WORKING CLIENT ACCOUNTS</th>
                <th className="py-3.5 px-4">ACTIVE REQS</th>
                <th className="py-3.5 px-4">TOTAL SUBMISSIONS</th>
                <th className="py-3.5 px-4">INTERVIEWS</th>
                <th className="py-3.5 px-4">AVG TAT</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredMembers.map((member, idx) => (
                <tr key={member.id} className="hover:bg-purple-50/40 transition-colors">
                  {/* Recruiter Name & Role */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200 shadow-2xs">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{member.name}</span>
                          {member.isLead && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-600" />
                              <span>Team Lead</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">{member.role}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Working Client Accounts */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {member.assignedClients.map(cli => (
                        <span
                          key={cli.clientName}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center gap-1 shadow-2xs"
                        >
                          <Building2 className="w-3 h-3 text-[#2563EB]" />
                          <span>{cli.clientName}</span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-100 text-blue-900 font-mono">
                            {cli.submissionsCount}
                          </span>
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Active Reqs */}
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {member.totalActiveReqs} Requirements
                    </span>
                  </td>

                  {/* Total Submissions */}
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-[#6B3BF6] underline hover:text-purple-900 tabular-nums cursor-pointer">
                      {member.totalSubmissions} Candidates
                    </span>
                  </td>

                  {/* Interviews */}
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-emerald-700 tabular-nums">
                      {member.interviewsCount} Scheduled
                    </span>
                  </td>

                  {/* Avg TAT */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-800 tabular-nums">
                    {member.avgTatDays} Days
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => {
                        setAdjustClientMember(member)
                        setSelectedClientForMember(member.assignedClients[0]?.clientName || 'Accenture')
                      }}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold rounded-xl border border-blue-200 shadow-2xs transition-all inline-flex items-center gap-1 cursor-pointer active:scale-98"
                      title="Adjust Assigned Client for Recruiter"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Adjust Client</span>
                    </button>

                    <button
                      onClick={() =>
                        setSelectedRecruiterForDetail({
                          id: member.id,
                          name: member.name,
                          role: member.role,
                          team: 'Engineering Pod',
                          avatar: member.name.charAt(0),
                          requirementsCount: 5,
                          workedReqs: 4,
                          nonWorkedReqs: 1,
                          submissionsCount: member.totalSubmissions,
                          shortlistedCount: 12,
                          noSubmissionsCount: 2,
                          interviewsCount: 6,
                          hiresCount: 2,
                          conversionRate: '25.0%',
                          dailyTaskStatus: 'Done (4/5)',
                          weeklyProgress: '20 / 25',
                          weeklyProgressPct: 80,
                          teamLead: 'Harish Gadipally',
                          primaryClient: 'Accenture',
                          status: 'On Track',
                          requirementsList: [
                            { id: 'REQ-101', title: 'Senior Full Stack Java Engineer', client: 'Accenture', submissions: 8, interviews: 2, status: 'Worked' },
                            { id: 'REQ-102', title: 'DevOps & AWS Cloud Architect', client: 'Goldman Sachs', submissions: 6, interviews: 1, status: 'Worked' },
                            { id: 'REQ-103', title: 'Embedded AUTOSAR C++ Engineer', client: 'LTTS Automotive', submissions: 5, interviews: 2, status: 'Worked' },
                          ],
                        })
                      }
                      className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] text-xs font-extrabold rounded-xl border border-purple-200 shadow-2xs transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#6B3BF6]" />
                      <span>View Analytics</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST CLIENT MODAL IN MY TEAM PAGE */}
      {adjustClientMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6B3BF6]" />
                <h3 className="font-extrabold text-slate-900 text-base">Adjust Client Account Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustClientMember(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200">
                <p className="text-xs font-extrabold text-slate-900">{adjustClientMember.name}</p>
                <p className="text-[11px] text-[#6B3BF6] font-bold mt-0.5">{adjustClientMember.role}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold text-xs mb-1.5">
                  Assigned Client Account *
                </label>
                <select
                  value={selectedClientForMember}
                  onChange={e => setSelectedClientForMember(e.target.value)}
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
                  Reassigning this client updates requirement allocations and candidate submission targets for this team member.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustClientMember(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeamMembers(prev =>
                    prev.map(m =>
                      m.id === adjustClientMember.id
                        ? {
                            ...m,
                            assignedClients: [
                              {
                                clientName: selectedClientForMember,
                                submissionsCount: m.totalSubmissions,
                                activeReqCount: m.totalActiveReqs,
                                status: 'Active' as const,
                              },
                            ],
                          }
                        : m
                    )
                  )
                  showToast(`Adjusted client assignment for ${adjustClientMember.name} to "${selectedClientForMember}"!`)
                  setAdjustClientMember(null)
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

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
