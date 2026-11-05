import React from 'react'
import { SubmitToLeadVm } from './useSubmitToLeadPage'
import { BackButton } from '../../ui/BackButton'

export function SubmitToLeadHeader({ vm }: { vm: SubmitToLeadVm }) {
  const { onBack, requirement } = vm
  const titleText = requirement?.title || '—'
  const clientEmailText = requirement?.clientEmail || requirement?.client || '—'

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
      <BackButton label="Back to Requirement" onClick={onBack} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submission to Client</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit candidates for <strong className="text-slate-800">{titleText}</strong> at{' '}
          <strong className="text-slate-800">{clientEmailText}</strong>
        </p>
      </div>
    </div>
  )
}
