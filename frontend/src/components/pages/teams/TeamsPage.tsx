import React, { useState, useMemo, useEffect } from 'react'
import { Users, Search } from 'lucide-react'
import { Role } from '../../../types'
import { TeamLeadGroup } from './types'
import { teamsService } from '../../../services/workspace.service'
import { TeamsKpiCards } from './TeamsKpiCards'
import { TeamsHierarchyList } from './TeamsHierarchyList'

interface TeamsPageProps {
  role?: Role
}

export function TeamsPage({ role = 'superadmin' }: TeamsPageProps) {
  const [teamsData, setTeamsData] = useState<TeamLeadGroup[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [clientFilter, setClientFilter] = useState('All Clients')

  useEffect(() => {
    let cancelled = false
    teamsService
      .list()
      .then((rows: any) => {
        const list = Array.isArray(rows) ? rows : rows?.items || []
        if (cancelled) return
        setTeamsData(
          list.map((t: any): TeamLeadGroup => ({
            id: t.teamId || t.id,
            leadName: t.leadName || t.leadId?.name || '',
            leadRole: 'Team Lead',
            leadEmail: t.leadEmail || t.leadId?.email || '',
            leadAvatar: String(t.leadName || t.leadId?.name || 'L').charAt(0),
            primaryClient: t.primaryClient || '',
            teamName: t.teamName || '',
            leadRequirementsCount: t.leadRequirementsCount || 0,
            leadSubmissionsCount: t.leadSubmissionsCount || 0,
            membersCount: t.membersCount || (t.members || []).length,
            members: (t.members || t.recruiterIds || []).map((m: any) => ({
              id: m.id || String(m._id || m),
              name: m.name || '',
              role: m.role || 'Recruiter',
              email: m.email || '',
              avatar: String(m.name || 'R').charAt(0),
              requirementsCount: m.requirementsCount || 0,
              submissionsCount: m.submissionsCount || 0,
              primaryClient: m.primaryClient || '',
            })),
          })),
        )
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  // Unique clients list
  const uniqueClients = useMemo(() => {
    const clients = new Set<string>()
    teamsData.forEach(t => clients.add(t.primaryClient))
    return Array.from(clients)
  }, [teamsData])

  // Total summary metrics
  const totalLeadsCount = teamsData.length
  const totalMembersCount = useMemo(() => {
    return teamsData.reduce((acc, t) => acc + t.membersCount, 0)
  }, [teamsData])

  const totalTeamSubmissions = useMemo(() => {
    return teamsData.reduce((acc, t) => {
      const memberSubs = t.members.reduce((mAcc, m) => mAcc + m.submissionsCount, 0)
      return acc + t.leadSubmissionsCount + memberSubs
    }, 0)
  }, [teamsData])

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teamsData.filter(team => {
      if (clientFilter !== 'All Clients' && team.primaryClient !== clientFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchLead = team.leadName.toLowerCase().includes(q)
        const matchTeam = team.teamName.toLowerCase().includes(q)
        const matchClient = team.primaryClient.toLowerCase().includes(q)
        const matchMember = team.members.some(m => m.name.toLowerCase().includes(q))
        if (!matchLead && !matchTeam && !matchClient && !matchMember) return false
      }

      return true
    })
  }, [teamsData, clientFilter, searchQuery])

  return (
    <div className="space-y-6 w-full pb-20 font-sans text-slate-800 animate-in fade-in duration-200">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hiring Teams & Team Leads</h1>
            <span className="px-3 py-1 bg-purple-50 text-[#6B3BF6] text-xs font-extrabold rounded-full border border-purple-200 flex items-center gap-1.5 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#6B3BF6]" />
              <span>Team Lead & Member Hierarchy</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Overview of Team Leads, assigned client accounts, member recruiter counts, and individual recruiter names
          </p>
        </div>
      </div>
      <TeamsKpiCards
        totalLeadsCount={totalLeadsCount}
        totalMembersCount={totalMembersCount}
        totalTeamSubmissions={totalTeamSubmissions}
      />
      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Team Lead name, member recruiter, or client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
          >
            <option value="All Clients">All Client Teams</option>
            {uniqueClients.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <TeamsHierarchyList filteredTeams={filteredTeams} />
    </div>
  )
}
