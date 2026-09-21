import type { ClientGapAnalysisProps } from './preamble'
import { getClientGapAnalysisDataset, STANDARDIZED_DOMAINS_LIST } from './preamble'
import { useState, useMemo } from 'react'
import React from 'react'

export function useClientDeliveryGapState(props: ClientGapAnalysisProps) {
  const {
  clientName,
  clientDomain = 'Enterprise Engineering & Digital Services',
  pocName = 'Kallol Chakraborty',
  pocEmail = 'kallol.c@client.com',
  pocPhone = '+91 98765 11223',
  teamLead = 'Harish Gadipally',
  role = 'superadmin',
  initialDateRange = 'All Time',
  onBack,
  onSelectRequirement,
}: ClientGapAnalysisProps = props as ClientGapAnalysisProps & Record<string, never>
  // Filters State
  const [dateRange, setDateRange] = useState(initialDateRange || 'All Time')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomainFilter, setSelectedDomainFilter] = useState('All Domains')
  const [selectedSpocFilter, setSelectedSpocFilter] = useState('All SPOCs')
  const [selectedReqStatus, setSelectedReqStatus] = useState('All Statuses')
  const [selectedSubStatus, setSelectedSubStatus] = useState('All')
  const [selectedInterviewStatus, setSelectedInterviewStatus] = useState('All')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Section Toggle State (for collapsing sections to reduce scrolling)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    kpi: true,
    domainTable: true,
    domainCharts: true,
    spocTable: true,
    reqGaps: true,
  })
  const [activeTabSection, setActiveTabSection] = useState<string>('all')

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const expandAll = () => {
    setOpenSections({
      kpi: true,
      domainTable: true,
      domainCharts: true,
      spocTable: true,
      reqGaps: true,
    })
    setActiveTabSection('all')
    showToast('Expanded all sections.')
  }

  const collapseAll = () => {
    setOpenSections({
      kpi: false,
      domainTable: false,
      domainCharts: false,
      spocTable: false,
      reqGaps: false,
    })
    showToast('Collapsed all sections to reduce scrolling.')
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Load Dynamic Dataset for this particular client only
  const rawClientRequirements = useMemo(() => {
    return getClientGapAnalysisDataset(clientName, pocName)
  }, [clientName, pocName])

  // Filtered Requirements Dataset
  const filteredRequirements = useMemo(() => {
    return rawClientRequirements.filter(req => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = req.title.toLowerCase().includes(q)
        const matchId = req.id.toLowerCase().includes(q)
        const matchSpoc = req.spoc.toLowerCase().includes(q)
        if (!matchTitle && !matchId && !matchSpoc) return false
      }

      // Time Period Filter (Week / Month / Year / All Time)
      if (dateRange !== 'All Time' && dateRange !== 'All') {
        if (dateRange === 'This Week') {
          if (req.createdDate && req.createdDate < '2026-08-22') return false
        } else if (dateRange === 'This Month') {
          if (req.createdDate && !req.createdDate.includes('2026-08')) return false
        } else if (dateRange === 'This Year') {
          if (req.createdDate && !req.createdDate.includes('2026')) return false
        }
      }

      if (selectedDomainFilter !== 'All Domains' && req.domain !== selectedDomainFilter) {
        return false
      }
      if (selectedSpocFilter !== 'All SPOCs' && req.spoc !== selectedSpocFilter) {
        return false
      }
      if (selectedReqStatus !== 'All Statuses' && req.status !== selectedReqStatus) {
        return false
      }
      if (selectedSubStatus === 'Zero Submissions' && req.submissions > 0) {
        return false
      }
      if (selectedSubStatus === 'Has Submissions' && req.submissions === 0) {
        return false
      }
      if (selectedInterviewStatus === 'Final Selects' && !req.interviews.some(i => i.stage === 'Final Select')) {
        return false
      }
      if (selectedInterviewStatus === 'L1 Rejects' && !req.interviews.some(i => i.stage === 'L1 Reject')) {
        return false
      }
      if (selectedInterviewStatus === 'Awaiting/Pending' && !req.interviews.some(i => i.stage === 'Awaiting / Pending')) {
        return false
      }
      return true
    })
  }, [
    rawClientRequirements,
    searchQuery,
    dateRange,
    selectedDomainFilter,
    selectedSpocFilter,
    selectedReqStatus,
    selectedSubStatus,
    selectedInterviewStatus,
  ])

  // Requirement Gap Analysis Pagination State (10 items limit)
  const [gapCurrentPage, setGapCurrentPage] = useState(1)
  const [gapPageSize, setGapPageSize] = useState(10)

  const gapTotalPages = Math.ceil(filteredRequirements.length / gapPageSize) || 1

  const paginatedRequirements = useMemo(() => {
    const start = (gapCurrentPage - 1) * gapPageSize
    return filteredRequirements.slice(start, start + gapPageSize)
  }, [filteredRequirements, gapCurrentPage, gapPageSize])

  // Dynamic Metrics Calculations
  const metrics = useMemo(() => {
    const totalReqs = filteredRequirements.length
    let totalPositions = 0
    let totalSubmissions = 0
    let zeroSubReqs = 0
    let missingDomainReqs = 0
    let nonNumericPositions = 0

    let totalInterviews = 0
    let finalSelects = 0
    let l1Rejects = 0
    let awaitingPending = 0

    filteredRequirements.forEach(req => {
      if (typeof req.positions === 'number') {
        totalPositions += req.positions
      } else {
        nonNumericPositions++
      }

      totalSubmissions += req.submissions

      if (req.submissions === 0) {
        zeroSubReqs++
      }

      if (req.hasMissingDomain || req.domain === 'Other / Needs Validation') {
        missingDomainReqs++
      }

      req.interviews.forEach(inv => {
        totalInterviews++
        if (inv.stage === 'Final Select') finalSelects++
        else if (inv.stage === 'L1 Reject') l1Rejects++
        else if (inv.stage === 'Awaiting / Pending') awaitingPending++
      })
    })

    const coveragePct = totalPositions > 0 ? Math.round((totalSubmissions / totalPositions) * 100) : 0

    // Dynamic Client Health Status Calculation
    let healthStatus: 'Healthy' | 'Needs Attention' | 'Critical' = 'Healthy'
    if (coveragePct < 25 || zeroSubReqs > totalReqs * 0.35) {
      healthStatus = 'Critical'
    } else if (coveragePct < 45 || zeroSubReqs > totalReqs * 0.18) {
      healthStatus = 'Needs Attention'
    }

    return {
      totalReqs,
      totalPositions,
      totalSubmissions,
      coveragePct,
      zeroSubReqs,
      missingDomainReqs,
      nonNumericPositions,
      totalInterviews,
      finalSelects,
      l1Rejects,
      awaitingPending,
      healthStatus,
    }
  }, [filteredRequirements])

  // Dynamic Standardized Domain Analysis Table Data
  const domainAnalysisRows = useMemo(() => {
    const domainMap: Record<
      string,
      { reqs: number; positions: number; subs: number; zeroSubReqs: number }
    > = {}

    STANDARDIZED_DOMAINS_LIST.forEach(d => {
      domainMap[d] = { reqs: 0, positions: 0, subs: 0, zeroSubReqs: 0 }
    })

    filteredRequirements.forEach(req => {
      const d = STANDARDIZED_DOMAINS_LIST.includes(req.domain) ? req.domain : 'Other / Needs Validation'
      domainMap[d].reqs += 1
      if (typeof req.positions === 'number') {
        domainMap[d].positions += req.positions
      }
      domainMap[d].subs += req.submissions
      if (req.submissions === 0) {
        domainMap[d].zeroSubReqs += 1
      }
    })

    return STANDARDIZED_DOMAINS_LIST.map(domain => {
      const item = domainMap[domain]
      const coverage = item.positions > 0 ? Math.round((item.subs / item.positions) * 100) : 0
      return {
        domain,
        requirements: item.reqs,
        positions: item.positions,
        submissions: item.subs,
        coverage,
        zeroSubReqs: item.zeroSubReqs,
      }
    }).filter(row => row.requirements > 0 || row.positions > 0 || row.submissions > 0)
  }, [filteredRequirements])

  // Dynamic SPOC / Ownership Analysis Table Data
  const spocAnalysisRows = useMemo(() => {
    const spocMap: Record<
      string,
      { reqs: number; positions: number; subs: number; zeroSubReqs: number }
    > = {}

    filteredRequirements.forEach(req => {
      const spoc = req.spoc || 'Unassigned'
      if (!spocMap[spoc]) {
        spocMap[spoc] = { reqs: 0, positions: 0, subs: 0, zeroSubReqs: 0 }
      }
      spocMap[spoc].reqs += 1
      if (typeof req.positions === 'number') {
        spocMap[spoc].positions += req.positions
      }
      spocMap[spoc].subs += req.submissions
      if (req.submissions === 0) {
        spocMap[spoc].zeroSubReqs += 1
      }
    })

    return Object.keys(spocMap).map(spoc => {
      const item = spocMap[spoc]
      const coverage = item.positions > 0 ? Math.round((item.subs / item.positions) * 100) : 0
      return {
        spoc,
        requirements: item.reqs,
        positions: item.positions,
        submissions: item.subs,
        coverage,
        zeroSubReqs: item.zeroSubReqs,
      }
    })
  }, [filteredRequirements])

  // Recharts Data Mapping
  const domainChartData = useMemo(() => {
    return domainAnalysisRows.map(row => ({
      domainShort: row.domain.length > 18 ? row.domain.substring(0, 16) + '...' : row.domain,
      domainFull: row.domain,
      requirements: row.requirements,
      positions: row.positions,
      submissions: row.submissions,
      coverage: row.coverage,
      zeroSubReqs: row.zeroSubReqs,
    }))
  }, [domainAnalysisRows])

  // Extract unique SPOC list for filter
  const uniqueSpocList = useMemo(() => {
    const set = new Set<string>()
    rawClientRequirements.forEach(r => set.add(r.spoc))
    return Array.from(set)
  }, [rawClientRequirements])

  return {
    clientName,
    clientDomain,
    pocName,
    pocEmail,
    pocPhone,
    teamLead,
    role,
    initialDateRange,
    onBack,
    onSelectRequirement,
    dateRange,
    setDateRange,
    searchQuery,
    setSearchQuery,
    selectedDomainFilter,
    setSelectedDomainFilter,
    selectedSpocFilter,
    setSelectedSpocFilter,
    selectedReqStatus,
    setSelectedReqStatus,
    selectedSubStatus,
    setSelectedSubStatus,
    selectedInterviewStatus,
    setSelectedInterviewStatus,
    toastMsg,
    setToastMsg,
    openSections,
    setOpenSections,
    activeTabSection,
    setActiveTabSection,
    gapCurrentPage,
    setGapCurrentPage,
    gapPageSize,
    setGapPageSize,
    toggleSection,
    expandAll,
    collapseAll,
    showToast,
    rawClientRequirements,
    filteredRequirements,
    gapTotalPages,
    paginatedRequirements,
    metrics,
    domainAnalysisRows,
    spocAnalysisRows,
    domainChartData,
    uniqueSpocList,
  }
}
export type ClientGapVmState = ReturnType<typeof useClientDeliveryGapState>
