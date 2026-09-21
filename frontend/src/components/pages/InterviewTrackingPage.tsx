import React, { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Search,
  Filter,
  Video,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  X,
  UserCheck,
  UserX,
  MessageSquare,
  Building2,
  ExternalLink,
  ChevronRight,
  User,
  Star,
  FileText,
  Briefcase,
  AlertTriangle,
  Building,
  Users,
  ChevronLeft,
  Activity,
  CalendarRange,
  Laptop,
  Play,
  Send,
} from 'lucide-react'
import { Interview, Role, Requirement } from '../../types'
import { ScheduleInterviewModal } from '../modals/ScheduleInterviewModal'
import { RequirementDetailOverview } from './RequirementDetailOverview'
import { PaginationFooter } from '../ui/PaginationFooter'

export interface ScheduleRowItem {
  id: string
  candidateName: string
  position: string
  company: string
  round: string // 'L1' | 'Final'
  dateTime: string
  mode: string // 'Online' | 'In-Person'
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Scheduled'
  requirementId?: string
  teamLead?: string
  submittedBy?: string
}

export interface FinalDecisionRowItem {
  id: string
  candidateName: string
  requirementId: string
  requirement: string
  decision: 'Selected for Interview' | 'Rejected in Interview' | 'Pending'
  rejectionReason: string
  offerLetter: string
  client?: string
  teamLead?: string
  submittedBy?: string
}

export type RejectionStageType = 'Screening' | 'L1 Technical' | 'L2 Technical' | 'L3 / Manager' | 'Final HR Round'

export interface RejectedCandidateRowItem {
  id: string
  candidateName: string
  position: string
  company: string
  rejectedStage: RejectionStageType
  rejectionReason: string
  evaluatorNotes: string
  evaluatedBy: string
  submittedBy?: string
  teamLead?: string
  rejectionDate: string
  requirementId: string
  candidateId?: string
}

const DEFAULT_REJECTED_CANDIDATES: RejectedCandidateRowItem[] = [
  {
    id: 'rej-0',
    candidateName: 'Kunal Saxena',
    candidateId: 'CAND-18015',
    position: 'Cloud DevOps Architect',
    company: 'Accenture',
    rejectedStage: 'L2 Technical',
    rejectionReason: 'System architecture design score below threshold',
    evaluatorNotes: 'Candidate had good cloud basics but struggled with Kubernetes cluster failover scenario.',
    evaluatedBy: 'Harish Gadipally (Lead)',
    submittedBy: 'Harish Gadipally',
    teamLead: 'Harish Gadipally',
    rejectionDate: 'Aug 17, 2026',
    requirementId: 'REQ-2026-08-12-001',
  },
  {
    id: 'rej-1',
    candidateName: 'Sandeep Patil',
    candidateId: 'CAND-18012',
    position: 'PLM / PDM Lead Engineer',
    company: 'Accenture',
    rejectedStage: 'L1 Technical',
    rejectionReason: 'Technical evaluation score below threshold (C++ & PLM architecture round)',
    evaluatorNotes: 'Failed coding assessment on C++ memory management and CAD API integrations.',
    evaluatedBy: 'Rajesh V. (Tech Panel L1)',
    submittedBy: 'Suresh kulkarni',
    teamLead: 'Harish Gadipally',
    rejectionDate: 'Aug 16, 2026',
    requirementId: 'REQ-2026-08-12-004',
  },
  {
    id: 'rej-2',
    candidateName: 'Abhijit Narke',
    candidateId: 'CAND-18009',
    position: 'Java Lead Engineer',
    company: 'Goldman Sachs',
    rejectedStage: 'Screening',
    rejectionReason: 'Notice period exceeds 60 days budget limit',
    evaluatorNotes: 'Candidate serving 90 days notice period; client requires immediate joiner within 30 days.',
    evaluatedBy: 'Harish Gadipally (Lead)',
    submittedBy: 'Lingoji Pavani',
    teamLead: 'Tom Walsh',
    rejectionDate: 'Aug 14, 2026',
    requirementId: 'REQ-2026-08-06-005',
  },
  {
    id: 'rej-3',
    candidateName: 'Ben Wallace',
    candidateId: 'CAND-18007',
    position: 'Python ML Specialist',
    company: 'Tesla',
    rejectedStage: 'L3 / Manager',
    rejectionReason: 'Salary expectation exceeds approved budget for Senior Band',
    evaluatorNotes: 'Expected CTC is ₹38 LPA vs approved client band max of ₹28 LPA.',
    evaluatedBy: 'Sarah Jenkins (Director of AI)',
    submittedBy: 'Adirala sathvika',
    teamLead: 'Nina Brooks',
    rejectionDate: 'Aug 13, 2026',
    requirementId: 'REQ-2026-08-07-007',
  },
  {
    id: 'rej-4',
    candidateName: 'Rahul Deshmukh',
    candidateId: 'CAND-18005',
    position: 'Senior React Developer',
    company: 'Accenture',
    rejectedStage: 'L2 Technical',
    rejectionReason: 'State management & SSR architecture design score insufficient',
    evaluatorNotes: 'Struggled with Next.js SSR hydration and Redux Toolkit state normalization live coding exercise.',
    evaluatedBy: 'Amitabh Sen (Lead Architect)',
    submittedBy: 'Marcus Chen',
    teamLead: 'Harish Gadipally',
    rejectionDate: 'Aug 11, 2026',
    requirementId: 'REQ-2026-08-12-001',
  },
  {
    id: 'rej-5',
    candidateName: 'Neha Kulkarni',
    candidateId: 'CAND-18003',
    position: 'DevOps Lead Engineer',
    company: 'JP Morgan',
    rejectedStage: 'Final HR Round',
    rejectionReason: 'Shift timing availability mismatch & competing offer conflict',
    evaluatorNotes: 'Unavailable for mandatory US shift rotation schedule.',
    evaluatedBy: 'Ananya Roy (HR Business Partner)',
    submittedBy: 'Priya Sharma',
    teamLead: 'Tom Walsh',
    rejectionDate: 'Aug 09, 2026',
    requirementId: 'REQ-2026-08-12-003',
  },
  {
    id: 'rej-6',
    candidateName: 'Vikramaditya Sen',
    candidateId: 'CAND-18001',
    position: 'Automotive Embedded Engineer',
    company: 'Continental Automotive',
    rejectedStage: 'Screening',
    rejectionReason: 'Mandatory Catia V6 door closure design certification missing',
    evaluatorNotes: 'Failed initial JD screening checklist for Catia V6 packaging skills.',
    evaluatedBy: 'Marcus Chen (Recruiter)',
    submittedBy: 'Marcus Chen',
    teamLead: 'Harish Gadipally',
    rejectionDate: 'Aug 08, 2026',
    requirementId: 'REQ-2026-08-07-006',
  },
]

const DEFAULT_SCHEDULE_ROWS: ScheduleRowItem[] = [
  {
    id: '0',
    candidateName: 'Pradeep Kumar',
    position: 'Senior React / Fullstack Architect',
    company: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Harish Gadipally',
    round: 'L1 Technical',
    dateTime: 'Today, 12:00 PM',
    mode: 'Online',
    status: 'In Progress',
    requirementId: 'REQ-2026-08-12-001',
  },
  {
    id: '1',
    candidateName: 'Arpit Srivastav',
    position: 'Senior React Native Mobile Dev',
    company: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Marcus Chen',
    round: 'L2 Technical',
    dateTime: '2026-08-18 18:00',
    mode: 'Online',
    status: 'In Progress',
    requirementId: 'REQ-2026-08-12-002',
  },
  {
    id: '2',
    candidateName: 'Vidyasagar Gade',
    position: 'Cloud Solutions Architect',
    company: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Priya Sharma',
    round: 'Final HR Round (All Rounds Completed)',
    dateTime: '2026-08-19 14:00',
    mode: 'Online',
    status: 'Completed',
    requirementId: 'REQ-2026-08-12-003',
  },
  {
    id: '3',
    candidateName: 'Siddharth Rao',
    position: 'PLM / PDM Lead Engineer',
    company: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Suresh kulkarni',
    round: 'L1 Technical',
    dateTime: '2026-08-19 10:00',
    mode: 'Online',
    status: 'In Progress',
    requirementId: 'REQ-2026-08-12-004',
  },
  {
    id: '4',
    candidateName: 'Alex Turner',
    position: 'Lead Java Engineer',
    company: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Marcus Chen',
    round: 'Technical Round 1',
    dateTime: '2026-08-20 13:06',
    mode: 'Online',
    status: 'Upcoming',
    requirementId: 'REQ-2026-08-12-005',
  },
  {
    id: '5',
    candidateName: 'Kanchan Meshram',
    position: 'AI Solutions Specialist',
    company: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Priya Sharma',
    round: 'Technical Round 2',
    dateTime: '2026-08-20 11:45',
    mode: 'Online',
    status: 'In Progress',
    requirementId: 'REQ-2026-08-12-006',
  },
  {
    id: '6',
    candidateName: 'Rania Khalil',
    position: 'Java Architect',
    company: 'Goldman Sachs',
    teamLead: 'Tom Walsh',
    submittedBy: 'lakshmi.v Recruiter',
    round: 'Manager Round',
    dateTime: 'Aug 06, 02:00 PM',
    mode: 'Online',
    status: 'In Progress',
    requirementId: 'REQ-2026-08-06-005',
  },
  {
    id: '7',
    candidateName: 'Ben Wallace',
    position: 'Python ML Engineer',
    company: 'Tesla',
    teamLead: 'Nina Brooks',
    submittedBy: 'Recruiter',
    round: 'Screening',
    dateTime: 'Aug 07, 11:00 AM',
    mode: 'Online',
    status: 'In Progress',
    requirementId: 'REQ-2026-08-07-006',
  },
  {
    id: '8',
    candidateName: 'Pritish Malik',
    position: 'C# Automation - Bangalore/Mysore',
    company: 'LTTS / L&T',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Harish Gadipally',
    round: 'L3 / Final Round (Offer Released)',
    dateTime: 'Today, 02:30 PM',
    mode: 'Online',
    status: 'Completed',
    requirementId: 'REQ-003',
  },
  {
    id: '9',
    candidateName: 'Ananya Deshmukh',
    position: 'Senior Data Scientist',
    company: 'Microsoft',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Harish Gadipally',
    round: 'Final HR Round (All Rounds Completed)',
    dateTime: 'Aug 21, 11:00 AM',
    mode: 'Online',
    status: 'Completed',
    requirementId: 'REQ-004',
  },
  {
    id: '10',
    candidateName: 'Rajesh Verma',
    position: 'Salesforce Admin',
    company: 'Deloitte',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Harish Gadipally',
    round: 'L2 Technical Evaluation',
    dateTime: 'Aug 21, 03:00 PM',
    mode: 'Online',
    status: 'In Progress',
    requirementId: 'REQ-005',
  },
]

