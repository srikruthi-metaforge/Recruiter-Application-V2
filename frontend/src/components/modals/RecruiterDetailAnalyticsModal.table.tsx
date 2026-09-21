import React from 'react'
import { Briefcase } from 'lucide-react'
import { RecruiterDetailData } from './RecruiterDetailAnalyticsModal.types'

export function RecruiterDetailAnalyticsTable({
  recruiter,
  activeTab,
  setActiveTab,
}: {
  recruiter: RecruiterDetailData
  activeTab: 'overview' | 'requirements' | 'submissions'
  setActiveTab: (tab: 'overview' | 'requirements' | 'submissions') => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-slate-600" />
          <span>Assigned Requirements Activity ({recruiter.requirementsList.length})</span>
        </h4>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            All ({recruiter.requirementsList.length})
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'requirements' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Worked ({recruiter.workedReqs})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              activeTab === 'submissions' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Non-Worked ({recruiter.nonWorkedReqs})
          </button>
        </div>
      </div>

      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="max-h-48 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">REQUIREMENT</th>
                <th className="py-2.5 px-3">CLIENT</th>
                <th className="py-2.5 px-3">WORKED STATUS</th>
                <th className="py-2.5 px-3 text-center">SUBMISSIONS</th>
                <th className="py-2.5 px-3 text-center">INTERVIEWS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recruiter.requirementsList
                .filter(r => {
                  if (activeTab === 'requirements') return r.status === 'Worked'
                  if (activeTab === 'submissions') return r.status === 'Non-Worked'
                  return true
                })
                .map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {r.title}
                      <span className="text-[10px] text-slate-400 block font-normal">{r.id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{r.client}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Worked'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {r.status === 'Worked' ? '✓ Worked' : '⚠️ Non-Worked'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-purple-700">
                      {r.submissions}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {r.interviews}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
