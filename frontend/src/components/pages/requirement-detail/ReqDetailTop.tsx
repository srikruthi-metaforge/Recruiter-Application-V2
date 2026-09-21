import React from 'react'
import { ArrowLeft, Pencil, Briefcase, Calendar, Eye, User, UserPlus, RotateCcw } from 'lucide-react'
import { RequirementDetailVm } from './useRequirementDetailOverview'

export function ReqDetailTop({ vm }: { vm: RequirementDetailVm }) {
  const {
    requirement,
    onBack,
    onOpenAssignModal,
    onEditRequirement,
    onAddCandidate,
    onRevokeRequirement,
    setIsAddCandidateModalOpen,
    isRecruiter,
    isUnassigned,
    showToast,
  } = vm
  return (
    <>
      {/* 1. TOP BAR WITH BACK BUTTON AND ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
          <span>Back</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isRecruiter && onOpenAssignModal && !isUnassigned && (
            <button
              onClick={onOpenAssignModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Reassign</span>
            </button>
          )}

          {onRevokeRequirement && !isUnassigned && (
            <button
              onClick={onRevokeRequirement}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Revoke Requirement</span>
            </button>
          )}

          {!isUnassigned && (
            <button
              onClick={() => {
                if (onAddCandidate) onAddCandidate()
                setIsAddCandidateModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-[#6B3BF6]/30 rounded-xl text-xs font-bold text-[#6B3BF6] bg-purple-50 hover:bg-purple-100 transition-all shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#6B3BF6]" />
              <span>Add Candidate</span>
            </button>
          )}

          <button
            onClick={onEditRequirement || (() => showToast('Editing requirement details...'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200/90 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-2xs cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-500" />
            <span>Edit Requirement</span>
          </button>
        </div>
      </div>

      {/* 2. HEADER BANNER WITH REQUIREMENT ID, PRIORITY, TITLE & SUBTEXT */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-2">
        {/* Top Badges Line */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-800">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>{requirement.id}</span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
              requirement.priority === 'High'
                ? 'bg-red-50 text-red-700 border-red-200'
                : requirement.priority === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            {requirement.priority}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              isUnassigned
                ? 'bg-gray-100 text-gray-600 border-gray-300'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            {isUnassigned ? 'Unassigned' : (requirement.assignmentStatus || 'Submitted')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
          {requirement.title}
        </h1>

        {/* Metadata sub-row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium pt-1">
          <span>{requirement.clientEmail ? requirement.clientEmail.split('@')[0] : 'harish'}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>SLA remaining: <strong>{isUnassigned ? '10 days' : '0 days'}</strong></span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 bg-purple-50 text-[#6B3BF6] px-2.5 py-0.5 rounded-full border border-purple-200 font-extrabold">
            <User className="w-3.5 h-3.5 text-[#6B3BF6]" />
            <span>Assigned Recruiter: <strong>{requirement.owner || 'Unassigned'}</strong></span>
            {!isRecruiter && onOpenAssignModal && (
              <button
                onClick={onOpenAssignModal}
                className="text-blue-600 font-bold hover:underline cursor-pointer ml-1 text-[11px]"
              >
                Reassign
              </button>
            )}
          </span>
        </div>
      </div>

      {/* 3. VIEW ONLY WARNING BANNER (IF UNASSIGNED) */}
      {isUnassigned && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5 shadow-2xs">
          <Eye className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold mr-1.5">View only</strong>
            <span>This requirement is not assigned. Candidates cannot be added or submitted until it is assigned.</span>
          </div>
        </div>
      )}

    </>
  )
}
