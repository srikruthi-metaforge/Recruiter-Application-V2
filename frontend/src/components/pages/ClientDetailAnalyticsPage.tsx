import React from 'react'
import { ClientDeliveryGapAnalysisPage } from './ClientDeliveryGapAnalysisPage'

export interface ClientPerformanceData {
  id: string
  clientName: string
  reqSent: number
  reqAssigned: number
  submissions: number
  subRatio: number
  openReqs: number
  closedReqs: number
  activeRecruiters: number
  requirementsList: {
    id: string
    title: string
    assignedRecruiter: string
    submissions: number
    status: 'Open' | 'Closed' | 'In Progress'
    createdDate: string
  }[]
}

interface ClientDetailAnalyticsPageProps {
  client: ClientPerformanceData
  onBack: () => void
}

export function ClientDetailAnalyticsPage({
  client,
  onBack,
}: ClientDetailAnalyticsPageProps) {
  return (
    <ClientDeliveryGapAnalysisPage
      clientName={client.clientName}
      onBack={onBack}
    />
  )
}
