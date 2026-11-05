import React from 'react'
import { SubmitToLeadPageProps } from './preamble'
import { useSubmitToLeadPage } from './useSubmitToLeadPage'
import { SubmitToLeadHeader } from './SubmitToLeadHeader'
import { SubmitToLeadDestination } from './SubmitToLeadDestination'
import { SubmitToLeadReview } from './SubmitToLeadReview'
import { SubmitToLeadCandidates } from './SubmitToLeadCandidates'
import { SubmitToLeadTracker } from './SubmitToLeadTracker'
import { SubmitToLeadFooter } from './SubmitToLeadFooter'
import { ClientSubmitApprovalPanel } from './ClientSubmitApprovalPanel'

export function SubmitToLeadPage(props: SubmitToLeadPageProps) {
  const vm = useSubmitToLeadPage(props)
  return (
    <div className="space-y-6 w-full pb-32 font-sans text-slate-800 animate-in fade-in duration-200">
      <SubmitToLeadHeader vm={vm} />
      <ClientSubmitApprovalPanel role={vm.role || vm.activeRole} onToast={vm.showToast} />
      <SubmitToLeadDestination vm={vm} />
      <SubmitToLeadReview vm={vm} />
      <SubmitToLeadCandidates vm={vm} />
      <SubmitToLeadTracker vm={vm} />
      <SubmitToLeadFooter vm={vm} />
    </div>
  )
}
