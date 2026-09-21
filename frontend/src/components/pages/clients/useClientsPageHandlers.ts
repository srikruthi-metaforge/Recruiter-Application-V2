import React from 'react'
import type { ClientsVmState } from './useClientsPageState'
import { ClientRecord } from './preamble'

export function useClientsPageHandlers(s: ClientsVmState) {
  const {
    clients, setClients, setViewMode, newClientName,
    setNewClientName, newClientDomain, newPocName, setNewPocName,
    newPocDesignation, newPocEmail, setNewPocEmail, newPocPhone,
    setNewPocPhone, newLocation, newCommercialFee, newPaymentTerms,
    newSlaTAT, newAgreementStartDate, newAgreementEndDate, newAgreementDoc,
    showToast
  } = s
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName.trim() || !newPocName.trim()) return

    const newRecord: ClientRecord = {
      id: `CLI-${Math.floor(100 + Math.random() * 900)}`,
      name: newClientName.trim(),
      domain: newClientDomain,
      pocName: newPocName.trim(),
      pocEmail: newPocEmail.trim() || 'poc@client.com',
      pocPhone: newPocPhone.trim() || '+91 98765 00000',
      location: newLocation.trim(),
      teamLead: 'Harish Gadipally',
      teamMemberCount: 2,
      teamMembers: ['Marcus Chen', 'Priya Sharma'],
      activeReqs: 0,
      totalSubmissions: 0,
      totalPlacements: 0,
      commercialFee: newCommercialFee,
      paymentTerms: newPaymentTerms,
      slaTAT: newSlaTAT,
      agreementStatus: 'Active - Executed',
      agreementStartDate: newAgreementStartDate,
      agreementEndDate: newAgreementEndDate,
      agreementDocName: newAgreementDoc ? newAgreementDoc.name : `${newClientName.replace(/\s+/g, '_')}_MSA_Agreement.pdf`,
      signedBy: `${newPocName.trim()} (${newPocDesignation})`,
      signedDate: '11 Aug 2026',
    }

    setClients([newRecord, ...clients])
    setViewMode('list')
    showToast(`Successfully empaneled new client: ${newClientName}`)

    // Reset Form
    setNewClientName('')
    setNewPocName('')
    setNewPocEmail('')
    setNewPocPhone('')
  }

  // Render Client Delivery Gap Analysis Page when client is clicked
  return {
    handleAddClientSubmit
  }
}
