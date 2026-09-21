import React, { useState } from 'react'
import { Role } from '../../../types'
import { RecruiterOverviewItem } from './types'
import { INITIAL_RECRUITERS_DATA } from './recruiters.data'
import { RecruitersHeader } from './RecruitersHeader'
import { RecruitersKpis } from './RecruitersKpis'
import { RecruitersFilters } from './RecruitersFilters'
import { RecruitersTable } from './RecruitersTable'
import { AddRecruiterModal } from './AddRecruiterModal'
import { AdjustClientModal } from './AdjustClientModal'
import { useRecruitersDerived } from './useRecruitersDerived'

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

  const {
    uniqueClients,
    uniqueTeamLeads,
    avgTatDays,
    totalReqsHandled,
    totalSubmissionsSourced,
    filteredRecruiters,
    paginatedRecruiters,
    totalPages,
  } = useRecruitersDerived(
    recruitersList,
    clientFilter,
    teamLeadFilter,
    searchQuery,
    sortBy,
    currentPage,
    pageSize,
  )

  return (
    <div className="space-y-6 w-full pb-20 font-sans text-slate-800 animate-in fade-in duration-200">
      <RecruitersHeader role={role} showToast={showToast} setIsAddModalOpen={setIsAddModalOpen} />
      <RecruitersKpis
        recruitersCount={recruitersList.length}
        avgTat={avgTatDays}
        totalReqs={totalReqsHandled}
        totalSubs={totalSubmissionsSourced}
      />
      <RecruitersFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        teamLeadFilter={teamLeadFilter}
        setTeamLeadFilter={setTeamLeadFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        uniqueClients={uniqueClients}
        uniqueLeads={uniqueTeamLeads}
        setCurrentPage={setCurrentPage}
      />
      <RecruitersTable
        paginatedRecruiters={paginatedRecruiters}
        filteredRecruiters={filteredRecruiters}
        role={role}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        onAdjustClient={(r) => {
          setAdjustClientRecruiter(r)
          setSelectedClientForAdjust(r.clientNames[0] || 'Accenture')
        }}
      />
      <AddRecruiterModal
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        handleCreateRecruiter={handleCreateRecruiter}
        newRecruiterName={newRecruiterName}
        setNewRecruiterName={setNewRecruiterName}
        newRecruiterEmail={newRecruiterEmail}
        setNewRecruiterEmail={setNewRecruiterEmail}
        newRecruiterRole={newRecruiterRole}
        setNewRecruiterRole={setNewRecruiterRole}
        newAssignedLead={newAssignedLead}
        setNewAssignedLead={setNewAssignedLead}
        newAssignedClient={newAssignedClient}
        setNewAssignedClient={setNewAssignedClient}
        newTatTarget={newTatTarget}
        setNewTatTarget={setNewTatTarget}
      />
      <AdjustClientModal
        adjustClientRecruiter={adjustClientRecruiter}
        setAdjustClientRecruiter={setAdjustClientRecruiter}
        targetClients={selectedClientForAdjust}
        setTargetClients={setSelectedClientForAdjust}
        onSave={() => {
          if (!adjustClientRecruiter) return
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
      />
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
