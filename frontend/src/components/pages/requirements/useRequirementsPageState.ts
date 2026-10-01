import type { RequirementsPageProps } from './preamble'
import { Requirement } from '../../../types'
import { CardFilterType } from '../../ui/RequirementCardsGrid'
import { useState, useMemo } from 'react'
import React from 'react'

export function useRequirementsPageState(props: RequirementsPageProps) {
  const {
  role = 'superadmin',
  requirements = [],
  submissions = [],
  interviews = [],
  recruiters = [],
  onOpenSubmit,
  onUpdateRequirements,
  onAddActivityLog,
  onNavigateToDashboard,
}: RequirementsPageProps = props as RequirementsPageProps & Record<string, never>
  // Local requirements state so assignments take immediate visual effect
  const [localRequirements, setLocalRequirements] = useState<Requirement[]>(requirements)

  React.useEffect(() => {
    setLocalRequirements(requirements)
  }, [requirements])

  // Selected requirement for detail overview screen
  const [selectedReqForDetail, setSelectedReqForDetail] = useState<Requirement | null>(null)

  // Create Job Demand state
  const [isCreatingDemand, setIsCreatingDemand] = useState(false)

  // Search and Filter states
  const [globalSearch, setGlobalSearch] = useState('')
  const [statusDropdown, setStatusDropdown] = useState<string>('Unassigned')
  const [clientDropdown, setClientDropdown] = useState<string>('All')


  // Selected card filter
  const [activeCardFilter, setActiveCardFilter] = useState<CardFilterType>('ALL')

  // Selected table rows
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(new Set())

  // Dynamic unique client list derived from local requirements
  const availableClients = useMemo(() => {
    const clientsSet = new Set<string>()
    localRequirements.forEach(r => {
      if (r.client) clientsSet.add(r.client)
    })
    return Array.from(clientsSet).sort()
  }, [localRequirements])

  // Assignment Modal & Toast State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // States for "Assign to recruiters" modal matching screenshot
  const [isAssignMyselfChecked, setIsAssignMyselfChecked] = useState(true)
  const [selectedRecruiterNames, setSelectedRecruiterNames] = useState<Set<string>>(new Set())
  const [recruiterSearchQuery, setRecruiterSearchQuery] = useState('')

  // Current logged in user name based on role (defaults to Harish Gadipally as shown in screenshot)
  const currentUserName = useMemo(() => {
    if (role === 'superadmin') return 'Harish Gadipally'
    if (role === 'admin') return 'Harish Gadipally'
    if (role === 'lead') return 'Sarah Kim'
    if (role === 'recruiter') return 'Harish Gadipally'
    return 'Harish Gadipally'
  }, [role])

  // List of recruiters matching screenshot (Showing 17 recruiters)
  const recruiterList = useMemo(() => {
    return [
      { id: '1', name: 'Adirala sathvika', email: 'No email' },
      { id: '2', name: 'Arvind GR', email: 'arvind.gr@metaforgeit.com' },
      { id: '3', name: 'Charlie Darwin', email: 'charlie@metaforgeit.com' },
      { id: '4', name: 'Harini Sindey', email: 'harini.s@metaforgeit.com' },
      { id: '5', name: 'Harish Gadipally', email: 'harish.g@metaforgeit.com' },
      { id: '6', name: 'Puttapaka Saiteja', email: 'saiteja.p@metaforgeit.com' },
      { id: '7', name: 'Kallol Chakraborty', email: 'kallol.c@ltts.com' },
      { id: '8', name: 'Marcus Chen', email: 'm.chen@talentflow.io' },
      { id: '9', name: 'Sarah Kim', email: 's.kim@talentflow.io' },
      { id: '10', name: 'David Park', email: 'd.park@talentflow.io' },
      { id: '11', name: 'Alex Turner', email: 'alex.t@dev.com' },
      { id: '12', name: 'Nina Brooks', email: 'n.brooks@talentflow.io' },
      { id: '13', name: 'Priya Sharma', email: 'priya.s@talentflow.io' },
      { id: '14', name: 'James O\'Brien', email: 'j.obrien@talentflow.io' },
      { id: '15', name: 'Carlos Rivera', email: 'c.rivera@talentflow.io' },
      { id: '16', name: 'Tejasree Chakravarthy', email: 'tejasree@metaforgeit.com' },
      { id: '17', name: 'Rahul Verma', email: 'rahul.v@metaforgeit.com' },
    ]
  }, [])

  // Filtered recruiter list based on search input
  const filteredRecruiterList = useMemo(() => {
    if (!recruiterSearchQuery.trim()) return recruiterList
    const q = recruiterSearchQuery.trim().toLowerCase()
    return recruiterList.filter(
      r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    )
  }, [recruiterList, recruiterSearchQuery])

  // Count total selected recruiters for footer button label
  const totalSelectedRecruitersCount = (isAssignMyselfChecked ? 1 : 0) + selectedRecruiterNames.size

  const toggleRecruiterSelection = (name: string) => {
    const next = new Set(selectedRecruiterNames)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    setSelectedRecruiterNames(next)
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Single Self Assign handler
  return {
    role,
    requirements,
    submissions,
    interviews,
    recruiters,
    onOpenSubmit,
    onUpdateRequirements,
    onAddActivityLog,
    onNavigateToDashboard,
    localRequirements,
    setLocalRequirements,
    selectedReqForDetail,
    setSelectedReqForDetail,
    isCreatingDemand,
    setIsCreatingDemand,
    globalSearch,
    setGlobalSearch,
    statusDropdown,
    setStatusDropdown,
    clientDropdown,
    setClientDropdown,
    activeCardFilter,
    setActiveCardFilter,
    selectedReqIds,
    setSelectedReqIds,
    isAssignModalOpen,
    setIsAssignModalOpen,
    toastMessage,
    setToastMessage,
    isAssignMyselfChecked,
    setIsAssignMyselfChecked,
    selectedRecruiterNames,
    setSelectedRecruiterNames,
    recruiterSearchQuery,
    setRecruiterSearchQuery,
    availableClients,
    currentUserName,
    recruiterList,
    filteredRecruiterList,
    totalSelectedRecruitersCount,
    toggleRecruiterSelection,
    showToast,
  }
}
export type RequirementsVmState = ReturnType<typeof useRequirementsPageState>
