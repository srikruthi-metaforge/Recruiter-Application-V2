import React from 'react'
import { RequirementsPageProps } from './preamble'
import { useRequirementsPage } from './useRequirementsPage'
import { RequirementsCreate } from './RequirementsCreate'
import { RequirementsEdit } from './RequirementsEdit'
import { RequirementsDetail } from './RequirementsDetail'
import { RequirementsCards } from './RequirementsCards'
import { RequirementsSearch } from './RequirementsSearch'
import { RequirementsTable } from './RequirementsTable'
import { RequirementsModals } from './RequirementsModals'
import { RequirementsSelectedCandidates } from './RequirementsSelectedCandidates'
import { ClientSubmitApprovalPanel } from '../submit-to-lead/ClientSubmitApprovalPanel'
import { BackButton } from '../../ui/BackButton'
import { navigateBackToReportsAnalytics } from '../../../utils/notificationNavigation'
import { useReturnToReports } from '../../../utils/useReturnToReports'

export function RequirementsPage(props: RequirementsPageProps) {
  const vm = useRequirementsPage(props)
  const showBackToReports = useReturnToReports()
  if (vm.isCreatingDemand) return <RequirementsCreate vm={vm} />
  if (vm.isEditingDemand && vm.editingReq) return <RequirementsEdit vm={vm} />
  if (vm.selectedReqForDetail) return <RequirementsDetail vm={vm} />
  const showSelectedCandidates =
    vm.activeCardFilter === 'SELECTIONS' &&
    (vm.role === 'superadmin' || vm.role === 'admin' || vm.role === 'devteam')
  return (
    <div className="space-y-5 w-full pb-10">
      {showBackToReports && (
        <BackButton
          label="Back to Reports & Analytics"
          onClick={navigateBackToReportsAnalytics}
        />
      )}
      <RequirementsCards vm={vm} />
      {/* Lead / Admin / Super Admin: recruiter client-submit approval requests */}
      <ClientSubmitApprovalPanel role={vm.role} onToast={vm.showToast} />
      <RequirementsSearch vm={vm} />
      {showSelectedCandidates ? (
        <RequirementsSelectedCandidates vm={vm} />
      ) : (
        <RequirementsTable vm={vm} />
      )}
      <RequirementsModals vm={vm} />
    </div>
  )
}
