import React from 'react'
import { Users, CheckCircle } from 'lucide-react'
import { PageHeader } from '../../layout/PageHeader'
import { AddCandidateVm } from './useAddCandidatePage'

export function AddCandidateChrome({ vm }: { vm: AddCandidateVm }) {
  const {
    onOpenRepository,
    showSuccessToast,
  } = vm
  return (
    <>
      {/* SUCCESS TOAST ALERT */}
      {showSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Candidate saved successfully to Repository!</span>
        </div>
      )}

      <PageHeader
        title="Candidate Search & Entry"
        subtitle="Drop a resume to auto-fill details with Metaforge AI, or enter manually. Single or bulk import supported — review before submitting."
        action={
          <button
            onClick={onOpenRepository}
            className="inline-flex items-center justify-center gap-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <Users className="w-4 h-4" />
            Candidate Repository
          </button>
        }
      />
    </>
  )
}
