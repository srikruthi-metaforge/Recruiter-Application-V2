import React from 'react'
import { Building2, X, ArrowUpRight } from 'lucide-react'
import { ClientPerformanceData } from '../ClientDetailAnalyticsPage'

type Metric = 'reqSent' | 'reqAssigned' | 'submissions' | 'openReqs' | 'closedReqs'

interface Props {
  drillDownModal: { client: ClientPerformanceData; metric: Metric }
  setDrillDownModal: (v: { client: ClientPerformanceData; metric: Metric } | null) => void
  onSelectClient: (client: ClientPerformanceData) => void
}

export function ClientPerformanceDrilldownModal({
  drillDownModal,
  setDrillDownModal,
  onSelectClient,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200/80 animate-in zoom-in-95 duration-150 font-sans text-slate-800">
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#6B3BF6]" />
              <span>{drillDownModal.client.clientName}</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 capitalize">
              {drillDownModal.metric === 'reqSent'
                ? 'All Requirements Sent'
                : drillDownModal.metric === 'reqAssigned'
                ? 'Assigned Requirements Breakdown'
                : drillDownModal.metric === 'submissions'
                ? 'Candidate Submissions Detail'
                : drillDownModal.metric === 'openReqs'
                ? 'Open Requirements'
                : 'Closed Requirements'}
            </p>
          </div>

          <button
            onClick={() => setDrillDownModal(null)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">REQ ID & TITLE</th>
                  <th className="py-3 px-4">CANDIDATE & ROLE</th>
                  <th className="py-3 px-4">ASSIGNED RECRUITER</th>
                  <th className="py-3 px-4 text-center">SUBMISSIONS</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 font-medium text-slate-800">
                {drillDownModal.client.requirementsList.map(req => (
                  <tr key={req.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 text-xs">{req.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{req.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 text-xs">
                        {(req as any).candidateName || (req as any).candidate || 'Candidate Profile'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {(req as any).candidateRole || req.title || 'Engineering Specialist'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-bold">{req.assignedRecruiter}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#6B3BF6]">{req.submissions}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        req.status === 'Open' || req.status === 'In Progress'
                          ? 'bg-purple-50 text-[#6B3BF6] border border-purple-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              const targetClient = drillDownModal.client
              setDrillDownModal(null)
              onSelectClient(targetClient)
            }}
            className="px-4 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>View Full Client Analytics</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => setDrillDownModal(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
