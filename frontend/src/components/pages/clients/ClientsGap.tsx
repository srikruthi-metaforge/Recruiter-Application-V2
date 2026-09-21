import React from 'react'
import { ClientDeliveryGapAnalysisPage } from '../ClientDeliveryGapAnalysisPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientsVm } from './useClientsPage'

export function ClientsGap({ vm }: { vm: ClientsVm }) {
  const {
    role,
    selectedClientForGapAnalysis,
    setSelectedClientForGapAnalysis,
    periodFilter,
  } = vm
  return (
    <>
    return (
      <ClientDeliveryGapAnalysisPage
        clientName={selectedClientForGapAnalysis.name}
        clientDomain={selectedClientForGapAnalysis.domain}
        pocName={selectedClientForGapAnalysis.pocName}
        pocEmail={selectedClientForGapAnalysis.pocEmail}
        pocPhone={selectedClientForGapAnalysis.pocPhone}
        teamLead={selectedClientForGapAnalysis.teamLead}
        role={role}
        initialDateRange={periodFilter}
        onBack={() => setSelectedClientForGapAnalysis(null)}
      />
    )
    </>
  )
}
