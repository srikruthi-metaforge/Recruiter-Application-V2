import React, { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Search, Send, ShieldAlert, Sparkles } from 'lucide-react'
import { Requirement } from '../../types'
import { PaginationFooter } from '../ui/PaginationFooter'
import { maskEmail, maskPhone } from '../pages/candidate-repository/masking'
import { CandidateRepoItem } from './SubmitCandidateModal.data'

export function SubmitCandidateExistingPath({
  searchQuery,
  setSearchQuery,
  filteredCandidates,
  selectedIds,
  selectedCandidates,
  selectedDupCount,
  submittableSelected,
  toggleSelectCandidate,
  toggleSelectAllFiltered,
  targetReqId,
  targetReq,
  isCandidateDupOnTarget,
  isSubmitting,
  onClose,
  onSubmitExisting,
}: {
  searchQuery: string
  setSearchQuery: (value: string) => void
  filteredCandidates: CandidateRepoItem[]
  selectedIds: Set<string>
  selectedCandidates: CandidateRepoItem[]
  selectedDupCount: number
  submittableSelected: CandidateRepoItem[]
  toggleSelectCandidate: (id: string) => void
  toggleSelectAllFiltered: (idsOnPage: string[]) => void
  targetReqId: string
  targetReq: Requirement | undefined
  isCandidateDupOnTarget: (c: CandidateRepoItem) => { isDuplicate: boolean; matchReason?: string }
  isSubmitting?: boolean
  onClose: () => void
  onSubmitExisting: (e: React.FormEvent) => void
}) {
  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [unmaskedIds, setUnmaskedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize, filteredCandidates.length])

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize))
  const page = Math.min(currentPage, totalPages)
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredCandidates.slice(start, start + pageSize)
  }, [filteredCandidates, page, pageSize])

  const pageIds = paginated.map(c => c.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id))

  const toggleMask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setUnmaskedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <form onSubmit={onSubmitExisting} className="space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by name, email, phone, skills, technology, company"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[42vh]">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 bg-slate-50/95">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={() => toggleSelectAllFiltered(pageIds)}
                    className="w-4 h-4 text-[#4F46E5] rounded-md focus:ring-[#4F46E5] cursor-pointer"
                    title="Select all on this page"
                  />
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Technology
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Total Experience
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-3 py-3 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-500 font-semibold">
                    No candidates match your search.
                  </td>
                </tr>
              ) : (
                paginated.map(c => {
                  const isSelected = selectedIds.has(c.id)
                  const isUnmasked = unmaskedIds.has(c.id)
                  const dupInfo = isCandidateDupOnTarget(c)
                  return (
                    <tr
                      key={c.id}
                      onClick={() => toggleSelectCandidate(c.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected
                          ? dupInfo.isDuplicate
                            ? 'bg-rose-50/50'
                            : 'bg-indigo-50/50'
                          : dupInfo.isDuplicate
                            ? 'bg-rose-50/20'
                            : ''
                      }`}
                    >
                      <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCandidate(c.id)}
                          className="w-4 h-4 text-[#4F46E5] rounded-md focus:ring-[#4F46E5] cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                          {dupInfo.isDuplicate && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              Duplicate
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{c.candidateId}</div>
                      </td>
                      <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                        <div
                          className="font-mono text-slate-700 text-xs truncate max-w-[200px]"
                          title={isUnmasked ? c.email : maskEmail(c.email)}
                        >
                          {isUnmasked ? c.email : maskEmail(c.email)}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 font-mono text-slate-600 text-xs">
                          <span>{isUnmasked ? c.phone : maskPhone(c.phone)}</span>
                          <button
                            type="button"
                            onClick={e => toggleMask(c.id, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title={isUnmasked ? 'Mask contact info' : 'View unmasked contact info'}
                          >
                            {isUnmasked ? (
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-slate-800 text-xs max-w-[220px]">
                        <span className="line-clamp-2" title={c.technology || c.skills}>
                          {c.technology || c.skills || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-800 text-xs">
                        {c.totalExperience || '—'}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-700 text-xs">
                        {c.createdDate || '—'}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-700 text-xs">
                        {c.createdBy || '—'}
                      </td>
                      <td className="px-3 py-3.5 text-right whitespace-nowrap">
                        {dupInfo.isDuplicate ? (
                          <span className="text-[11px] font-bold text-rose-600">Already submitted</span>
                        ) : isSelected ? (
                          <span className="text-[11px] font-bold text-[#6B3BF6]">Selected</span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredCandidates.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="candidates"
        />
      </div>

      {selectedCandidates.length > 0 && (
        <div className="bg-[#EFF6FF] border border-[#C7D2FE] rounded-2xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1E3A8A]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {selectedCandidates.length} candidate(s) selected
              {selectedDupCount > 0 ? ` · ${selectedDupCount} duplicate(s) will be skipped` : ''}
            </span>
          </div>
          <p className="text-xs text-[#1E3A8A]/80">
            {submittableSelected.length} will be forwarded to{' '}
            <strong>
              {targetReq?.id} — {targetReq?.title}
            </strong>{' '}
            ({targetReq?.client}).
          </p>
        </div>
      )}

      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
        <div className="text-[11px] text-slate-500 font-semibold">
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select one or more candidates'}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!submittableSelected.length || !!isSubmitting}
            className="px-6 py-2.5 text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 bg-[#6B3BF6] hover:bg-[#5833E0] disabled:opacity-50 text-white cursor-pointer active:scale-98"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              Continue with {submittableSelected.length || 0} Candidate
              {submittableSelected.length === 1 ? '' : 's'}
            </span>
          </button>
        </div>
      </div>
    </form>
  )
}
