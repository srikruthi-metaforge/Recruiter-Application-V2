import React from 'react'
import type { ClientsVmState } from './useClientsPageState'
import { clientsService } from '../../../services/workspace.service'
import { apiErrorMessage } from './useClientsPageState'

export function useClientsPageHandlers(s: ClientsVmState) {
  const {
    setViewMode, newClientName,
    setNewClientName, newClientDomain, newPocName, setNewPocName,
    newPocDesignation, newPocEmail, setNewPocEmail, newPocPhone,
    setNewPocPhone, newSlaTAT, newAgreementDoc,
    showToast, editingClient, setEditingClient, isSaving, setIsSaving, reloadClients
  } = s

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName.trim() || !newPocName.trim()) {
      showToast('Client organization name and primary POC name are required.')
      return
    }

    if (isSaving) return
    setIsSaving(true)

    try {
      const slaDaysNum = parseFloat(newSlaTAT) || 3

      if (editingClient) {
        await clientsService.update(editingClient.id, {
          clientName: newClientName.trim(),
          domain: newClientDomain,
          slaDays: slaDaysNum,
          pocContacts: [
            {
              name: newPocName.trim(),
              email: newPocEmail.trim() || 'poc@client.com',
              phone: newPocPhone.trim() || '+91 98765 00000',
              designation: newPocDesignation.trim() || 'Primary Contact',
            },
          ],
          agreementsUrl: newAgreementDoc ? newAgreementDoc.name : undefined,
        })
        showToast(`Successfully updated client: ${newClientName.trim()}`)
      } else {
        await clientsService.create({
          clientName: newClientName.trim(),
          domain: newClientDomain,
          tier: 'Tier-1',
          status: 'Active',
          slaDays: slaDaysNum,
          pocContacts: [
            {
              name: newPocName.trim(),
              email: newPocEmail.trim() || 'poc@client.com',
              phone: newPocPhone.trim() || '+91 98765 00000',
              designation: newPocDesignation.trim() || 'Primary Contact',
            },
          ],
          agreementsUrl: newAgreementDoc ? newAgreementDoc.name : undefined,
        })
        showToast(`Successfully empaneled new client: ${newClientName.trim()}`)
      }

      await reloadClients()
      setEditingClient(null)
      setNewClientName('')
      setNewPocName('')
      setNewPocEmail('')
      setNewPocPhone('')
      setViewMode('list')
    } catch (err) {
      showToast(apiErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    handleAddClientSubmit
  }
}
