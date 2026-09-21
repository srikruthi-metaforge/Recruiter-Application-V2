import React from 'react'
import { ArrowLeft, Search, UserPlus } from 'lucide-react'
import { CandidateRepoVm } from './useCandidateRepository'

export function CandidateListHeader({ vm }: { vm: CandidateRepoVm }) {
  const {
    onBackToDashboard,
    onOpenAddForm,
    role,
    activeRequirement,
    setTempModalReqId,
    setIsChangeReqModalOpen,
    setActiveReqId,
    onSelectRequirement,
    showToast,
    searchQuery,
    setSearchQuery,
  } = vm
  return (
    <>
      {/* 1. BACK BUTTON & HEADER BAR WITH + ADD ACTIVE CANDIDATE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => {
              if (onBackToDashboard) {
                onBackToDashboard()
              } else {
                onOpenAddForm()
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Go Back</span>
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Repository</h1>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive database of candidate profiles. Click any row to view complete details, edit, or submit to requirement.
            </p>
          </div>
        </div>

        {!(role === 'recruiter' || role === 'lead') && (
          <div>
            <button
              type="button"
              onClick={onOpenAddForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Active Candidate</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. REQUIREMENT INFO BANNER (shown only when a requirement is selected) */}
      {activeRequirement && (
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-emerald-950 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              Selecting for:{' '}
              <strong className="font-extrabold text-emerald-950">
                {activeRequirement.id} — {activeRequirement.title} ({activeRequirement.client})
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setTempModalReqId(activeRequirement.id)
                setIsChangeReqModalOpen(true)
              }}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer text-xs"
            >
              Change requirement
            </button>
            <button
              onClick={() => {
                setActiveReqId(null)
                onSelectRequirement?.(null)
                showToast('Cleared selected requirement')
              }}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 3. FILTER & SEARCH CONTROL CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone, skills, technology, company..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all"
          />
        </div>
      </div>
    </>
  )
}
