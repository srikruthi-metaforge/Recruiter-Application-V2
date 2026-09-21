import React from 'react'
import { Users } from 'lucide-react'
import { RequirementDetailVm } from './useRequirementDetailOverview'

export function ReqDetailPipeline({ vm }: { vm: RequirementDetailVm }) {
  const {
    requirement,
    activeTab,
    setIsScheduleModalOpen,
    setSchedulingCandidateRow,
  } = vm
  return (
    <>
      {activeTab === 'Pipeline' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Candidate Pipeline</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Table view for high-volume tracking across all stages.
              </p>
            </div>
            <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>7 candidates</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 font-bold">CANDIDATE</th>
                  <th className="py-3 px-3 font-bold">EXPERIENCE</th>
                  <th className="py-3 px-3 font-bold">COMPANY</th>
                  <th className="py-3 px-3 font-bold">NOTICE</th>
                  <th className="py-3 px-3 font-bold">SUBMISSION STATUS</th>
                  <th className="py-3 px-2 font-bold text-center">L1</th>
                  <th className="py-3 px-2 font-bold text-center">L2</th>
                  <th className="py-3 px-2 font-bold text-center">FINAL</th>
                  <th className="py-3 px-2 font-bold text-center">OFFER LETTER</th>
                  <th className="py-3 px-3 font-bold">LAST ACTIVITY</th>
                  <th className="py-3 px-3 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {[
                  {
                    name: 'MUNTAZAR SAYED',
                    exp: '8 Years 2 Months',
                    company: '—',
                    notice: '—',
                    status: 'Submitted to Client',
                    activity: '19/06/2026, 19:29',
                    action: 'Schedule Interview',
                  },
                  {
                    name: 'Nikhil Joshte',
                    exp: '10 Years 4 Months',
                    company: '—',
                    notice: '—',
                    status: 'Submitted to Client',
                    activity: '19/06/2026, 19:29',
                    action: 'Schedule Interview',
                  },
                  {
                    name: 'Pratibha Kale',
                    exp: '10 Years 5 Months',
                    company: '—',
                    notice: '—',
                    status: 'Submitted to Client',
                    activity: '19/06/2026, 18:45',
                    action: 'Schedule Interview',
                  },
                  {
                    name: 'SANDEEP YADAV',
                    exp: '13 Years 1 Month',
                    company: '—',
                    notice: '—',
                    status: 'Submitted to Client',
                    activity: '19/06/2026, 18:38',
                    action: 'View only',
                  },
                  {
                    name: 'Akshay Soni',
                    exp: '3 Years 6 Months',
                    company: '—',
                    notice: '—',
                    status: 'Submitted to Client',
                    activity: '19/06/2026, 18:33',
                    action: 'Schedule Interview',
                  },
                  {
                    name: 'Sima Borokar',
                    exp: '4 Years 5 Months',
                    company: '—',
                    notice: '—',
                    status: 'Submitted to Client',
                    activity: '19/06/2026, 17:56',
                    action: 'Schedule Interview',
                  },
                  {
                    name: 'Puttapaka Saiteja',
                    exp: '5 years',
                    company: 'Metaforge it solutions',
                    notice: '30 days ,last working 29 April 2026.',
                    status: 'Submitted to Client',
                    activity: '19/06/2026, 17:50',
                    action: 'Schedule Interview',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900 whitespace-nowrap">{row.name}</td>
                    <td className="py-3 px-3 text-gray-700 whitespace-nowrap">{row.exp}</td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{row.company}</td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs truncate">{row.notice}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[11px] font-semibold">
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-gray-400">—</td>
                    <td className="py-3 px-2 text-center text-gray-400">—</td>
                    <td className="py-3 px-2 text-center text-gray-400">—</td>
                    <td className="py-3 px-2 text-center text-gray-400">—</td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{row.activity}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {row.action === 'Schedule Interview' ? (
                        <button
                          onClick={() => {
                            setSchedulingCandidateRow({
                              name: row.name,
                              email: `${row.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
                              requirementId: requirement.id,
                              position: requirement.title,
                              client: requirement.client,
                            })
                            setIsScheduleModalOpen(true)
                          }}
                          className="px-3.5 py-1.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all active:scale-98"
                        >
                          Schedule Interview
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">View only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERVIEWS TAB (MATCHING SCREENSHOT 3) */}
    </>
  )
}
