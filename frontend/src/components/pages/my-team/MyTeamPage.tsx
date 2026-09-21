import React, { useState } from 'react'
import {
  RecruiterDetailAnalyticsPage,
  RecruiterDetailData,
} from '../RecruiterDetailAnalyticsPage'
import { TeamMemberData } from './types'
import { MY_TEAM_LEAD_POD_MEMBERS } from './members.data'
import { MyTeamHeader } from './MyTeamHeader'
import { MyTeamKpis } from './MyTeamKpis'
import { ClientWorkload } from './ClientWorkload'
import { MyTeamTable } from './MyTeamTable'
import { AdjustClientModal } from './AdjustClientModal'

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
      <MyTeamHeader />
      <MyTeamKpis teamMembersCount={teamMembers.length} />
      <ClientWorkload />
      <MyTeamTable
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredMembers={filteredMembers}
        setAdjustClientMember={setAdjustClientMember}
        setSelectedClientForMember={setSelectedClientForMember}
        setSelectedRecruiterForDetail={setSelectedRecruiterForDetail}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
      />
      <AdjustClientModal
        adjustClientMember={adjustClientMember}
        setAdjustClientMember={setAdjustClientMember}
        selectedClientForMember={selectedClientForMember}
        setSelectedClientForMember={setSelectedClientForMember}
        setTeamMembers={setTeamMembers}
        showToast={showToast}
      />
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
