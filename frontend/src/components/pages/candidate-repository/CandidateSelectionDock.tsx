import React from 'react'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'
import { CandidateRepoVm } from './useCandidateRepository'

export function CandidateSelectionDock({ vm }: { vm: CandidateRepoVm }) {
  const {
    activeRequirement,
    selectedIds,
    viewMode,
    setSelectedIds,
    repoList,
    showToast,
    setSelectedCandidatesForSubmit,
    setViewMode,
    scrollToNextPageSection,
  } = vm
  return (
    <>
      {activeRequirement && selectedIds.size > 0 && viewMode !== 'submit_to_lead' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#EFF6FF] border border-[#C7D2FE] shadow-2xl rounded-2xl p-2.5 px-6 flex items-center gap-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-extrabold text-[#1E3A8A]">
            {selectedIds.size} candidate(s) selected for {activeRequirement.id}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs"
            >
              Clear Selection
            </button>
            <button
              onClick={() => {
                const items = repoList.filter(i => selectedIds.has(i.id))
                const dupItems = items.filter(i =>
                  checkDuplicateSubmission(activeRequirement.id, {
                    email: i.email,
                    phone: i.phone,
                    candidateId: i.candidateId,
                    name: i.name,
                  }).isDuplicate
                )

                if (dupItems.length > 0) {
                  showToast(
                    `⚠️ Duplicate Submission: ${dupItems.map(d => d.name).join(', ')} ${dupItems.length === 1 ? 'has' : 'have'} already been submitted for ${activeRequirement.title}. Cannot submit duplicate candidates.`
                  )
                  return
                }

                setSelectedCandidatesForSubmit(items)
                setViewMode('submit_to_lead')
                scrollToNextPageSection()
              }}
              className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
            >
              <span>Submit Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
