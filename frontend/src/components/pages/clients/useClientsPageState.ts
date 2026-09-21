import type { ClientsPageProps } from './preamble'
import { ClientRecord, INITIAL_CLIENTS } from './preamble'
import { getRequirementsForClient } from './preamble2'
import { useState, useMemo } from 'react'
import React from 'react'

export function useClientsPageState(props: ClientsPageProps) {
  const { role = 'superadmin' }: ClientsPageProps = props as ClientsPageProps & Record<string, never>
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS)
  const canAddClient = role !== 'admin'
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'view_agreement'>('list')
  const [selectedClientForAgreement, setSelectedClientForAgreement] = useState<ClientRecord | null>(null)
  const [selectedClientForGapAnalysis, setSelectedClientForGapAnalysis] = useState<ClientRecord | null>(null)
  const [selectedClientForReqsModal, setSelectedClientForReqsModal] = useState<ClientRecord | null>(null)
  const [reqsModalSearchQuery, setReqsModalSearchQuery] = useState('')
  const [reqsModalPriorityFilter, setReqsModalPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All')
  const [activeDropdownClientId, setActiveDropdownClientId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [domainFilter, setDomainFilter] = useState('All Domains')
  const [periodFilter, setPeriodFilter] = useState<'All Time' | 'This Week' | 'This Month' | 'This Year'>('All Time')

  // Dedicated Add Client Page Form State
  const [newClientName, setNewClientName] = useState('')
  const [newClientDomain, setNewClientDomain] = useState('Software & Cloud Services')
  const [newPocName, setNewPocName] = useState('')
  const [newPocDesignation, setNewPocDesignation] = useState('Procurement Manager')
  const [newPocEmail, setNewPocEmail] = useState('')
  const [newPocPhone, setNewPocPhone] = useState('')
  const [newLocation, setNewLocation] = useState('Bangalore / Remote')
  const [newCommercialFee, setNewCommercialFee] = useState('8.33% Annual CTC')
  const [newPaymentTerms, setNewPaymentTerms] = useState('30 Days Net')
  const [newSlaTAT, setNewSlaTAT] = useState('3.0 Days')
  const [newAgreementStartDate, setNewAgreementStartDate] = useState('2026-08-11')
  const [newAgreementEndDate, setNewAgreementEndDate] = useState('2029-08-10')
  const [newAgreementDoc, setNewAgreementDoc] = useState<File | null>(null)

  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (domainFilter !== 'All Domains' && c.domain !== domainFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.pocName.toLowerCase().includes(q) ||
          c.pocEmail.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [clients, searchQuery, domainFilter])

  // Filtered requirements for Client Requirements Breakdown Modal
  const filteredModalReqs = useMemo(() => {
    if (!selectedClientForReqsModal) return []
    const list = getRequirementsForClient(selectedClientForReqsModal)
    return list.filter(r => {
      if (reqsModalPriorityFilter !== 'All' && r.priority !== reqsModalPriorityFilter) {
        return false
      }
      if (reqsModalSearchQuery.trim()) {
        const q = reqsModalSearchQuery.toLowerCase()
        const matchTitle = r.title.toLowerCase().includes(q)
        const matchId = r.id.toLowerCase().includes(q)
        const matchRecruiter = r.assignedRecruiter.toLowerCase().includes(q)
        const matchStatus = r.status.toLowerCase().includes(q)
        if (!matchTitle && !matchId && !matchRecruiter && !matchStatus) return false
      }
      return true
    })
  }, [selectedClientForReqsModal, reqsModalSearchQuery, reqsModalPriorityFilter])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredClients.slice(start, start + pageSize)
  }, [filteredClients, currentPage, pageSize])

  // Open Full-Page Agreement View
  const openAgreementPage = (client: ClientRecord) => {
    setSelectedClientForAgreement(client)
    setViewMode('view_agreement')
  }

  // Handle Add Client Form Submit (Full Page Submission)
  return {
    role,
    clients,
    setClients,
    viewMode,
    setViewMode,
    selectedClientForAgreement,
    setSelectedClientForAgreement,
    selectedClientForGapAnalysis,
    setSelectedClientForGapAnalysis,
    selectedClientForReqsModal,
    setSelectedClientForReqsModal,
    reqsModalSearchQuery,
    setReqsModalSearchQuery,
    reqsModalPriorityFilter,
    setReqsModalPriorityFilter,
    activeDropdownClientId,
    setActiveDropdownClientId,
    searchQuery,
    setSearchQuery,
    domainFilter,
    setDomainFilter,
    periodFilter,
    setPeriodFilter,
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
    toastMsg,
    setToastMsg,
    currentPage,
    setCurrentPage,
    canAddClient,
    showToast,
    filteredClients,
    filteredModalReqs,
    pageSize,
    totalPages,
    paginatedClients,
    openAgreementPage,
  }
}
export type ClientsVmState = ReturnType<typeof useClientsPageState>
