import React from 'react'
import { FileText, Download, FileSignature } from 'lucide-react'
import { ClientsVm } from './useClientsPage'

export function ClientsAgreementB({ vm }: { vm: ClientsVm }) {
  const { showToast, selectedClientForAgreement } = vm

  if (!selectedClientForAgreement) return null
  const agreement = selectedClientForAgreement

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-sm">Executed MSA Record</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            🔒 Legally Sealed
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Document Filename</span>
            <p className="font-bold text-white text-xs mt-0.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>{agreement.agreementDocName}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block font-medium">Valid From:</span>
              <p className="font-bold text-white mt-0.5">{agreement.agreementStartDate}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Valid Until:</span>
              <p className="font-bold text-emerald-400 mt-0.5">{agreement.agreementEndDate}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-400 text-[10px] block font-medium">SHA-256 Digital Checksum:</span>
            <p className="font-mono text-[10px] text-slate-300 break-all bg-slate-800/90 p-2 rounded-xl border border-slate-700 mt-1">
              e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast(`Downloading ${agreement.agreementDocName}...`)}
          className="w-full py-3 bg-[#6B3BF6] hover:bg-[#5833E0] text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Signed Agreement PDF</span>
        </button>
      </div>
    </div>
  )
}
