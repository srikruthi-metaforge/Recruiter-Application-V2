import React from 'react'
import { CreateJobDemandVm } from './useCreateJobDemandForm'

export function CreateJobClient({ vm }: { vm: CreateJobDemandVm }) {
  const {
    requirementFrom,
    setRequirementFrom,
    customCompany,
    setCustomCompany,
  } = vm
  return (
    <>
        {/* CLIENT INFORMATION CARD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Client Information</h3>
            <p className="text-xs text-slate-400">Client details and JD reference.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requirement From <span className="text-[10px] text-slate-400 font-normal ml-1">Pick a preset or Other to type a new company or source.</span>
              </label>
              <select
                value={requirementFrom}
                onChange={e => setRequirementFrom(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#6B3BF6]/20 outline-none cursor-pointer"
              >
                <option value="ITC">ITC</option>
                <option value="Accenture">Accenture</option>
                <option value="Goldman Sachs">Goldman Sachs</option>
                <option value="LTTS">LTTS</option>
                <option value="TCS">TCS</option>
                <option value="Cognizant">Cognizant</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {requirementFrom === 'Other' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Specify Company Name
                </label>
                <input
                  type="text"
                  value={customCompany}
                  onChange={e => setCustomCompany(e.target.value)}
                  placeholder="Enter client company name..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#6B3BF6]/20 outline-none"
                />
              </div>
            )}
          </div>
        </div>

    </>
  )
}
