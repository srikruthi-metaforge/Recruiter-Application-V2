import React from 'react'
import { ClientsPageProps } from './preamble'
import { useClientsPage } from './useClientsPage'
import { ClientsGap } from './ClientsGap'
import { ClientsAgreementA } from './ClientsAgreementA'
import { ClientsAgreementB } from './ClientsAgreementB'
import { ClientsAddA } from './ClientsAddA'
import { ClientsAddB } from './ClientsAddB'
import { ClientsListHeader } from './ClientsListHeader'
import { ClientsTable } from './ClientsTable'
import { ClientsModals } from './ClientsModals'

export function ClientsPage(props: ClientsPageProps) {
  const vm = useClientsPage(props)
  if (vm.selectedClientForGapAnalysis) return <ClientsGap vm={vm} />
  if (vm.viewMode === 'view_agreement' && vm.selectedClientForAgreement) {
    return <ClientsAgreementA vm={vm} />
  }
  if (vm.viewMode === 'add') {
    return <ClientsAddA vm={vm} />
  }
  return (
    <div className="space-y-6 w-full pb-16 font-sans text-slate-800">
      <ClientsListHeader vm={vm} />
      <ClientsTable vm={vm} />
      <ClientsModals vm={vm} />
    </div>
  )
}
