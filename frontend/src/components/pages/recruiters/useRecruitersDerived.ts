import { useMemo } from 'react'
import { RecruiterOverviewItem } from './types'

export function useRecruitersDerived(
  recruitersList: RecruiterOverviewItem[],
  clientFilter: string,
  teamLeadFilter: string,
  searchQuery: string,
  sortBy: 'submissions' | 'tat' | 'reqs',
  currentPage: number,
  pageSize: number,
) {
  const uniqueClients = useMemo(() => {
    const clients = new Set<string>()
    recruitersList.forEach(r => r.clientNames.forEach(c => clients.add(c)))
    return Array.from(clients)
  }, [recruitersList])

  const uniqueTeamLeads = useMemo(() => {
    const leads = new Set<string>()
    recruitersList.forEach(r => leads.add(r.teamLead))
    return Array.from(leads)
  }, [recruitersList])

  const avgTatDays = useMemo(() => {
    const sum = recruitersList.reduce((acc, r) => acc + r.tatDays, 0)
    return (sum / recruitersList.length).toFixed(1)
  }, [recruitersList])

  const totalReqsHandled = useMemo(() => {
    return recruitersList.reduce((acc, r) => acc + r.totalRequirements, 0)
  }, [recruitersList])

  const totalSubmissionsSourced = useMemo(() => {
    return recruitersList.reduce((acc, r) => acc + r.totalSubmissions, 0)
  }, [recruitersList])

  const filteredRecruiters = useMemo(() => {
    let result = recruitersList.filter(r => {
      if (clientFilter !== 'All Clients' && !r.clientNames.includes(clientFilter)) return false
      if (teamLeadFilter !== 'All Team Leads' && r.teamLead !== teamLeadFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = r.name.toLowerCase().includes(q)
        const matchEmail = r.email.toLowerCase().includes(q)
        const matchLead = r.teamLead.toLowerCase().includes(q)
        const matchClient = r.clientNames.some(c => c.toLowerCase().includes(q))
        if (!matchName && !matchEmail && !matchLead && !matchClient) return false
      }

      return true
    })

    result.sort((a, b) => {
      if (sortBy === 'tat') return a.tatDays - b.tatDays
      if (sortBy === 'reqs') return b.totalRequirements - a.totalRequirements
      return b.totalSubmissions - a.totalSubmissions
    })

    return result
  }, [recruitersList, clientFilter, teamLeadFilter, searchQuery, sortBy])

  const paginatedRecruiters = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecruiters.slice(start, start + pageSize)
  }, [filteredRecruiters, currentPage, pageSize])

  const totalPages = Math.ceil(filteredRecruiters.length / pageSize) || 1

  return {
    uniqueClients,
    uniqueTeamLeads,
    avgTatDays,
    totalReqsHandled,
    totalSubmissionsSourced,
    filteredRecruiters,
    paginatedRecruiters,
    totalPages,
  }
}
