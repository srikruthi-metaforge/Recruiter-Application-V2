import React from 'react'

export function SubmissionCandidateDetailFields({
  exp,
  company,
  submittedBy,
  submittedOn,
  submissionId,
  status,
}: {
  exp: string
  company: string
  submittedBy: string
  submittedOn: string
  submissionId: string
  status: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 text-xs">
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            TOTAL EXPERIENCE
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{exp}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            NOTICE PERIOD
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">30 Days</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            EXPECTED SALARY
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">6.5 Lpa</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            PREFERRED LOCATION
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">Bengaluru</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            SKILLS
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium text-[11px]">
              PLM/PDM Engineer
            </span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-medium text-[11px]">
              PLM-6 Months PDM-1.06 Years Change Management-1.06 Years
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SUBMISSION ID
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{submissionId}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SUBMITTED BY
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{submittedBy}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            CURRENT COMPANY
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{company}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            CURRENT SALARY
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">3.5 Lpa</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            LOCATION
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">Bengaluru</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SOURCE
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">—</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            SUBMITTED
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{submittedOn}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            STATUS
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{status}</p>
        </div>
      </div>
    </div>
  )
}
