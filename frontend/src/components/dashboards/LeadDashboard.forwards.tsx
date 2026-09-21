import React from 'react'
import { Send, CheckCircle2, Clock, XCircle, ShieldCheck } from 'lucide-react'
import {
  approveForwardRequest,
  rejectForwardRequest,
  ForwardRequest,
} from '../../data/forwardRequestsStore'

export function LeadDashboardForwardPanel({
  forwardRequests,
  pendingCount,
}: {
  forwardRequests: ForwardRequest[]
  pendingCount: number
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-bold">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Client Loop Forward Requests
            </h3>
            <p className="text-xs text-slate-500">
              Recruiter requests to forward submissions directly to client email loops (Require Lead Approval)
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold rounded-full flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{pendingCount} Pending Approval</span>
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {forwardRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic">No forward requests raised yet.</p>
        ) : (
          forwardRequests.map(req => (
            <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-slate-900">{req.recruiterName}</span>
                  <span className="text-xs text-slate-400 font-mono">({req.recruiterEmail})</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                    {req.clientName}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Req: <strong className="text-slate-900">{req.reqTitle}</strong> ({req.reqId})
                </p>
                <p className="text-xs text-slate-500">
                  Candidate: <strong className="text-slate-800">{req.candidateNames.join(', ')}</strong> • Requested: {req.requestedAt}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {req.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        approveForwardRequest(req.id, 'Team Lead')
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept / Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        rejectForwardRequest(req.id, 'Team Lead')
                      }}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : req.status === 'approved' ? (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>✓ Approved (Access Unlocked)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold">
                    Rejected
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
