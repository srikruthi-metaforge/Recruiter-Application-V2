import React from 'react'
import { FileText, Award, Upload, Save, Check } from 'lucide-react'
import { ClientDeliveryGapAnalysisPage } from '../ClientDeliveryGapAnalysisPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientsVm } from './useClientsPage'

export function ClientsAddB({ vm }: { vm: ClientsVm }) {
  const {
    setViewMode,
    newCommercialFee,
    setNewCommercialFee,
    newPaymentTerms,
    setNewPaymentTerms,
    newSlaTAT,
    setNewSlaTAT,
    newAgreementStartDate,
    setNewAgreementStartDate,
    newAgreementEndDate,
    setNewAgreementEndDate,
    newAgreementDoc,
    setNewAgreementDoc,
    list,
  } = vm
  return (
    <>
          {/* SECTION 3: COMMERCIAL TERMS & SLA BENCHMARKS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>3. Commercial SLA & Payment Terms</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Commercial Empanelment Fee %</label>
                <input
                  type="text"
                  placeholder="e.g. 8.33% Annual CTC"
                  value={newCommercialFee}
                  onChange={e => setNewCommercialFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Payment Credit Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 30 Days Net"
                  value={newPaymentTerms}
                  onChange={e => setNewPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">First Submission SLA TAT</label>
                <input
                  type="text"
                  placeholder="e.g. 3.0 Days"
                  value={newSlaTAT}
                  onChange={e => setNewSlaTAT(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: MASTER SERVICES AGREEMENT (MSA) ATTACHMENT */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <FileText className="w-5 h-5 text-[#6B3BF6]" />
                <span>4. Master Services Agreement (MSA) Contract</span>
              </div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active Legal Executed Contract
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Contract Effective Start Date</label>
                <input
                  type="date"
                  value={newAgreementStartDate}
                  onChange={e => setNewAgreementStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Contract Expiry / Renewal Date</label>
                <input
                  type="date"
                  value={newAgreementEndDate}
                  onChange={e => setNewAgreementEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1.5">Upload Signed MSA Agreement PDF / Document</label>
              <div
                onClick={() => document.getElementById('full-page-msa-upload')?.click()}
                className="border-2 border-dashed border-purple-200 rounded-2xl p-6 bg-purple-50/40 text-center cursor-pointer hover:bg-purple-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-[#6B3BF6] mx-auto mb-2" />
                <p className="text-xs text-slate-800 font-bold">Click to attach signed Master Services Agreement (MSA)</p>
                <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX up to 25MB (Digital Signatures Accepted)</p>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={e => setNewAgreementDoc(e.target.files?.[0] || null)}
                  className="hidden"
                  id="full-page-msa-upload"
                />
              </div>
              {newAgreementDoc && (
                <p className="text-xs text-emerald-700 font-bold mt-2 text-center flex items-center justify-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Document Attached: {newAgreementDoc.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* BOTTOM SUBMIT BAR */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Save & Empanel Client Partner</span>
            </button>
          </div>
    </>
  )
}
