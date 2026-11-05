import React from 'react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { CandidateTableRow } from './CandidateTableRow'
import { CandidateRepoVm } from './useCandidateRepository'

export function CandidateTable({ vm }: { vm: CandidateRepoVm }) {
  const {
    selectedIds,
    filteredList,
    toggleSelectAll,
    paginatedRepoList,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    totalItems,
    listLoading,
  } = vm

  const total = typeof totalItems === 'number' ? totalItems : filteredList.length

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {listLoading ? (
        <div className="px-4 py-3 text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50">
          Loading candidates…
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={selectedIds.size === paginatedRepoList.length && paginatedRepoList.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-[#4F46E5] rounded-md focus:ring-[#4F46E5] cursor-pointer"
                />
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                CANDIDATE
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                PHONE
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                TECHNOLOGY
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                TOTAL EXPERIENCE
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                CREATED
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                CREATED BY
              </th>
              <th className="px-4 py-3.5 text-[11px] font-extrabold text-slate-700 uppercase tracking-wider text-right">
                EDIT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {paginatedRepoList.map(item => (
              <CandidateTableRow key={item.id} item={item} vm={vm} />
            ))}
          </tbody>
        </table>
      </div>
      {/* PAGINATION FOOTER */}
      <PaginationFooter
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(total / pageSize))}
        totalItems={total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setCurrentPage(1)
        }}
        itemLabel="candidates"
      />
    </div>
  )
}
