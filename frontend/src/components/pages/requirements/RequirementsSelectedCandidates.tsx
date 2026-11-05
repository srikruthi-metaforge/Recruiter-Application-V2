import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Eye } from 'lucide-react'
import { RequirementsVm } from './useRequirementsPage'
import { isFinalOrSelectedStage } from '../../../utils/submissionStatusFilter'
import { requirementMatchKeys } from '../../ui/requirementAssignment'
import { PaginationFooter } from '../../ui/PaginationFooter'

/** Resolve display fields from workspace / API submission shapes. */
function submissionCandidateName(s: any): string {
  return String(s.candidate || s.candidateName || s.name || '—')
}

function submissionRecruiterName(s: any): string {
  return String(s.recruiter || s.recruiterName || s.submittedBy || '—')
}

function submissionReqLabel(s: any): string {
  return String(s.reqCode || s.req || s.requirementTitle || s.requirement || '—')
}

function submissionStage(s: any): string {
  return String(s.stage || s.status || '—')
}

function submissionKey(s: any, index: number): string {
  return String(s._id || s.id || s.submissionId || `sel-${index}`)
}

/**
 * Super Admin / Admin Selected KPI drill-down: every Offered / Selected / Placed
 * candidate across the org (not one row per requirement).
 */
export function RequirementsSelectedCandidates({ vm }: { vm: RequirementsVm }) {
  const { submissions, localRequirements, setSelectedReqForDetail } = vm
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const selectedRows = useMemo(() => {
    const list = Array.isArray(submissions) ? submissions : []
    return list
      .filter(s => isFinalOrSelectedStage((s as any).stage || (s as any).status))
      .map((s, index) => {
        const stage = submissionStage(s)
        const reqHint =
          (s as any).requirementId ||
          (s as any).reqCode ||
          (s as any).req ||
          ''
        const matchedReq = localRequirements.find(r => {
          const key = String(reqHint || '').trim()
          if (!key) return false
          const keys = requirementMatchKeys(r)
          if (keys.includes(key)) return true
          return keys.some(k => key.includes(k) || k.includes(key))
        })
        return {
          key: submissionKey(s, index),
          candidateName: submissionCandidateName(s),
          recruiterName: submissionRecruiterName(s),
          reqLabel: matchedReq
            ? String(matchedReq.reqCode || matchedReq.id || submissionReqLabel(s))
            : submissionReqLabel(s),
          reqTitle: matchedReq?.title || '',
          client: matchedReq?.client || (s as any).client || '',
          stage,
          requirement: matchedReq || null,
        }
      })
      .sort((a, b) => {
        const byRec = a.recruiterName.localeCompare(b.recruiterName)
        if (byRec !== 0) return byRec
        return a.candidateName.localeCompare(b.candidateName)
      })
  }, [submissions, localRequirements])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedRows.length, pageSize])

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return selectedRows.slice(start, start + pageSize)
  }, [selectedRows, currentPage, pageSize])

  if (selectedRows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 text-center shadow-2xs">
        <p className="text-xs font-semibold text-slate-500">
          No offered / selected / placed candidates found.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-2xs overflow-hidden">
      <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900">
              Selected / Offered Candidates
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              Showing {selectedRows.length} final-stage candidates across the organization
              (includes multiple offers on the same requirement).
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4">Candidate</th>
              <th className="py-2.5 px-4">Submitted By</th>
              <th className="py-2.5 px-4">Requirement</th>
              <th className="py-2.5 px-4">Client</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
            {paginatedRows.map(row => (
              <tr key={row.key} className="hover:bg-emerald-50/40 transition-colors">
                <td className="py-3 px-4 font-extrabold text-slate-900">{row.candidateName}</td>
                <td className="py-3 px-4 text-slate-700">{row.recruiterName}</td>
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{row.reqLabel}</div>
                  {row.reqTitle ? (
                    <div className="text-[11px] text-slate-500 font-normal truncate max-w-xs" title={row.reqTitle}>
                      {row.reqTitle}
                    </div>
                  ) : null}
                </td>
                <td className="py-3 px-4 text-slate-700">{row.client || '—'}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {row.stage}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {row.requirement ? (
                    <button
                      type="button"
                      onClick={() => setSelectedReqForDetail(row.requirement)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#6B3BF6] bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Open Req
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationFooter
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(selectedRows.length / pageSize))}
        totalItems={selectedRows.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={size => {
          setPageSize(size)
          setCurrentPage(1)
        }}
        itemLabel="candidates"
      />
    </div>
  )
}
