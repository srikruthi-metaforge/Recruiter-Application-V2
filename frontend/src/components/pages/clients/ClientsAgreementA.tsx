import React from 'react'
import { Building2, Download, CheckCircle2, Award, ArrowLeft, Printer, ShieldCheck } from 'lucide-react'
import { ClientDeliveryGapAnalysisPage } from '../ClientDeliveryGapAnalysisPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientsVm } from './useClientsPage'

export function ClientsAgreementA({ vm }: { vm: ClientsVm }) {
  const {
    setViewMode,
    showToast,
    selectedClientForAgreement,
  } = vm

  if (!selectedClientForAgreement) return null
  const agreement = selectedClientForAgreement

  return (
    <>
      <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-200">
        {/* TOP HEADER WITH BACK BUTTON & DOWNLOAD PDF ACTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-slate-200"
              title="Back to Clients List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Master Services Agreement (MSA)
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{agreement.agreementStatus}</span>
                </span>
              </div>
              <p className="text-xs text-[#6B3BF6] font-bold mt-0.5">
                Empaneled Client Partner: <strong className="text-slate-900">{agreement.name}</strong> ({agreement.id})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast(`Printing Agreement Record for ${agreement.name}...`)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print MSA</span>
            </button>

            <button
              onClick={() => showToast(`Downloading ${agreement.agreementDocName}...`)}
              className="px-4 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed Agreement (PDF)</span>
            </button>
          </div>
        </div>

        {/* AGREEMENT OVERVIEW DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT 2 COLUMNS: DETAILED AGREEMENT SECTIONS */}
          <div className="lg:col-span-2 space-y-5">
            {/* CARD 1: CONTRACTING PARTIES & LEGAL INFORMATION */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>1. Contracting Client Partner & Signatory Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Organization Name:</span>
                    <span className="font-extrabold text-slate-900">{agreement.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Industry Domain:</span>
                    <span className="font-bold text-[#6B3BF6]">{agreement.domain}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Empanelment ID:</span>
                    <span className="font-bold text-slate-800">{agreement.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Operating Location:</span>
                    <span className="font-semibold text-slate-700">{agreement.location}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Authorized Signatory:</span>
                    <span className="font-extrabold text-slate-900">{agreement.signedBy}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Primary POC Email:</span>
                    <span className="font-bold text-blue-700">{agreement.pocEmail}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500 font-medium">Primary POC Contact:</span>
                    <span className="font-semibold text-slate-800">{agreement.pocPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Execution Date:</span>
                    <span className="font-bold text-emerald-800">{agreement.signedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: COMMERCIAL SLA BENCHMARKS & PAYMENT TERMS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>2. Commercial SLA & Fee Structure</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Commercial Empanelment Fee
                  </span>
                  <p className="text-lg font-extrabold text-emerald-950">{agreement.commercialFee}</p>
                  <p className="text-[10px] text-emerald-700">Calculated on First Year Gross CTC</p>
                </div>

                <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                    Payment Credit Period
                  </span>
                  <p className="text-lg font-extrabold text-purple-950">{agreement.paymentTerms}</p>
                  <p className="text-[10px] text-purple-700">Triggered upon joining date</p>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                    First Submissions SLA TAT
                  </span>
                  <p className="text-lg font-extrabold text-blue-950">{agreement.slaTAT}</p>
                  <p className="text-[10px] text-blue-700">Turnaround SLA Benchmark</p>
                </div>
              </div>
            </div>

            {/* CARD 3: LEGAL CLAUSES & GUARANTEE COVENANTS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-[#6B3BF6]" />
                <span>3. Guarantee Covenants & Legal Terms</span>
              </div>

              <div className="space-y-2 text-slate-700 font-medium leading-relaxed">
                <p>
                  <strong>• Candidate Replacement Guarantee:</strong> Includes a 90-day free replacement guarantee. If a candidate leaves within 90 calendar days of joining, a replacement candidate will be provided at zero additional cost within 30 days.
                </p>
                <p>
                  <strong>• Non-Solicitation & NDA Covenant:</strong> Both parties agree to strict confidentiality and non-solicitation guidelines for a duration of 24 months post-agreement termination.
                </p>
                <p>
                  <strong>• Invoicing Milestones:</strong> Invoices are generated on candidate joining date with standard payment clearance terms as specified ({agreement.paymentTerms}).
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DIGITAL DOCUMENT PREVIEW & VALIDITY RECORD */}
          <ClientsAgreementB vm={vm} />
        </div>
      </div>
    </>
  )
}
