import React from 'react'
import { Props } from './preamble'
import { useRecruiterDashboard } from './useRecruiterDashboard'
import { RecruiterDashDetail } from './RecruiterDashDetail'
import { RecruiterDashSubmissions } from './RecruiterDashSubmissions'
import { RecruiterDashInterviews } from './RecruiterDashInterviews'
import { RecruiterDashRepo } from './RecruiterDashRepo'
import { RecruiterDashKpis } from './RecruiterDashKpis'
import { RecruiterDashReqs } from './RecruiterDashReqs'
import { RecruiterDashRecent } from './RecruiterDashRecent'

export function RecruiterDashboard(props: Props) {
  const vm = useRecruiterDashboard(props)
  if (vm.selectedReqForDetail) return <RecruiterDashDetail vm={vm} />
  if (vm.inlineView === 'submissions') return <RecruiterDashSubmissions vm={vm} />
  if (vm.inlineView === 'interviews') return <RecruiterDashInterviews vm={vm} />
  if (vm.inlineReqId) return <RecruiterDashRepo vm={vm} />
  return (
    <div className="space-y-8 w-full pb-12 font-sans">
      <RecruiterDashKpis vm={vm} />
      <RecruiterDashReqs vm={vm} />
      <RecruiterDashRecent vm={vm} />
    </div>
  )
}
