import React from 'react'
import { CandidateRepositoryPage } from '../../pages/CandidateRepositoryPage'
import { RecruiterDashboardVm } from './useRecruiterDashboard'

export function RecruiterDashRepo({ vm }: { vm: RecruiterDashboardVm }) {
  const {
    requirements,
    inlineReqId,
    setInlineReqId,
    showToast,
  } = vm
  return (
    <div className="w-full pb-12 font-sans animate-in fade-in duration-200">
      <CandidateRepositoryPage
        selectedReqId={inlineReqId}
        role="recruiter"
        requirements={requirements}
        onBackToDashboard={() => {
          setInlineReqId(null)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onOpenAddForm={() => {
          showToast('Use candidate upload form to add new candidate profiles.')
        }}
      />
    </div>
  )
}
