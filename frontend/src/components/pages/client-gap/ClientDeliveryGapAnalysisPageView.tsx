import React from 'react'
import { ClientGapAnalysisProps } from './preamble'
import { useClientDeliveryGap } from './useClientDeliveryGap'
import { ClientGapHeader } from './ClientGapHeader'
import { ClientGapFilters } from './ClientGapFilters'
import { ClientGapNav } from './ClientGapNav'
import { ClientGapKpis } from './ClientGapKpis'
import { ClientGapDomains } from './ClientGapDomains'
import { ClientGapCharts } from './ClientGapCharts'
import { ClientGapSpoc } from './ClientGapSpoc'
import { ClientGapReqs } from './ClientGapReqs'

export function ClientDeliveryGapAnalysisPage(props: ClientGapAnalysisProps) {
  const vm = useClientDeliveryGap(props)
  return (
    <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-150">
      <ClientGapHeader vm={vm} />
      <ClientGapFilters vm={vm} />
      <ClientGapNav vm={vm} />
      <ClientGapKpis vm={vm} />
      <ClientGapDomains vm={vm} />
      <ClientGapCharts vm={vm} />
      <ClientGapSpoc vm={vm} />
      <ClientGapReqs vm={vm} />
    </div>
  )
}
