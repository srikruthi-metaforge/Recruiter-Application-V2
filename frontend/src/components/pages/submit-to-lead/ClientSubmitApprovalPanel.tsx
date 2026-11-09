import React, { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, ShieldAlert, XCircle } from 'lucide-react'
import {
  clientSubmitApprovalService,
  toForwardRequestShape,
} from '../../../services/clientSubmitApproval.service'
import type { ForwardRequest } from '../../../data/forwardRequestsStore'
import { getSessionUser } from '../../../store/session'

const EVENT = 'forward_requests_updated'

/** Inbox for Lead / Admin / Super Admin to approve recruiter client-submit requests. */
export function ClientSubmitApprovalPanel({
  role,
  onToast,
}: {
  role?: string
  onToast?: (msg: string) => void
}) {
  const normalized = String(role || getSessionUser()?.role || '').toLowerCase()
  const canApprove =
    normalized === 'lead' ||
    normalized === 'team lead' ||
    normalized === 'team_lead' ||
    normalized === 'admin' ||
    normalized === 'superadmin' ||
    normalized === 'devteam'

  const [pending, setPending] = useState<ForwardRequest[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!canApprove) return
    try {
      const rows = await clientSubmitApprovalService.list({ status: 'pending' })
      setPending((Array.isArray(rows) ? rows : []).map(toForwardRequestShape))
    } catch {
      setPending([])
    }
  }, [canApprove])

  useEffect(() => {
    void refresh()
    const sync = () => {
      void refresh()
    }
    window.addEventListener(EVENT, sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('focus', sync)
    }
  }, [refresh])

  // Hide until a recruiter actually requests client-submit approval.
  if (!canApprove || pending.length === 0) return null

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700" />
        <h3 className="text-sm font-extrabold text-amber-950">
          Client Submit Approval Requests ({pending.length})
        </h3>
      </div>
      <p className="text-[11px] text-amber-900/80 font-medium">
        Recruiters requested permission to submit candidate profiles directly to the client. Approve or reject below.
      </p>
      <div className="space-y-2">
          {pending.map(req => (
            <div
              key={req.id}
              className="bg-white border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {req.reqTitle || req.reqId}
                  {req.clientName ? ` · ${req.clientName}` : ''}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  Requested by <strong>{req.recruiterName}</strong>
                  {req.recruiterEmail ? ` (${req.recruiterEmail})` : ''}
                  {req.requestedAt ? ` · ${req.requestedAt}` : ''}
                </p>
                {req.candidateNames?.length > 0 && (
                  <p className="text-[10px] text-slate-500 truncate">
                    Candidates: {req.candidateNames.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={busyId === req.id}
                  onClick={async () => {
                    setBusyId(req.id)
                    try {
                      await clientSubmitApprovalService.reject(req.id)
                      window.dispatchEvent(new CustomEvent(EVENT))
                      onToast?.(`Rejected client-submit request for ${req.reqTitle || req.reqId}`)
                      await refresh()
                    } catch (e: any) {
                      onToast?.(e?.message || 'Failed to reject request')
                    } finally {
                      setBusyId(null)
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={busyId === req.id}
                  onClick={async () => {
                    setBusyId(req.id)
                    try {
                      await clientSubmitApprovalService.approve(req.id)
                      window.dispatchEvent(new CustomEvent(EVENT))
                      onToast?.(`Approved client-submit for ${req.reqTitle || req.reqId}`)
                      await refresh()
                    } catch (e: any) {
                      onToast?.(e?.message || 'Failed to approve request')
                    } finally {
                      setBusyId(null)
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
