import React from 'react'
import { CreateJobDemandVm } from './useCreateJobDemandForm'

export function CreateJobRoles({ vm }: { vm: CreateJobDemandVm }) {
  const { rolesAndResponsibilities, setRolesAndResponsibilities } = vm
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Roles & Responsibilities</h3>
        <p className="text-xs text-slate-400">
          Key duties for the role. Filled automatically after JD parse; you can edit before saving.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700">Roles & Responsibilities</label>
        <textarea
          value={rolesAndResponsibilities}
          onChange={e => setRolesAndResponsibilities(e.target.value)}
          rows={6}
          placeholder="e.g. Own door design from concept to production&#10;- Validate master sections&#10;- Collaborate with CFT on packaging and regulations"
          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-[#6B3BF6]/20 outline-none resize-y min-h-[120px]"
        />
      </div>
    </div>
  )
}