export interface OfferLetterRowItem {
  id: string
  candidateName: string
  position: string
  client: string
  requirementId: string
  offerDate: string
  offeredCTC: string
  joiningDate?: string
  status: 'Offer Released' | 'Accepted' | 'Joined' | 'Not Joined' | 'Declined'
  declineReason?: string
  notJoinedReason?: string
  notJoinedNote?: string
  notJoinedDate?: string
  submittedBy?: string
}

const DEFAULT_OFFER_LETTERS: OfferLetterRowItem[] = [
  {
    id: 'off-1',
    candidateName: 'Pritish Malik',
    position: 'C# Automation - Bangalore/Mysore',
    client: 'LTTS / L&T',
    requirementId: 'REQ-003',
    offerDate: 'Aug 19, 2026',
    offeredCTC: '₹22,00,000 PA',
    joiningDate: 'Sep 01, 2026',
    status: 'Offer Released',
    submittedBy: 'Marcus Chen',
  },
  {
    id: 'off-2',
    candidateName: 'Vidyasagar Gade',
    position: 'Cloud Solutions Architect',
    client: 'Accenture',
    requirementId: 'REQ-2026-08-12-003',
    offerDate: 'Aug 18, 2026',
    offeredCTC: '₹34,00,000 PA',
    joiningDate: 'Sep 15, 2026',
    status: 'Accepted',
    submittedBy: 'Harish Gadipally',
  },
  {
    id: 'off-3',
    candidateName: 'Arpit Srivastav',
    position: 'Senior React Native Dev',
    client: 'Accenture',
    requirementId: 'REQ-2026-08-12-002',
    offerDate: 'Aug 15, 2026',
    offeredCTC: '₹26,00,000 PA',
    joiningDate: 'Aug 25, 2026',
    status: 'Joined',
    submittedBy: 'Priya Sharma',
  },
  {
    id: 'off-4',
    candidateName: 'Kanchan Meshram',
    position: 'AI Solutions Specialist',
    client: 'Continental Automotive',
    requirementId: 'REQ-2026-08-12-006',
    offerDate: 'Aug 12, 2026',
    offeredCTC: '₹28,00,000 PA',
    status: 'Not Joined',
    notJoinedReason: 'Competing offer with higher compensation',
    notJoinedNote: 'Candidate accepted competing offer from Microsoft with ₹34 LPA CTC (20% higher than approved client CTC).',
    notJoinedDate: 'Aug 22, 2026',
    submittedBy: 'Marcus Chen',
  },
  {
    id: 'off-5',
    candidateName: 'Rohan Patil',
    position: 'Java Lead Architect',
    client: 'Goldman Sachs',
    requirementId: 'REQ-2026-08-06-005',
    offerDate: 'Aug 10, 2026',
    offeredCTC: '₹36,00,000 PA',
    status: 'Not Joined',
    notJoinedReason: 'Counter offer from current employer',
    notJoinedNote: 'Employer promoted candidate to Technical Director with retention bonus and matching CTC; candidate withdrew joining commitment.',
    notJoinedDate: 'Aug 20, 2026',
    submittedBy: 'Lingoji Pavani',
  },
  {
    id: 'off-6',
    candidateName: 'Meera Deshmukh',
    position: 'DevOps & Kubernetes Lead',
    client: 'Deloitte',
    requirementId: 'REQ-2026-08-07-009',
    offerDate: 'Aug 05, 2026',
    offeredCTC: '₹30,00,000 PA',
    joiningDate: 'Aug 18, 2026',
    status: 'Joined',
    submittedBy: 'Harish Gadipally',
  },
]

const DEFAULT_FINAL_DECISIONS: FinalDecisionRowItem[] = [
  {
    id: 'fd-1',
    candidateName: 'Abhijit Narke',
    requirementId: 'REQ-2026-08-12-001',
    requirement: 'Senior React / Fullstack Architect for Accenture',
    decision: 'Selected for Interview',
    rejectionReason: '—',
    offerLetter: '—',
    client: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Marcus Chen',
  },
  {
    id: 'fd-2',
    candidateName: 'Kiran Shantaram More',
    requirementId: 'REQ-2026-08-12-002',
    requirement: 'Senior React Native Mobile Dev for Accenture',
    decision: 'Selected for Interview',
    rejectionReason: '—',
    offerLetter: '—',
    client: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Priya Sharma',
  },
  {
    id: 'fd-3',
    candidateName: 'Vidyasagar Gade',
    requirementId: 'REQ-2026-08-12-003',
    requirement: 'Cloud Solutions Architect for Accenture',
    decision: 'Selected for Interview',
    rejectionReason: '—',
    offerLetter: '—',
    client: 'Accenture',
    teamLead: 'Harish Gadipally',
    submittedBy: 'Harish Gadipally',
  },
]

interface InterviewTrackingPageProps {
  role?: Role
  interviews?: Interview[]
  onOpenFeedbackModal?: (iv: Interview) => void
}

