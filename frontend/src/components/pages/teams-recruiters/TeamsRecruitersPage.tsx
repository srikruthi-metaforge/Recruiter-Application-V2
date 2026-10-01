import React, { useState, useMemo } from 'react'
import { Role } from '../../../types'
import { UnifiedTeamMember } from './types'
import { INITIAL_MEMBERS_DATA } from './members.data'
import { TeamsRecruitersHeader } from './TeamsRecruitersHeader'
import { TeamsRecruitersFilters } from './TeamsRecruitersFilters'
import { TeamsRecruitersList } from './TeamsRecruitersList'
import { AddMemberModal } from './AddMemberModal'
import { MemberDetailModal } from './MemberDetailModal'
import { CheckCircle2 } from 'lucide-react'

interface TeamsRecruitersPageProps {
  role?: Role
}

export function TeamsRecruitersPage({ role = 'superadmin' }: TeamsRecruitersPageProps) {
  const [membersList, setMembersList] = useState<UnifiedTeamMember[]>(INITIAL_MEMBERS_DATA)

  // Filter & Toggle State
  const [roleToggle, setRoleToggle] = useState<'all' | 'leads' | 'recruiters'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [teamLeadFilter, setTeamLeadFilter] = useState('All Team Leads')
  const [performanceFilter, setPerformanceFilter] = useState('All Performance')

  // Modals & Toast State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<UnifiedTeamMember | null>(null)

  // Add Member Form State
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('Technical Recruiter')
  const [newIsTeamLead, setNewIsTeamLead] = useState(false)
  const [newAssignedLead, setNewAssignedLead] = useState('Harish Gadipally')
  const [newAssignedClient, setNewAssignedClient] = useState('Accenture')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Unique Team Leads list for dropdown filter
  const uniqueTeamLeads = useMemo(() => {
    const leadsSet = new Set<string>()
    membersList.forEach(m => {
      if (m.isTeamLead) leadsSet.add(m.name)
      else if (m.teamLead && m.teamLead !== 'Unassigned') {
        const cleanLead = m.teamLead.replace(/\s*\(Self\)$/, '')
        leadsSet.add(cleanLead)
      }
    })
    return Array.from(leadsSet)
  }, [membersList])

  // Filtered Members List
  const filteredMembers = useMemo(() => {
    return membersList.filter(m => {
      // Role Toggle Filter
      if (roleToggle === 'leads' && !m.isTeamLead) return false
      if (roleToggle === 'recruiters' && m.isTeamLead) return false

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = m.name.toLowerCase().includes(q)
        const matchEmail = m.email.toLowerCase().includes(q)
        const matchRole = m.role.toLowerCase().includes(q)
        const matchLead = m.teamLead.toLowerCase().includes(q)
        const matchClient = m.clientNames.some(c => c.toLowerCase().includes(q))
        if (!matchName && !matchEmail && !matchRole && !matchLead && !matchClient) return false
      }

      // Team Lead Filter
      if (teamLeadFilter !== 'All Team Leads') {
        const cleanLeadFilter = teamLeadFilter.toLowerCase()
        const cleanMemberLead = m.teamLead.toLowerCase().replace(/\s*\(self\)$/, '')
        if (cleanMemberLead !== cleanLeadFilter && m.name.toLowerCase() !== cleanLeadFilter) {
          return false
        }
      }

      // Performance Filter
      if (performanceFilter !== 'All Performance' && m.performanceStatus !== performanceFilter) {
        return false
      }

      return true
    })
  }, [membersList, roleToggle, searchQuery, teamLeadFilter, performanceFilter])

  // Pagination State (5 items per page default)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMembers.slice(start, start + pageSize)
  }, [filteredMembers, currentPage, pageSize])

  // Form Submit Handler
  const handleCreateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim() || !newMemberEmail.trim()) return

    const newRecord: UnifiedTeamMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      avatar: newMemberName.trim().charAt(0).toUpperCase(),
      role: newMemberRole,
      isTeamLead: newIsTeamLead,
      teamLead: newIsTeamLead ? `${newMemberName.trim()} (Self)` : newAssignedLead,
      clientNames: [newAssignedClient],
      totalRequirements: 0,
      totalSubmissions: 0,
      tatDays: 2.0,
      totalInterviews: 0,
      performanceStatus: 'On Track',
    }

    setMembersList([newRecord, ...membersList])
    setIsAddModalOpen(false)
    showToast(`Successfully added new ${newIsTeamLead ? 'Team Lead' : 'Recruiter'}: ${newMemberName}`)

    // Reset Form
    setNewMemberName('')
    setNewMemberEmail('')
    setNewIsTeamLead(false)
  }

  return (
    <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
      <TeamsRecruitersHeader count={filteredMembers.length} setIsAddModalOpen={setIsAddModalOpen} />
      <TeamsRecruitersFilters
        roleToggle={roleToggle}
        setRoleToggle={setRoleToggle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        teamLeadFilter={teamLeadFilter}
        setTeamLeadFilter={setTeamLeadFilter}
        performanceFilter={performanceFilter}
        setPerformanceFilter={setPerformanceFilter}
        uniqueTeamLeads={uniqueTeamLeads}
        setCurrentPage={setCurrentPage}
        membersList={membersList}
      />
      <TeamsRecruitersList
        paginatedMembers={paginatedMembers}
        filteredMembers={filteredMembers}
        role={role}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setCurrentPage={setCurrentPage}
        setSelectedMemberDetail={setSelectedMemberDetail}
      />
      <AddMemberModal
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        handleCreateMember={handleCreateMemberSubmit}
        newMemberName={newMemberName}
        setNewMemberName={setNewMemberName}
        newMemberEmail={newMemberEmail}
        setNewMemberEmail={setNewMemberEmail}
        newMemberRole={newMemberRole}
        setNewMemberRole={setNewMemberRole}
        newIsTeamLead={newIsTeamLead}
        setNewIsTeamLead={setNewIsTeamLead}
        newAssignedLead={newAssignedLead}
        setNewAssignedLead={setNewAssignedLead}
        newAssignedClient={newAssignedClient}
        setNewAssignedClient={setNewAssignedClient}
        uniqueTeamLeads={uniqueTeamLeads}
      />
      <MemberDetailModal
        selectedMemberDetail={selectedMemberDetail}
        setSelectedMemberDetail={setSelectedMemberDetail}
        role={role}
      />
    </div>
  )
}
