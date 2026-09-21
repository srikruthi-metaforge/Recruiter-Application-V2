import React from 'react'
import { Building2, User, ArrowLeft, Save } from 'lucide-react'
import { ClientDeliveryGapAnalysisPage } from '../ClientDeliveryGapAnalysisPage'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ClientsVm } from './useClientsPage'

export function ClientsAddA({ vm }: { vm: ClientsVm }) {
  const {
    setViewMode,
    newClientName,
    setNewClientName,
    newClientDomain,
    setNewClientDomain,
    newPocName,
    setNewPocName,
    newPocDesignation,
    setNewPocDesignation,
    newPocEmail,
    setNewPocEmail,
    newPocPhone,
    setNewPocPhone,
    newLocation,
    setNewLocation,
    list,
    handleAddClientSubmit,
  } = vm
  return (
    <>
      <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-200">
        {/* TOP PAGE HEADER WITH BACK BUTTON */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-slate-200"
              title="Back to Clients List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#6B3BF6]" />
                <span>Empanel New Client Partner</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in the organization details, primary contact POC, commercial SLA terms, and upload the signed Master Services Agreement (MSA).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              form="add-client-full-form"
              type="submit"
              className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Save & Empanel Client</span>
            </button>
          </div>
        </div>

        {/* FULL PAGE FORM CONTAINER */}
        <form id="add-client-full-form" onSubmit={handleAddClientSubmit} className="space-y-6">
          {/* SECTION 1: CLIENT ORGANIZATION DETAILS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>1. Client Organization Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Client Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wipro Digital Solutions"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Industry Sector / Domain</label>
                <select
                  value={newClientDomain}
                  onChange={e => setNewClientDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Software & Cloud Services">Software & Cloud Services</option>
                  <option value="Hardware & Automotive Engineering">Hardware & Automotive Engineering</option>
                  <option value="Enterprise Security & IT">Enterprise Security & IT</option>
                  <option value="Enterprise SAP & ERP">Enterprise SAP & ERP</option>
                  <option value="AI, Data & Analytics">AI, Data & Analytics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Operating Location / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore / Hyderabad / Remote"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRIMARY POC & CONTACT DETAILS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
              <User className="w-5 h-5 text-purple-600" />
              <span>2. Primary Point of Contact (POC)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Primary POC Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newPocName}
                  onChange={e => setNewPocName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Procurement Lead / VP Hiring"
                  value={newPocDesignation}
                  onChange={e => setNewPocDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Official Email Address</label>
                <input
                  type="email"
                  placeholder="ramesh.k@wipro.com"
                  value={newPocEmail}
                  onChange={e => setNewPocEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Mobile Contact Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newPocPhone}
                  onChange={e => setNewPocPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>
            </div>
          </div>

          <ClientsAddB vm={vm} />
        </form>
      </div>
    </>
  )
}