export function InterviewTrackingPage({
  role = 'recruiter',
  interviews,
  onOpenFeedbackModal,
}: InterviewTrackingPageProps) {
  const normalizedRole = (role || '').toLowerCase()
  const isLead = normalizedRole === 'lead'
  const isRecruiter = normalizedRole === 'recruiter'

  // Scope filter for Team Lead: 'my_interviews' (lead only), 'team_members' (members only), 'all' (members + lead)
  const [scopeTab, setScopeTab] = useState<'my_interviews' | 'team_members' | 'all'>('my_interviews')

  // Toggle Switcher ('upcoming' | 'in_progress' | 'completed' | 'rejections' | 'all' | 'onboarding')
  const [statusToggle, setStatusToggle] = useState<'upcoming' | 'in_progress' | 'completed' | 'rejections' | 'all' | 'onboarding'>('all')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'today' | 'this_week' | 'this_month' | 'custom_range'>('this_month')
  const [clientFilter, setClientFilter] = useState('All Clients')
  const [roundFilter, setRoundFilter] = useState('All Rounds')
  const [rejectionStageFilter, setRejectionStageFilter] = useState<string>('All Stages')

  // Tables State
  const [scheduleList, setScheduleList] = useState<ScheduleRowItem[]>(DEFAULT_SCHEDULE_ROWS)
  const [finalDecisions, setFinalDecisions] = useState<FinalDecisionRowItem[]>(DEFAULT_FINAL_DECISIONS)
  const [offerLetters, setOfferLetters] = useState<OfferLetterRowItem[]>(DEFAULT_OFFER_LETTERS)
  const [rejectedList, setRejectedList] = useState<RejectedCandidateRowItem[]>(DEFAULT_REJECTED_CANDIDATES)

  // Modals & Requirement Overview State
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [calendarStateFilter, setCalendarStateFilter] = useState<'all' | 'Upcoming' | 'In Progress' | 'Completed'>('all')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleRowItem | null>(null)
  const [remindModalCandidate, setRemindModalCandidate] = useState<ScheduleRowItem | null>(null)
  const [rejectModalCandidate, setRejectModalCandidate] = useState<ScheduleRowItem | null>(null)
  const [selectedRejectionReason, setSelectedRejectionReason] = useState<string>('Technical evaluation score below threshold')
  const [selectedRejectionStage, setSelectedRejectionStage] = useState<RejectionStageType>('L1 Technical')
  const [customRejectionNote, setCustomRejectionNote] = useState<string>('')
  const [selectedReqDetail, setSelectedReqDetail] = useState<Requirement | null>(null)
  const [selectedRejectedCandidateModal, setSelectedRejectedCandidateModal] = useState<RejectedCandidateRowItem | null>(null)

  // Onboarding & Offer Outcome State
  const [offerOutcomeFilter, setOfferOutcomeFilter] = useState<'all' | 'joined' | 'not_joined' | 'pending'>('all')
  const [notJoinedModalCandidate, setNotJoinedModalCandidate] = useState<OfferLetterRowItem | null>(null)
  const [selectedNotJoinedReason, setSelectedNotJoinedReason] = useState<string>('Competing offer with higher compensation')
  const [notJoinedCustomNote, setNotJoinedCustomNote] = useState<string>('')
  const [viewNotJoinedDetailModal, setViewNotJoinedDetailModal] = useState<OfferLetterRowItem | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleOpenReqOverview = (reqId: string, position: string, company: string) => {
    setSelectedReqDetail({
      id: reqId,
      title: position,
      client: company,
      company: company,
      status: 'Open',
      createdDate: '12 Aug 2026',
      submissionsCount: 4,
      interviewsCount: 2,
      owner: 'Harish Gadipally',
      assignedRecruiter: 'Harish Gadipally',
      experienceRequired: '5 - 8 Years',
      location: 'Hyderabad / Remote',
      salaryRange: '₹18 - ₹24 LPA',
      skills: ['React.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
      description: `Requirement details for ${position} at ${company}. Full job overview, candidate pipeline, and interview history.`,
    } as any)
  }

  // Map passed interviews prop into ScheduleRowItems
  const mappedPropInterviews: ScheduleRowItem[] = useMemo(() => {
    if (interviews && interviews.length > 0) {
      return interviews.map((iv, idx) => {
        const sStr = (iv.status as string) || ''
        const isUpcoming = sStr === 'Confirmed' || sStr === 'Scheduled'
        const isCompleted = sStr === 'Passed' || sStr === 'Completed' || sStr === 'Rejected'
        const isInProgress = sStr === 'In Progress' || sStr === 'Pending'

        const mappedStatus: 'Upcoming' | 'In Progress' | 'Completed' = isUpcoming
          ? 'Upcoming'
          : isCompleted
          ? 'Completed'
          : isInProgress
          ? 'In Progress'
          : 'Upcoming'

        return {
          id: iv.id || `prop-iv-${idx}`,
          candidateName: iv.candidate,
          position: iv.position,
          company: iv.client,
          round: iv.stage || 'L1',
          dateTime: iv.date || 'Aug 06, 10:00 AM',
          mode: 'Online',
          status: mappedStatus,
          requirementId: `REQ-2026-0${idx + 1}`,
        }
      })
    }
    return []
  }, [interviews])

  // Combine state scheduleList with mappedPropInterviews
  const combinedScheduleList = useMemo(() => {
    const existingIds = new Set(scheduleList.map(s => s.id))
    const extras = mappedPropInterviews.filter(m => !existingIds.has(m.id))
    return [...scheduleList, ...extras]
  }, [scheduleList, mappedPropInterviews])

  // Scope interviews data by role (single recruiter vs team lead scope)
  const scopeScheduleList = useMemo(() => {
    if (isLead) {
      return combinedScheduleList.filter(s => {
        const by = (s.submittedBy || '').toLowerCase()
        const isLeadSub = by.includes('harish') || by.includes('lead')
        if (scopeTab === 'my_interviews') return isLeadSub
        if (scopeTab === 'team_members') return !isLeadSub
        return true
      })
    }
    if (isRecruiter) {
      return combinedScheduleList.filter(s => {
        const by = (s.submittedBy || '').toLowerCase()
        return by.includes('marcus') || by.includes('recruiter') || by === ''
      })
    }
    return combinedScheduleList
  }, [combinedScheduleList, isLead, isRecruiter, scopeTab])

  // Scope offer letters by role
  const scopeOfferLetters = useMemo(() => {
    if (isLead) {
      return offerLetters.filter(o => {
        const by = ((o as any).submittedBy || '').toLowerCase()
        const isLeadSub = by.includes('harish') || by.includes('lead')
        if (scopeTab === 'my_interviews') return isLeadSub
        if (scopeTab === 'team_members') return !isLeadSub
        return true
      })
    }
    if (isRecruiter) {
      return offerLetters.filter(o => {
        const by = ((o as any).submittedBy || '').toLowerCase()
        return by.includes('marcus') || by.includes('recruiter') || by === ''
      })
    }
    return offerLetters
  }, [offerLetters, isLead, isRecruiter, scopeTab])

  // Filter offer letters by outcome filter & search query
  const filteredOfferLetters = useMemo(() => {
    return scopeOfferLetters.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = item.candidateName.toLowerCase().includes(q)
        const matchPos = item.position.toLowerCase().includes(q)
        const matchComp = item.client.toLowerCase().includes(q)
        const matchNote = (item.notJoinedNote || '').toLowerCase().includes(q)
        const matchReason = (item.notJoinedReason || item.declineReason || '').toLowerCase().includes(q)
        if (!matchName && !matchPos && !matchComp && !matchNote && !matchReason) return false
      }

      if (clientFilter !== 'All Clients' && item.client !== clientFilter) {
        return false
      }

      if (offerOutcomeFilter === 'joined') {
        return item.status === 'Joined'
      }
      if (offerOutcomeFilter === 'not_joined') {
        return item.status === 'Not Joined' || item.status === 'Declined'
      }
      if (offerOutcomeFilter === 'pending') {
        return item.status === 'Offer Released' || item.status === 'Accepted'
      }

      return true
    })
  }, [scopeOfferLetters, searchQuery, clientFilter, offerOutcomeFilter])

  // Scope final decisions by role
  const scopeFinalDecisions = useMemo(() => {
    if (isLead) {
      return finalDecisions.filter(d => {
        const by = (d.submittedBy || '').toLowerCase()
        const isLeadSub = by.includes('harish') || by.includes('lead')
        if (scopeTab === 'my_interviews') return isLeadSub
        if (scopeTab === 'team_members') return !isLeadSub
        return true
      })
    }
    if (isRecruiter) {
      return finalDecisions.filter(d => {
        const by = (d.submittedBy || '').toLowerCase()
        return by.includes('marcus') || by.includes('recruiter') || by === ''
      })
    }
    return finalDecisions
  }, [finalDecisions, isLead, isRecruiter, scopeTab])

  // Evaluated Schedule List:
  // 1. Scheduled in future -> Upcoming
  // 2. Intermediate rounds (L1, L2, Screening, Tech 1/2) -> In Progress
  // 3. Completed all rounds (L3, Final Round, Final HR, Offer Released) -> Completed
  const evaluatedScheduleList = useMemo(() => {
    const now = new Date()

    return scopeScheduleList.map(row => {
      const roundLower = (row.round || '').toLowerCase()

      // Check if all rounds are completed (L3, Final, HR Round, Offer Released, Cleared All Rounds)
      const isCompletedAllRounds =
        roundLower.includes('l3') ||
        roundLower.includes('final') ||
        roundLower.includes('offer released') ||
        roundLower.includes('completed all')

      // Check if intermediate round (L1, L2, Screening, Technical Round 1, Technical Round 2)
      const isIntermediateRound =
        roundLower.includes('l1') ||
        roundLower.includes('l2') ||
        roundLower.includes('screening') ||
        roundLower.includes('technical round 1') ||
        roundLower.includes('technical round 2') ||
        roundLower.includes('evaluation')

      // If round explicitly indicates all rounds finished OR explicitly marked Completed for non-intermediate round
      if (isCompletedAllRounds || (row.status === 'Completed' && !isIntermediateRound)) {
        return { ...row, status: 'Completed' as const }
      }

      // If intermediate round, keep as In Progress (or Upcoming if explicitly scheduled in future)
      if (isIntermediateRound) {
        if (row.status === 'Upcoming') {
          const timeStr = row.dateTime || ''
          if (timeStr.toLowerCase().includes('today')) {
            const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
            if (match) {
              let hour = parseInt(match[1], 10)
              const min = parseInt(match[2], 10)
              const ampm = match[3].toUpperCase()
              if (ampm === 'PM' && hour < 12) hour += 12
              if (ampm === 'AM' && hour === 12) hour = 0

              const schedTime = new Date()
              schedTime.setHours(hour, min, 0, 0)

              if (now >= schedTime) {
                return { ...row, status: 'In Progress' as const }
              }
            }
          }
          return { ...row, status: 'Upcoming' as const }
        }
        return { ...row, status: 'In Progress' as const }
      }

      if (
        row.status === 'Completed' ||
        (row.status as string) === 'Selected' ||
        (row.status as string) === 'Rejected'
      ) {
        return { ...row, status: 'Completed' as const }
      }

      if (row.status === 'In Progress') {
        return { ...row, status: 'In Progress' as const }
      }

      return { ...row, status: 'Upcoming' as const }
    })
  }, [scopeScheduleList])

  // Filter Schedule Rows according to selected statusToggle, searchQuery, clientFilter, and roundFilter
  const filteredScheduleList = useMemo(() => {
    return evaluatedScheduleList.filter(row => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = row.candidateName.toLowerCase().includes(q)
        const matchPos = row.position.toLowerCase().includes(q)
        const matchComp = row.company.toLowerCase().includes(q)
        const matchRound = row.round.toLowerCase().includes(q)
        if (!matchName && !matchPos && !matchComp && !matchRound) return false
      }

      if (clientFilter !== 'All Clients' && row.company !== clientFilter) {
        return false
      }

      if (roundFilter !== 'All Rounds' && !row.round.toLowerCase().includes(roundFilter.toLowerCase())) {
        return false
      }

      if (statusToggle === 'upcoming') {
        return (row.status as string) === 'Upcoming' || (row.status as string) === 'Scheduled'
      }
      if (statusToggle === 'in_progress') {
        return row.status === 'In Progress'
      }
      if (statusToggle === 'completed') {
        return row.status === 'Completed'
      }
      return true
    })
  }, [evaluatedScheduleList, searchQuery, statusToggle, clientFilter, roundFilter])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const totalPages = Math.ceil(filteredScheduleList.length / pageSize) || 1

  const paginatedScheduleList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredScheduleList.slice(start, start + pageSize)
  }, [filteredScheduleList, currentPage, pageSize])

  const getRoundBadgeStyle = (round: string) => {
    const r = round.toLowerCase()
    if (r.includes('l1') || r.includes('screening') || r.includes('l2') || r.includes('technical')) {
      return 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return 'bg-slate-100 text-slate-800 border-slate-200'
  }

  // Scope rejected list by role
  const scopeRejectedList = useMemo(() => {
    if (isLead) {
      return rejectedList.filter(r => {
        const by = (r.submittedBy || '').toLowerCase()
        const isLeadSub = by.includes('harish') || by.includes('lead')
        if (scopeTab === 'my_interviews') return isLeadSub
        if (scopeTab === 'team_members') return !isLeadSub
        return true
      })
    }
    if (isRecruiter) {
      return rejectedList.filter(r => {
        const by = (r.submittedBy || '').toLowerCase()
        return by.includes('marcus') || by.includes('recruiter') || by === ''
      })
    }
    return rejectedList
  }, [rejectedList, isLead, isRecruiter, scopeTab])

  const filteredRejectedList = useMemo(() => {
    return scopeRejectedList.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = item.candidateName.toLowerCase().includes(q)
        const matchPos = item.position.toLowerCase().includes(q)
        const matchComp = item.company.toLowerCase().includes(q)
        const matchStage = item.rejectedStage.toLowerCase().includes(q)
        const matchReason = item.rejectionReason.toLowerCase().includes(q)
        if (!matchName && !matchPos && !matchComp && !matchStage && !matchReason) return false
      }

      if (clientFilter !== 'All Clients' && item.company !== clientFilter) {
        return false
      }

      if (rejectionStageFilter !== 'All Stages' && item.rejectedStage !== rejectionStageFilter) {
        return false
      }

      return true
    })
  }, [scopeRejectedList, searchQuery, clientFilter, rejectionStageFilter])

  const rejectedTotalPages = Math.ceil(filteredRejectedList.length / pageSize) || 1

  const paginatedRejectedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRejectedList.slice(start, start + pageSize)
  }, [filteredRejectedList, currentPage, pageSize])

  const getRejectionStageBadgeStyle = (stage: RejectionStageType) => {
    switch (stage) {
      case 'L1 Technical':
      case 'L2 Technical':
      case 'Final HR Round':
        return 'bg-purple-100 text-purple-900 border-purple-200 font-bold'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 font-bold'
    }
  }

  // Move Upcoming Interview to In Progress
  const handleShiftToInProgress = (id: string, candidateName: string) => {
    setScheduleList(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'In Progress' } : item))
    )
    showToast(`Interview for ${candidateName} shifted to In Progress`)
  }

  // Action in In Progress: Select in Interview
  const handleSelectInInterview = (row: ScheduleRowItem) => {
    const roundLower = (row.round || '').toLowerCase()

    if (roundLower.includes('l1') || roundLower.includes('screening')) {
      // Advance candidate from L1 to L2 Technical (remains In Progress)
      setScheduleList(prev =>
        prev.map(item =>
          item.id === row.id
            ? { ...item, round: 'L2 Technical', status: 'In Progress' }
            : item
        )
      )
      showToast(`${row.candidateName} cleared L1! Advanced to L2 Technical (In Progress).`)
    } else if (roundLower.includes('l2') || roundLower.includes('technical round 2')) {
      // Advance candidate from L2 to L3 / Final Round (remains In Progress until completed)
      setScheduleList(prev =>
        prev.map(item =>
          item.id === row.id
            ? { ...item, round: 'L3 / Final Round', status: 'In Progress' }
            : item
        )
      )
      showToast(`${row.candidateName} cleared L2! Advanced to L3 / Final Round (In Progress).`)
    } else {
      // Completed all rounds (L3 / Final Round / Final HR)
      setScheduleList(prev =>
        prev.map(item =>
          item.id === row.id
            ? { ...item, round: `${row.round} (All Rounds Completed)`, status: 'Completed' }
            : item
        )
      )
      setFinalDecisions(prev => [
        {
          id: `fd-${Date.now()}`,
          candidateName: row.candidateName,
          requirementId: row.requirementId || 'REQ-2026-08-12-001',
          requirement: `${row.position} for ${row.company}`,
          decision: 'Selected for Interview',
          rejectionReason: '—',
          offerLetter: '—',
        },
        ...prev,
      ])
      showToast(`${row.candidateName} completed all interview rounds! Moved to Completed tab.`)
    }
  }

  // Action in In Progress: Open Rejection Reason Modal
  const handleRejectInInterview = (row: ScheduleRowItem) => {
    setSelectedRejectionReason('Technical evaluation score below threshold')
    let initialStage: RejectionStageType = 'L1 Technical'
    const r = (row.round || '').toLowerCase()
    if (r.includes('screening')) initialStage = 'Screening'
    else if (r.includes('l1')) initialStage = 'L1 Technical'
    else if (r.includes('l2')) initialStage = 'L2 Technical'
    else if (r.includes('l3') || r.includes('manager')) initialStage = 'L3 / Manager'
    else if (r.includes('final') || r.includes('hr')) initialStage = 'Final HR Round'

    setSelectedRejectionStage(initialStage)
    setCustomRejectionNote('')
    setRejectModalCandidate(row)
  }

  // Confirm and save rejection with reason
  const handleConfirmRejectCandidate = () => {
    if (!rejectModalCandidate) return
    const finalReason = selectedRejectionReason === 'Other' && customRejectionNote.trim()
      ? customRejectionNote.trim()
      : selectedRejectionReason

    setScheduleList(prev =>
      prev.map(item => (item.id === rejectModalCandidate.id ? { ...item, status: 'Completed' } : item))
    )
    setFinalDecisions(prev => [
      {
        id: `fd-${Date.now()}`,
        candidateName: rejectModalCandidate.candidateName,
        requirementId: rejectModalCandidate.requirementId || 'REQ-2026-08-12-001',
        requirement: `${rejectModalCandidate.position} for ${rejectModalCandidate.company}`,
        decision: 'Rejected in Interview',
        rejectionReason: `${selectedRejectionStage}: ${finalReason}`,
        offerLetter: '—',
      },
      ...prev,
    ])

    const newRejectedItem: RejectedCandidateRowItem = {
      id: `rej-${Date.now()}`,
      candidateName: rejectModalCandidate.candidateName,
      candidateId: `CAND-${Math.floor(Math.random() * 9000 + 10000)}`,
      position: rejectModalCandidate.position,
      company: rejectModalCandidate.company,
      rejectedStage: selectedRejectionStage,
      rejectionReason: finalReason,
      evaluatorNotes: customRejectionNote.trim() || `Candidate rejected during ${selectedRejectionStage} evaluation.`,
      evaluatedBy: rejectModalCandidate.submittedBy || 'Tech Evaluation Panel',
      submittedBy: rejectModalCandidate.submittedBy || 'Recruiter',
      teamLead: rejectModalCandidate.teamLead || 'Harish Gadipally',
      rejectionDate: 'Today',
      requirementId: rejectModalCandidate.requirementId || 'REQ-2026-08-12-001',
    }

    setRejectedList(prev => [newRejectedItem, ...prev])
    showToast(`Rejection recorded for ${rejectModalCandidate.candidateName} at stage [${selectedRejectionStage}]: "${finalReason}"!`)
    setRejectModalCandidate(null)
    setCustomRejectionNote('')
  }

  const handleDeleteSchedule = (id: string) => {
    setScheduleList(prev => prev.filter(item => item.id !== id))
    showToast('Interview schedule record deleted')
  }

  const handleUpdateDecision = (id: string, decision: 'Selected for Interview' | 'Rejected in Interview') => {
    setFinalDecisions(prev =>
      prev.map(item => (item.id === id ? { ...item, decision } : item))
    )
    showToast(`Final decision updated to ${decision}`)
  }

  const handleOpenNotJoinedModal = (candidate: OfferLetterRowItem) => {
    setNotJoinedModalCandidate(candidate)
    setSelectedNotJoinedReason(candidate.notJoinedReason || 'Competing offer with higher compensation')
    setNotJoinedCustomNote(candidate.notJoinedNote || '')
  }

  const handleSaveNotJoinedRecord = () => {
    if (!notJoinedModalCandidate) return

    setOfferLetters(prev =>
      prev.map(item =>
        item.id === notJoinedModalCandidate.id
          ? {
              ...item,
              status: 'Not Joined',
              notJoinedReason: selectedNotJoinedReason,
              notJoinedNote: notJoinedCustomNote.trim() || `Candidate backed out / did not join: ${selectedNotJoinedReason}`,
              notJoinedDate: 'Today',
            }
          : item
      )
    )

    showToast(`Non-joining record and note saved for candidate ${notJoinedModalCandidate.candidateName}!`)
    setNotJoinedModalCandidate(null)
    setNotJoinedCustomNote('')
  }

  if (selectedReqDetail) {
    return (
      <RequirementDetailOverview
        requirement={selectedReqDetail}
        role={role}
        onBack={() => setSelectedReqDetail(null)}
      />
    )
  }

  return (
    <div className="space-y-6 w-full pb-20 font-sans text-slate-800 animate-in fade-in duration-200">
      {/* 1. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track upcoming interviews, in-progress sessions, final decisions, and offer letters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCalendarModalOpen(true)}
            className="px-4 py-2.5 bg-[#6B3BF6] hover:bg-[#5B2DF0] text-white rounded-2xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <CalendarIcon className="w-4 h-4 text-white" />
            <span>Open Interview Calendar View</span>
          </button>
        </div>
      </div>

      {/* 2. TEAM LEAD INTERVIEW SCOPE TOGGLE (Only shown for Team Lead role) */}
      {isLead && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 px-3 py-1 rounded-lg">
              Team Lead Interview Scope
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setScopeTab('my_interviews')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                scopeTab === 'my_interviews'
                  ? 'bg-[#6B3BF6] text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>My Individual Candidates Interviews (Team Lead)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScopeTab('team_members')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                scopeTab === 'team_members'
                  ? 'bg-[#6B3BF6] text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team Members Candidates Interviews</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScopeTab('all')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                scopeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>All Candidates Interviews (Lead + Team)</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. FRONT CONTROLS & FILTER BAR (MOVED TO FRONT) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        {/* ROW 1: STATUS TOGGLE PILLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => {
                setStatusToggle('all')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                statusToggle === 'all'
                  ? 'bg-slate-900 text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Interviews</span>
            </button>

            <button
              onClick={() => {
                setStatusToggle('upcoming')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                statusToggle === 'upcoming'
                  ? 'bg-[#6B3BF6] text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Upcoming</span>
            </button>

            <button
              onClick={() => {
                setStatusToggle('in_progress')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                statusToggle === 'in_progress'
                  ? 'bg-[#6B3BF6] text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>In Progress</span>
            </button>

            <button
              onClick={() => {
                setStatusToggle('completed')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                statusToggle === 'completed'
                  ? 'bg-slate-900 text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </button>

            <button
              onClick={() => {
                setStatusToggle('onboarding')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                statusToggle === 'onboarding'
                  ? 'bg-[#6B3BF6] text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Onboarding</span>
            </button>

            <button
              onClick={() => {
                setStatusToggle('rejections')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                statusToggle === 'rejections'
                  ? 'bg-slate-900 text-white shadow-md font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>Rejections Track</span>
            </button>
          </div>
        </div>

        {/* ROW 2: SEARCH & UPFRONT FILTER DROPDOWNS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, position, round..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <select
              value={clientFilter}
              onChange={e => setClientFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Clients">All Client Partners</option>
              <option value="Accenture">Accenture</option>
              <option value="Goldman Sachs">Goldman Sachs</option>
              <option value="Tesla">Tesla</option>
              <option value="Deloitte">Deloitte</option>
              <option value="LTTS / L&T">LTTS / L&T</option>
            </select>
          </div>

          <div>
            <select
              value={roundFilter}
              onChange={e => setRoundFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Rounds">All Interview Rounds</option>
              <option value="L1">L1 Technical</option>
              <option value="L2">L2 Technical</option>
              <option value="Final">Final HR / Executive</option>
            </select>
          </div>

          <div>
            <select
              value={rejectionStageFilter}
              onChange={e => setRejectionStageFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
            >
              <option value="All Stages">Filter Rejection Stage: All</option>
              <option value="Screening">Stage: Screening Rejections</option>
              <option value="L1 Technical">Stage: L1 Technical Rejections</option>
              <option value="L2 Technical">Stage: L2 Technical Rejections</option>
              <option value="L3 / Manager">Stage: L3 / Manager Rejections</option>
              <option value="Final HR Round">Stage: Final HR Round Rejections</option>
            </select>
          </div>
        </div>
      </div>

      {/* HELPER BANNERS FOR CURRENT STAGE */}
      {statusToggle === 'upcoming' && (
        <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs text-purple-950 font-medium">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6B3BF6]" />
            <span>
              <strong>Upcoming Interviews:</strong> All scheduled interviews reflect here. When the interview date/time completes, it shifts to <strong>In Progress</strong> waiting for the evaluation result.
            </span>
          </div>
        </div>
      )}

      {statusToggle === 'in_progress' && (
        <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs text-purple-950 font-medium">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6B3BF6]" />
            <span>
              <strong>In Progress (Awaiting Result):</strong> Interview sessions completed waiting for result. Perform actions here to record <strong>Selected in Interview</strong> or <strong>Rejected in Interview</strong>.
            </span>
          </div>
        </div>
      )}

      {statusToggle === 'completed' && (
        <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-900 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-700" />
            <span>
              <strong>Completed Interviews:</strong> Displays final evaluation results of interviews, candidate decision outcomes, rejection reasons, and offer letter tracking.
            </span>
          </div>
        </div>
      )}

      {statusToggle === 'onboarding' && (
        <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-between text-xs text-purple-950 font-medium">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#6B3BF6]" />
            <span>
              <strong>Onboarding Track:</strong> Filter and track candidate onboarding completion, candidates who joined, and candidates who backed out / did not join with detailed recruiter notes.
            </span>
          </div>
        </div>
      )}

      {statusToggle === 'rejections' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-900 font-medium shadow-2xs">
            <div className="flex items-start gap-2.5">
              <UserX className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-extrabold text-sm block">Rejection Stage Track & Candidate Audit Trail</strong>
                <span>
                  Track all candidates who were rejected across every evaluation stage: <strong>Screening</strong>, <strong>L1 Technical</strong>, <strong>L2 Technical</strong>, <strong>L3 / Manager Round</strong>, and <strong>Final HR Round</strong>. Review detailed evaluator feedback, rejection reasons, and candidate submission history.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-slate-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
              <span>Total Rejections: {filteredRejectedList.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Screening</span>
              <span className="text-xl font-extrabold text-slate-900">
                {scopeRejectedList.filter(r => r.rejectedStage === 'Screening').length}
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">L1 Technical</span>
              <span className="text-xl font-extrabold text-[#6B3BF6]">
                {scopeRejectedList.filter(r => r.rejectedStage === 'L1 Technical').length}
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">L2 Technical</span>
              <span className="text-xl font-extrabold text-[#6B3BF6]">
                {scopeRejectedList.filter(r => r.rejectedStage === 'L2 Technical').length}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">L3 / Manager</span>
              <span className="text-xl font-extrabold text-slate-900">
                {scopeRejectedList.filter(r => r.rejectedStage === 'L3 / Manager').length}
              </span>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Final HR Round</span>
              <span className="text-xl font-extrabold text-[#6B3BF6]">
                {scopeRejectedList.filter(r => r.rejectedStage === 'Final HR Round').length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. CARD 1: INTERVIEW SCHEDULE / REJECTIONS TABLE */}
      {statusToggle === 'rejections' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <UserX className="w-4 h-4 text-slate-700" />
                <span>Rejected Candidates Track ({filteredRejectedList.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit log of candidates rejected during initial screening, technical assessments (L1/L2), manager evaluation (L3), or HR round.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
              Showing {paginatedRejectedList.length} of {filteredRejectedList.length} rejections
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3.5">CANDIDATE NAME & ID</th>
                  <th className="px-4 py-3.5">REQUIREMENT & ROLE</th>
                  <th className="px-4 py-3.5">CLIENT PARTNER</th>
                  <th className="px-4 py-3.5">REJECTED STAGE</th>
                  <th className="px-4 py-3.5">REJECTION REASON & EVALUATOR NOTES</th>
                  <th className="px-4 py-3.5">EVALUATED BY & DATE</th>
                  <th className="px-4 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedRejectedList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                      No candidate rejections found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedRejectedList.map(item => (
                    <tr key={item.id} className="hover:bg-rose-50/20 transition-colors align-top">
                      {/* 1. CANDIDATE NAME & ID */}
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.candidateName}</span>
                        </div>
                        {item.candidateId && (
                          <div className="text-[10px] font-mono text-slate-500 font-bold mt-0.5">
                            ID: {item.candidateId}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          Submitted by: <strong className="text-slate-600">{item.submittedBy || 'Marcus Chen'}</strong>
                        </div>
                      </td>

                      {/* 2. REQUIREMENT & ROLE */}
                      <td className="px-4 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <button
                            onClick={() => handleOpenReqOverview(item.requirementId, item.position, item.company)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 font-mono hover:underline cursor-pointer transition-all flex items-center gap-1"
                            title="Click to view Requirement Overview"
                          >
                            <span>{item.requirementId}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-[#6B3BF6]" />
                          </button>
                        </div>
                        <div className="font-extrabold text-slate-900 text-xs">{item.position}</div>
                      </td>

                      {/* 3. CLIENT PARTNER */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#6B3BF6] inline shrink-0" />
                          <span>{item.company}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Lead: {item.teamLead || 'Harish Gadipally'}
                        </div>
                      </td>

                      {/* 4. REJECTED STAGE */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${getRejectionStageBadgeStyle(item.rejectedStage)}`}>
                          {item.rejectedStage}
                        </span>
                      </td>

                      {/* 5. REJECTION REASON & EVALUATOR NOTES */}
                      <td className="px-4 py-4 max-w-md">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{item.rejectionReason}</span>
                        </div>
                        {item.evaluatorNotes && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/80 mt-1.5 leading-relaxed font-medium">
                            <span className="font-bold text-slate-700">Notes: </span>
                            {item.evaluatorNotes}
                          </div>
                        )}
                      </td>

                      {/* 6. EVALUATED BY & DATE */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        <div className="font-bold text-slate-800">{item.evaluatedBy}</div>
                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <CalendarIcon className="w-3 h-3 text-slate-400" />
                          <span>{item.rejectionDate}</span>
                        </div>
                      </td>

                      {/* 7. ACTIONS */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRejectedCandidateModal(item)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#6B3BF6]" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationFooter
            currentPage={currentPage}
            totalPages={rejectedTotalPages}
            totalItems={filteredRejectedList.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : statusToggle === 'onboarding' ? null : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {statusToggle === 'upcoming'
                ? 'Upcoming Interviews'
                : statusToggle === 'in_progress'
                ? 'In Progress Interviews'
                : statusToggle === 'completed'
                ? 'Completed Interviews'
                : 'All Scheduled & Conducted Interviews'}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Showing {filteredScheduleList.length} of {combinedScheduleList.length} interviews
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {statusToggle === 'all' ? (
                    <>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        CANDIDATE NAME
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        REQUIREMENT ID & ROLE
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        CLIENT
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        INTERVIEW ROUND
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        MODE & SCHEDULE
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        STATUS
                      </th>
                    </>
                  ) : statusToggle === 'upcoming' ? (
                    <>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        NAME
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        REQUIREMENT ID + ROLE
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        CLIENT
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        ROUND
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        MODE
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        SCHEDULE ACTIONS
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        NAME
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        REQUIREMENT ID + ROLE
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        CLIENT
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        ROUND
                      </th>
                      <th className="px-4 py-3.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        MODE
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {paginatedScheduleList.length === 0 ? (
                  <tr>
                    <td colSpan={statusToggle === 'in_progress' || statusToggle === 'completed' ? 5 : 6} className="py-10 text-center text-slate-400">
                      No interviews in this section.
                    </td>
                  </tr>
                ) : (
                  paginatedScheduleList.map(row => (
                    <tr key={row.id} className="hover:bg-purple-50/30 transition-colors">
                      {statusToggle === 'all' ? (
                        <>
                          {/* 1. CANDIDATE NAME */}
                          <td className="px-4 py-4 font-extrabold text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{row.candidateName}</span>
                          </td>

                          {/* 2. REQUIREMENT ID + ROLE */}
                          <td className="px-4 py-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <button
                                onClick={() => handleOpenReqOverview(row.requirementId || 'REQ-2026-08-12-001', row.position, row.company)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 font-mono hover:underline cursor-pointer transition-all flex items-center gap-1"
                                title="Click to view Requirement Overview"
                              >
                                <span>{row.requirementId || 'REQ-2026-08-12-001'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-[#6B3BF6]" />
                              </button>
                            </div>
                            <div className="font-extrabold text-slate-900 text-xs">{row.position}</div>
                          </td>

                          {/* 3. CLIENT */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#6B3BF6] inline shrink-0" />
                              <span>{row.company || 'Accenture'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                              Lead: {row.teamLead || 'Harish Gadipally'} | By: {row.submittedBy || 'Marcus Chen'}
                            </div>
                          </td>

                          {/* 4. ROUND */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getRoundBadgeStyle(row.round)}`}>
                              {row.round}
                            </span>
                          </td>

                          {/* 5. MODE & SCHEDULE */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                              <Laptop className="w-3.5 h-3.5 text-slate-500" />
                              <span>{row.mode} ({row.dateTime})</span>
                            </div>
                          </td>

                          {/* 6. STATUS */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                                row.status === 'Completed'
                                  ? 'bg-slate-100 text-slate-800 border-slate-200'
                                  : 'bg-purple-100 text-purple-800 border-purple-200'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </>
                      ) : statusToggle === 'upcoming' ? (
                        <>
                          {/* 1. NAME */}
                          <td className="px-4 py-4 font-extrabold text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{row.candidateName}</span>
                          </td>

                          {/* 2. REQUIREMENT ID + ROLE */}
                          <td className="px-4 py-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <button
                                onClick={() => handleOpenReqOverview(row.requirementId || 'REQ-2026-08-12-001', row.position, row.company)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 font-mono hover:underline cursor-pointer transition-all flex items-center gap-1"
                                title="Click to view Requirement Overview"
                              >
                                <span>{row.requirementId || 'REQ-2026-08-12-001'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-[#6B3BF6]" />
                              </button>
                            </div>
                            <div className="font-extrabold text-slate-900 text-xs">{row.position}</div>
                          </td>

                          {/* 3. CLIENT */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#6B3BF6] inline shrink-0" />
                              <span>{row.company || 'Accenture'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                              Lead: {row.teamLead || 'Harish Gadipally'} | By: {row.submittedBy || 'Marcus Chen'}
                            </div>
                          </td>

                          {/* 4. ROUND */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                              {row.round}
                            </span>
                          </td>

                          {/* 5. MODE */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                              <Laptop className="w-3.5 h-3.5 text-slate-500" />
                              <span>{row.mode} ({row.dateTime})</span>
                            </div>
                          </td>

                          {/* 6. SCHEDULE ACTIONS: EDIT & REMIND */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setRemindModalCandidate(row)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs flex items-center gap-1.5"
                              >
                                <Bell className="w-3.5 h-3.5 text-[#6B3BF6]" />
                                <span>Remind Candidate</span>
                              </button>

                              <button
                                onClick={() => setSelectedSchedule(row)}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs flex items-center gap-1.5"
                                title="Edit schedule"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* 1. NAME */}
                          <td className="px-4 py-4 font-extrabold text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{row.candidateName}</span>
                          </td>

                          {/* 2. REQUIREMENT ID + ROLE */}
                          <td className="px-4 py-4 max-w-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <button
                                onClick={() => handleOpenReqOverview(row.requirementId || 'REQ-2026-08-12-001', row.position, row.company)}
                                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] border border-purple-200 font-mono hover:underline cursor-pointer transition-all flex items-center gap-1"
                                title="Click to view Requirement Overview"
                              >
                                <span>{row.requirementId || 'REQ-2026-08-12-001'}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-[#6B3BF6]" />
                              </button>
                            </div>
                            <div className="font-extrabold text-slate-900 text-xs">{row.position}</div>
                          </td>

                          {/* 3. CLIENT */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-[#6B3BF6] inline shrink-0" />
                              <span>{row.company || 'Accenture'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                              Lead: {row.teamLead || 'Harish Gadipally'} | By: {row.submittedBy || 'Marcus Chen'}
                            </div>
                          </td>

                          {/* 4. ROUND */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getRoundBadgeStyle(row.round)}`}
                            >
                              {row.round}
                            </span>
                          </td>

                          {/* 5. MODE */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                              <Laptop className="w-3.5 h-3.5 text-blue-500" />
                              <span>{row.mode} ({row.dateTime})</span>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 10-ITEM PAGINATION FOOTER */}
          <PaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredScheduleList.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}



      {/* 5. CARD 3: RELEASED OFFER LETTER & ONBOARDING TRACK (JOINED VS NOT JOINED - SHOWN ONLY WHEN ONBOARDING TOGGLE IS CLICKED) */}
      {statusToggle === 'onboarding' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          {/* Header & Sub-Pill Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#6B3BF6]" />
                <span>Onboarding & Offer Outcome Track</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track candidate onboarding completion, joined candidates, and backed-out / not-joined candidates with detailed recruiter notes.
              </p>
            </div>

            {/* Sub-Pill Filters */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setOfferOutcomeFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  offerOutcomeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Offers ({scopeOfferLetters.length})
              </button>

              <button
                type="button"
                onClick={() => setOfferOutcomeFilter('joined')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  offerOutcomeFilter === 'joined'
                    ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Joined ({scopeOfferLetters.filter(o => o.status === 'Joined').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setOfferOutcomeFilter('not_joined')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  offerOutcomeFilter === 'not_joined'
                    ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Not Joined ({scopeOfferLetters.filter(o => o.status === 'Not Joined' || o.status === 'Declined').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setOfferOutcomeFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  offerOutcomeFilter === 'pending'
                    ? 'bg-[#6B3BF6] text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Response ({scopeOfferLetters.filter(o => o.status === 'Offer Released' || o.status === 'Accepted').length})
              </button>
            </div>
          </div>

          {/* Quick Summary Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Offers Released</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">{scopeOfferLetters.length}</span>
              </div>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider block">Joined / On-boarded</span>
                <span className="text-lg font-extrabold text-[#6B3BF6] tabular-nums">
                  {scopeOfferLetters.filter(o => o.status === 'Joined').length}
                  <span className="text-xs font-bold text-purple-700 ml-1">
                    ({Math.round((scopeOfferLetters.filter(o => o.status === 'Joined').length / (scopeOfferLetters.length || 1)) * 100)}%)
                  </span>
                </span>
              </div>
              <UserCheck className="w-4 h-4 text-[#6B3BF6]" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Not Joined / Backed Out</span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {scopeOfferLetters.filter(o => o.status === 'Not Joined' || o.status === 'Declined').length}
                </span>
              </div>
              <UserX className="w-4 h-4 text-slate-600" />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-purple-800 uppercase tracking-wider block">Awaiting Onboarding</span>
                <span className="text-lg font-extrabold text-[#6B3BF6] tabular-nums">
                  {scopeOfferLetters.filter(o => o.status === 'Offer Released' || o.status === 'Accepted').length}
                </span>
              </div>
              <Clock className="w-4 h-4 text-[#6B3BF6]" />
            </div>
          </div>

          {/* Offer Letters Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3.5">CANDIDATE NAME</th>
                  <th className="px-4 py-3.5">REQUIREMENT & ROLE</th>
                  <th className="px-4 py-3.5">CLIENT PARTNER</th>
                  <th className="px-4 py-3.5">ONBOARDING STATUS</th>
                  <th className="px-4 py-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOfferLetters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                      No offer records found matching current selection.
                    </td>
                  </tr>
                ) : (
                  filteredOfferLetters.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors align-top">
                      {/* 1. CANDIDATE NAME */}
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.candidateName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Recruiter: <strong className="text-slate-600">{item.submittedBy || 'Marcus Chen'}</strong>
                        </div>
                      </td>

                      {/* 2. REQUIREMENT & ROLE */}
                      <td className="px-4 py-4 max-w-xs">
                        <span className="text-[10px] font-mono text-[#6B3BF6] font-bold block">{item.requirementId}</span>
                        <span className="text-xs text-slate-800 font-semibold">{item.position}</span>
                      </td>

                      {/* 3. CLIENT PARTNER */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#6B3BF6]" />
                          <span>{item.client}</span>
                        </div>
                      </td>

                      {/* 4. ONBOARDING STATUS */}
                      <td className="px-4 py-4">
                        {item.status === 'Joined' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 inline-flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-[#6B3BF6]" />
                            <span>Joined / On-boarded</span>
                          </span>
                        )}

                        {(item.status === 'Not Joined' || item.status === 'Declined') && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
                            <UserX className="w-3.5 h-3.5 text-slate-700" />
                            <span>Not Joined / Backed Out</span>
                          </span>
                        )}

                        {item.status === 'Offer Released' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                            Offer Released (Awaiting Joining)
                          </span>
                        )}

                        {item.status === 'Accepted' && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                            Offer Accepted (Joining Pending)
                          </span>
                        )}
                      </td>

                      {/* 5. ACTIONS */}
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {(item.status === 'Offer Released' || item.status === 'Accepted') && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setOfferLetters(prev =>
                                    prev.map(o => (o.id === item.id ? { ...o, status: 'Joined', joiningDate: o.joiningDate || 'Aug 25, 2026' } : o))
                                  )
                                  showToast(`Candidate ${item.candidateName} marked as Joined / On-boarded! 🎉`)
                                }}
                                className="px-2.5 py-1.5 bg-[#6B3BF6] hover:bg-[#5b30d9] text-white text-[11px] font-extrabold rounded-xl cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Mark Joined</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenNotJoinedModal(item)}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-extrabold rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Mark Not Joined</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenNotJoinedModal(item)}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-extrabold rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-[#6B3BF6]" />
                            <span>Note</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewNotJoinedDetailModal(item)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-extrabold rounded-xl cursor-pointer transition-all shadow-2xs"
                          >
                            <span>View Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {isScheduleModalOpen && (
        <ScheduleInterviewModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onScheduleSuccess={() => {
            showToast('Interview scheduled successfully!')
            setIsScheduleModalOpen(false)
          }}
        />
      )}

      {/* REMIND CANDIDATE MODAL */}
      {remindModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#6B3BF6]">
                <Bell className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900">Send Candidate Interview Reminder</h3>
              </div>
              <button
                onClick={() => setRemindModalCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p className="font-semibold">
                Would you like to send an automated interview reminder notification to candidate <strong className="text-slate-900">{remindModalCandidate.candidateName}</strong>?
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-bold text-slate-900">{remindModalCandidate.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requirement / Role:</span>
                  <span className="font-bold text-slate-900">{remindModalCandidate.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-bold text-purple-700">{remindModalCandidate.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scheduled Time:</span>
                  <span className="font-bold text-slate-800">{remindModalCandidate.dateTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Channels:</span>
                  <span className="font-bold text-[#6B3BF6]">Email & SMS Notification</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRemindModalCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`Interview reminder sent to ${remindModalCandidate.candidateName} via Email & SMS!`)
                  setRemindModalCandidate(null)
                }}
                className="px-4 py-2 bg-[#6B3BF6] hover:bg-[#5b30d9] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder to Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL UI */}
      {rejectModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <UserX className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-extrabold text-slate-900">Record Interview Rejection Reason</h3>
              </div>
              <button
                onClick={() => setRejectModalCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-bold text-slate-900">{rejectModalCandidate.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requirement / Role:</span>
                  <span className="font-bold text-slate-900">{rejectModalCandidate.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Round:</span>
                  <span className="font-bold text-purple-700">{rejectModalCandidate.round}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Select Rejection Stage / Round <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Screening', 'L1 Technical', 'L2 Technical', 'L3 / Manager', 'Final HR Round'] as RejectionStageType[]).map(stage => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setSelectedRejectionStage(stage)}
                        className={`px-2.5 py-2 rounded-xl text-[11px] font-extrabold text-left border transition-all cursor-pointer flex items-center justify-between ${
                          selectedRejectionStage === stage
                            ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{stage}</span>
                        {selectedRejectionStage === stage && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6B3BF6] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Select Reason for Rejection <span className="text-slate-500">*</span>
                  </label>
                  <div className="space-y-1.5">
                    {[
                      'Technical evaluation score below threshold',
                      'Domain experience mismatch for client requirement',
                      'Salary expectation exceeds approved budget',
                      'Communication / soft skills mismatch',
                      'Candidate withdrew / unavailable for next round',
                      'Other',
                    ].map(reason => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedRejectionReason === reason
                            ? 'border-purple-600 bg-purple-50/60 font-bold text-slate-900 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rejectionReasonRadio"
                          value={reason}
                          checked={selectedRejectionReason === reason}
                          onChange={() => setSelectedRejectionReason(reason)}
                          className="text-[#6B3BF6] focus:ring-[#6B3BF6]"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  {selectedRejectionReason === 'Other' && (
                    <div className="pt-2 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Specify Custom Rejection Reason</label>
                      <textarea
                        rows={2}
                        value={customRejectionNote}
                        onChange={e => setCustomRejectionNote(e.target.value)}
                        placeholder="Type custom reason for rejection..."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectModalCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectCandidate}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Submit Rejection & Move to Final Decision</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE INTERVIEW CALENDAR MODAL */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 font-sans max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#6B3BF6]" />
                  <h3 className="text-lg font-extrabold text-slate-900">August 2026 — Interview Schedule Calendar</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#6B3BF6] border border-purple-200">
                    Live Calendar View
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Interviews mapped by scheduled date, status state (Upcoming, In Progress, Completed), and client company
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* State Filter Buttons */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-extrabold">
                  <button
                    onClick={() => setCalendarStateFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      calendarStateFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All States
                  </button>
                  <button
                    onClick={() => setCalendarStateFilter('Upcoming')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      calendarStateFilter === 'Upcoming'
                        ? 'bg-[#6B3BF6] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setCalendarStateFilter('In Progress')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      calendarStateFilter === 'In Progress'
                        ? 'bg-[#6B3BF6] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setCalendarStateFilter('Completed')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      calendarStateFilter === 'Completed'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Completed
                  </button>
                </div>

                <button
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Days of Week Bar */}
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50 p-2 rounded-xl border border-slate-100">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Monthly Calendar Grid (Aug 2026) */}
            <div className="grid grid-cols-7 gap-2">
              {/* Previous month filler days */}
              {[26, 27, 28, 29, 30, 31].map(d => (
                <div key={`prev-${d}`} className="min-h-24 p-2 bg-slate-50/40 rounded-2xl border border-slate-100/60 opacity-40">
                  <span className="text-[10px] font-bold text-slate-400">{d}</span>
                </div>
              ))}

              {/* August Days 1 - 31 */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const dayStr = day < 10 ? `0${day}` : `${day}`
                const dayInterviews = combinedScheduleList.filter(s => {
                  if (calendarStateFilter !== 'all' && s.status !== calendarStateFilter) return false
                  return s.dateTime.includes(`Aug ${dayStr}`) || s.dateTime.includes(`2026-08-${dayStr}`) || (day === 17 && s.dateTime.includes('Today'))
                })

                return (
                  <div
                    key={`aug-${day}`}
                    className={`min-h-28 p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                      day === 17
                        ? 'bg-purple-50/40 border-purple-300 ring-2 ring-[#6B3BF6]/20'
                        : 'bg-white border-slate-200/80 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-extrabold ${day === 17 ? 'text-[#6B3BF6] bg-purple-100 px-2 py-0.5 rounded-full' : 'text-slate-700'}`}>
                        Aug {day}
                      </span>
                      {dayInterviews.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#6B3BF6] animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-20">
                      {dayInterviews.length === 0 ? (
                        <span className="text-[10px] text-slate-300 font-medium italic block pt-2">No interviews</span>
                      ) : (
                        dayInterviews.map(item => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setIsCalendarModalOpen(false)
                              setSelectedSchedule(item)
                            }}
                            className={`p-1.5 rounded-xl border text-[10px] font-extrabold cursor-pointer transition-all hover:scale-102 shadow-2xs space-y-0.5 ${
                              item.status === 'Completed'
                                ? 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                                : 'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200'
                            }`}
                            title={`Click to view/edit ${item.candidateName}'s interview`}
                          >
                            <div className="truncate text-slate-900">{item.candidateName}</div>
                            <div className="text-[9px] font-semibold text-purple-700 flex items-center justify-between">
                              <span>{item.company}</span>
                              <span className="opacity-80">{item.round}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer Legend */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-4">
                <span className="text-slate-500 font-bold">Interview Status States:</span>
                <span className="flex items-center gap-1 text-[#6B3BF6] font-extrabold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B3BF6]" /> Upcoming / In Progress
                </span>
                <span className="flex items-center gap-1 text-slate-700 font-extrabold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Completed
                </span>
              </div>

              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTED CANDIDATE DETAIL MODAL */}
      {selectedRejectedCandidateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <UserX className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-extrabold text-slate-900">Rejected Candidate Detailed Feedback</h3>
              </div>
              <button
                onClick={() => setSelectedRejectedCandidateModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{selectedRejectedCandidateModal.candidateName}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${getRejectionStageBadgeStyle(selectedRejectedCandidateModal.rejectedStage)}`}>
                    Rejected at {selectedRejectedCandidateModal.rejectedStage}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Requirement: <strong className="text-slate-900">{selectedRejectedCandidateModal.position}</strong> ({selectedRejectedCandidateModal.requirementId})
                </div>
                <div className="text-[11px] text-purple-800 font-bold">
                  Client: {selectedRejectedCandidateModal.company}
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Primary Rejection Reason</div>
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{selectedRejectedCandidateModal.rejectionReason}</span>
                  </div>
                </div>

                {selectedRejectedCandidateModal.evaluatorNotes && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Evaluator Notes & Assessment</div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedRejectedCandidateModal.evaluatorNotes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block">Evaluated By</span>
                    <span className="font-bold text-slate-800">{selectedRejectedCandidateModal.evaluatedBy}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block">Rejection Date</span>
                    <span className="font-bold text-slate-800">{selectedRejectedCandidateModal.rejectionDate}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block">Submitted By</span>
                    <span className="font-bold text-slate-800">{selectedRejectedCandidateModal.submittedBy || 'Recruiter'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold block">Team Lead</span>
                    <span className="font-bold text-slate-800">{selectedRejectedCandidateModal.teamLead || 'Harish Gadipally'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  showToast(`Rejection evaluation report downloaded for ${selectedRejectedCandidateModal.candidateName}`)
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#6B3BF6]" />
                <span>Download Evaluation Report</span>
              </button>
              <button
                onClick={() => setSelectedRejectedCandidateModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK NOT JOINED & ADD REASON NOTE MODAL */}
      {notJoinedModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <UserX className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-extrabold text-slate-900">Record Non-Joining Reason & Recruiter Note</h3>
              </div>
              <button
                type="button"
                onClick={() => setNotJoinedModalCandidate(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-bold text-slate-900">{notJoinedModalCandidate.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requirement / Role:</span>
                  <span className="font-bold text-slate-900">{notJoinedModalCandidate.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client:</span>
                  <span className="font-bold text-purple-700">{notJoinedModalCandidate.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Offered CTC:</span>
                  <span className="font-bold text-[#6B3BF6]">{notJoinedModalCandidate.offeredCTC}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Select Primary Reason for Not Joining <span className="text-slate-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {[
                    'Competing offer with higher compensation',
                    'Counter offer from current employer',
                    'Relocation / Location constraint',
                    'Shift timing / work mode mismatch',
                    'Personal / Family / Health issues',
                    'Joined another organization',
                    'Other',
                  ].map(reason => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        selectedNotJoinedReason === reason
                          ? 'border-purple-600 bg-purple-50/70 font-bold text-slate-900 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="notJoinedReasonRadio"
                        value={reason}
                        checked={selectedNotJoinedReason === reason}
                        onChange={() => setSelectedNotJoinedReason(reason)}
                        className="text-[#6B3BF6] focus:ring-[#6B3BF6]"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Recruiter Non-Joining Note / Background Details</span>
                    <span className="text-[10px] text-slate-400 font-normal">Required for audit tracking</span>
                  </label>
                  <textarea
                    rows={3}
                    value={notJoinedCustomNote}
                    onChange={e => setNotJoinedCustomNote(e.target.value)}
                    placeholder=""
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNotJoinedModalCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotJoinedRecord}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Save Non-Joining Note & Update Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ONBOARDING / OFFER DETAILS MODAL */}
      {viewNotJoinedDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-[#6B3BF6]" />
                <h3 className="text-base font-extrabold text-slate-900">Onboarding & Offer Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewNotJoinedDetailModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              {/* CANDIDATE & ROLE SUMMARY */}
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 space-y-1">
                <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                  <span>{viewNotJoinedDetailModal.candidateName}</span>
                  <span className="text-[10px] text-slate-500 font-normal">Recruiter: {viewNotJoinedDetailModal.submittedBy || 'Marcus Chen'}</span>
                </div>
                <div className="text-slate-600 font-medium text-xs">Role: {viewNotJoinedDetailModal.position} ({viewNotJoinedDetailModal.requirementId})</div>
                <div className="text-[#6B3BF6] font-bold text-xs">Client: {viewNotJoinedDetailModal.client}</div>
              </div>

              {/* OFFER DATE & CTC */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5">Offered CTC</span>
                  <span className="font-extrabold text-slate-900 text-xs">{viewNotJoinedDetailModal.offeredCTC || 'N/A'}</span>
                  {viewNotJoinedDetailModal.offerDate && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">Offered on: {viewNotJoinedDetailModal.offerDate}</span>
                  )}
                </div>

                {/* JOINING DATE */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5">Joining Date</span>
                  <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#6B3BF6]" />
                    <span>{viewNotJoinedDetailModal.joiningDate || 'Not Scheduled'}</span>
                  </div>
                </div>
              </div>

              {/* ONBOARDING STATUS */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] uppercase tracking-wider mb-1">Onboarding Status</span>
                {viewNotJoinedDetailModal.status === 'Joined' && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 inline-flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#6B3BF6]" />
                    <span>Joined / On-boarded</span>
                  </span>
                )}
                {(viewNotJoinedDetailModal.status === 'Not Joined' || viewNotJoinedDetailModal.status === 'Declined') && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
                    <UserX className="w-3.5 h-3.5 text-slate-700" />
                    <span>Not Joined / Backed Out</span>
                  </span>
                )}
                {viewNotJoinedDetailModal.status === 'Offer Released' && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                    Offer Released (Awaiting Joining)
                  </span>
                )}
                {viewNotJoinedDetailModal.status === 'Accepted' && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200 inline-block">
                    Offer Accepted (Joining Pending)
                  </span>
                )}
              </div>

              {/* RECRUITER NOTES */}
              {(viewNotJoinedDetailModal.notJoinedReason || viewNotJoinedDetailModal.notJoinedNote) ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#6B3BF6]" />
                    <span>Recruiter Non-Joining Notes</span>
                  </div>
                  {viewNotJoinedDetailModal.notJoinedReason && (
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{viewNotJoinedDetailModal.notJoinedReason}</span>
                    </div>
                  )}
                  {viewNotJoinedDetailModal.notJoinedNote && (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-slate-200/80">
                      {viewNotJoinedDetailModal.notJoinedNote}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-400 text-xs italic">
                  No additional non-joining notes recorded for this candidate.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const item = viewNotJoinedDetailModal
                  setViewNotJoinedDetailModal(null)
                  handleOpenNotJoinedModal(item)
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#6B3BF6]" />
                <span>Note</span>
              </button>
              <button
                type="button"
                onClick={() => setViewNotJoinedDetailModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
