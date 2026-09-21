import React, { useState } from 'react'
import { CLIENT_TEAM_PERFORMANCE_LIST, ClientTeamPerformanceData } from './ClientWiseTeamPerformanceChart.data'
import { Role } from '../../types'
import { ClientWiseTeamHeader, ClientWiseTeamKpis } from './ClientWiseTeamPerformanceChart.header'
import { ClientWiseTeamBarChart } from './ClientWiseTeamPerformanceChart.chart'

export type { ClientTeamPerformanceData }

export function ClientWiseTeamPerformanceChart({ role = 'superadmin' }: { role?: Role }) {
  const [selectedClient, setSelectedClient] = useState<string>('All Clients')

  const filteredData =
    selectedClient === 'All Clients'
      ? CLIENT_TEAM_PERFORMANCE_LIST
      : CLIENT_TEAM_PERFORMANCE_LIST.filter(c => c.clientName === selectedClient)

  const totalReqs = filteredData.reduce((acc, c) => acc + c.totalRequirements, 0)
  const totalEngSubs = filteredData.reduce((acc, c) => acc + c.engineeringPodSubs, 0)
  const totalEntSubs = filteredData.reduce((acc, c) => acc + c.enterprisePodSubs, 0)
  const totalCloudSubs = filteredData.reduce((acc, c) => acc + c.cloudErpPodSubs, 0)
  const totalSubs = totalEngSubs + totalEntSubs + totalCloudSubs
  const totalInterviews = filteredData.reduce((acc, c) => acc + c.interviewsScheduled, 0)
  const totalHires = filteredData.reduce((acc, c) => acc + c.hiresCount, 0)

  const [leadChartView, setLeadChartView] = useState<'individual' | 'team'>('individual')

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 font-sans">
      <ClientWiseTeamHeader
        role={role}
        leadChartView={leadChartView}
        setLeadChartView={setLeadChartView}
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
      />
      <ClientWiseTeamKpis
        totalReqs={totalReqs}
        totalSubs={totalSubs}
        totalInterviews={totalInterviews}
        totalHires={totalHires}
      />
      <ClientWiseTeamBarChart filteredData={filteredData} />
    </div>
  )
}
