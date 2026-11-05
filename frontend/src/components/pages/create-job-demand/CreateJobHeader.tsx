import React from 'react'
import { CreateJobDemandVm } from './useCreateJobDemandForm'
import { BackButton } from '../../ui/BackButton'

export function CreateJobHeader({ vm }: { vm: CreateJobDemandVm }) {
  const {
    onCancel,
    isEdit,
  } = vm
  return (
    <>
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-3">
            <BackButton label="Back to Requirements" onClick={onCancel} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Job Demand' : 'Create Job Demand'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEdit
              ? 'Update requirement details. Requirement ID is read-only.'
              : 'Capture requirement details, client preferences, and assign recruiters.'}
          </p>
        </div>

        {/* Role Card Box */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 max-w-md text-xs shadow-2xs">
          <div className="font-bold text-slate-900">Role: Recruiter</div>
          <div className="text-slate-500 mt-0.5 leading-snug">
            You can assign recruiters, reassign work, and autofill key details using the JD document.
          </div>
        </div>
      </div>
    </>
  )
}
