import React, { useState, useMemo } from 'react'
import {
  Activity,
  Search,
  ChevronDown,
  Filter,
  ShieldCheck,
  User,
  Users,
  UserCheck,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Laptop,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  Lock,
  Zap,
  LogIn,
  LogOut,
  Key,
  X,
} from 'lucide-react'
import { Role, ActivityLogItem } from '../../types'
import { PaginationFooter } from '../ui/PaginationFooter'

export type { ActivityLogItem }

export interface RecruiterLoginRecord {
  id: string
  userName: string
  userEmail: string
  userRole: Role
  userAvatar: string
  firstEverLoginTimestamp: string
  logDate: string
  loginTime: string
  logoutTime: string
  sessionDuration: string
  activeScreenTime: string
  ipAddress: string
  deviceInfo: string
  status: 'Active Now' | 'Logged Out' | 'Timed Out'
  actionsLoggedCount: number
}

// 1. RECRUITER DAILY LOGIN & LOGOUT HISTORY DATASET
const INITIAL_LOGIN_RECORDS: RecruiterLoginRecord[] = [
  // --- TODAY (Sep 09, 2026) ---
  {
    id: 'LGN-9001',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    firstEverLoginTimestamp: 'Jan 12, 2026 at 08:30:00 AM',
    logDate: 'Today (Sep 09, 2026)',
    loginTime: '09:15:22 AM',
    logoutTime: 'Active Session (Logged in now)',
    sessionDuration: '4h 32m',
    activeScreenTime: '2h 52m',
    ipAddress: '192.168.1.45',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Active Now',
    actionsLoggedCount: 14,
  },
  {
    id: 'LGN-9004',
    userName: 'Priya Sharma',
    userEmail: 'p.sharma@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'P',
    firstEverLoginTimestamp: 'Feb 01, 2026 at 09:00:00 AM',
    logDate: 'Today (Sep 09, 2026)',
    loginTime: '09:30:15 AM',
    logoutTime: 'Active Session (Logged in now)',
    sessionDuration: '4h 17m',
    activeScreenTime: '2h 15m',
    ipAddress: '192.168.1.52',
    deviceInfo: 'macOS Sonoma / Safari 17',
    status: 'Active Now',
    actionsLoggedCount: 9,
  },
  {
    id: 'LGN-9006',
    userName: 'Suresh kulkarni',
    userEmail: 'suresh.k@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'S',
    firstEverLoginTimestamp: 'Mar 15, 2026 at 09:15:00 AM',
    logDate: 'Today (Sep 09, 2026)',
    loginTime: '09:45:00 AM',
    logoutTime: 'Active Session (Logged in now)',
    sessionDuration: '4h 02m',
    activeScreenTime: '1h 48m',
    ipAddress: '192.168.1.60',
    deviceInfo: 'Windows 11 / Edge 127',
    status: 'Active Now',
    actionsLoggedCount: 6,
  },
  {
    id: 'LGN-9008',
    userName: 'lakshmi.v Recruiter',
    userEmail: 'lakshmi.v@talentflow.io',
    userRole: 'lead',
    userAvatar: 'L',
    firstEverLoginTimestamp: 'Jan 05, 2026 at 08:45:00 AM',
    logDate: 'Today (Sep 09, 2026)',
    loginTime: '09:05:10 AM',
    logoutTime: 'Active Session (Logged in now)',
    sessionDuration: '4h 42m',
    activeScreenTime: '3h 10m',
    ipAddress: '10.0.4.18',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Active Now',
    actionsLoggedCount: 18,
  },
  {
    id: 'LGN-9010',
    userName: 'Harish Gadipally',
    userEmail: 'harish.g@metaforgeit.com',
    userRole: 'lead',
    userAvatar: 'H',
    firstEverLoginTimestamp: 'Nov 10, 2025 at 08:15:00 AM',
    logDate: 'Today (Sep 09, 2026)',
    loginTime: '08:45:00 AM',
    logoutTime: 'Active Session (Logged in now)',
    sessionDuration: '5h 02m',
    activeScreenTime: '3h 45m',
    ipAddress: '192.168.1.10',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Active Now',
    actionsLoggedCount: 24,
  },

  // --- YESTERDAY (Sep 08, 2026) ---
  {
    id: 'LGN-9002',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    firstEverLoginTimestamp: 'Jan 12, 2026 at 08:30:00 AM',
    logDate: 'Sep 08, 2026',
    loginTime: '09:02:14 AM',
    logoutTime: '06:45:10 PM',
    sessionDuration: '9h 42m',
    activeScreenTime: '7h 12m',
    ipAddress: '192.168.1.45',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Logged Out',
    actionsLoggedCount: 28,
  },
  {
    id: 'LGN-9005',
    userName: 'Priya Sharma',
    userEmail: 'p.sharma@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'P',
    firstEverLoginTimestamp: 'Feb 01, 2026 at 09:00:00 AM',
    logDate: 'Sep 08, 2026',
    loginTime: '09:15:00 AM',
    logoutTime: '06:15:30 PM',
    sessionDuration: '9h 00m',
    activeScreenTime: '6h 40m',
    ipAddress: '192.168.1.52',
    deviceInfo: 'macOS Sonoma / Safari 17',
    status: 'Logged Out',
    actionsLoggedCount: 19,
  },
  {
    id: 'LGN-9007',
    userName: 'Suresh kulkarni',
    userEmail: 'suresh.k@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'S',
    firstEverLoginTimestamp: 'Mar 15, 2026 at 09:15:00 AM',
    logDate: 'Sep 08, 2026',
    loginTime: '09:20:10 AM',
    logoutTime: '06:00:15 PM',
    sessionDuration: '8h 40m',
    activeScreenTime: '6h 10m',
    ipAddress: '192.168.1.60',
    deviceInfo: 'Windows 11 / Edge 127',
    status: 'Logged Out',
    actionsLoggedCount: 15,
  },
  {
    id: 'LGN-9009',
    userName: 'lakshmi.v Recruiter',
    userEmail: 'lakshmi.v@talentflow.io',
    userRole: 'lead',
    userAvatar: 'L',
    firstEverLoginTimestamp: 'Jan 05, 2026 at 08:45:00 AM',
    logDate: 'Sep 08, 2026',
    loginTime: '09:00:00 AM',
    logoutTime: '07:00:00 PM',
    sessionDuration: '10h 00m',
    activeScreenTime: '7h 30m',
    ipAddress: '10.0.4.18',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Logged Out',
    actionsLoggedCount: 31,
  },
  {
    id: 'LGN-9011',
    userName: 'Harish Gadipally',
    userEmail: 'harish.g@metaforgeit.com',
    userRole: 'lead',
    userAvatar: 'H',
    firstEverLoginTimestamp: 'Nov 10, 2025 at 08:15:00 AM',
    logDate: 'Sep 08, 2026',
    loginTime: '08:50:00 AM',
    logoutTime: '07:15:00 PM',
    sessionDuration: '10h 25m',
    activeScreenTime: '8h 05m',
    ipAddress: '192.168.1.10',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Logged Out',
    actionsLoggedCount: 45,
  },

  // --- PREVIOUS DAY (Sep 07, 2026) ---
  {
    id: 'LGN-9003',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    firstEverLoginTimestamp: 'Jan 12, 2026 at 08:30:00 AM',
    logDate: 'Sep 07, 2026',
    loginTime: '09:10:05 AM',
    logoutTime: '06:30:00 PM',
    sessionDuration: '9h 19m',
    activeScreenTime: '6h 50m',
    ipAddress: '192.168.1.45',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Logged Out',
    actionsLoggedCount: 22,
  },
  {
    id: 'LGN-9014',
    userName: 'Priya Sharma',
    userEmail: 'p.sharma@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'P',
    firstEverLoginTimestamp: 'Feb 01, 2026 at 09:00:00 AM',
    logDate: 'Sep 07, 2026',
    loginTime: '09:05:00 AM',
    logoutTime: '06:20:00 PM',
    sessionDuration: '9h 15m',
    activeScreenTime: '7h 05m',
    ipAddress: '192.168.1.52',
    deviceInfo: 'macOS Sonoma / Safari 17',
    status: 'Logged Out',
    actionsLoggedCount: 21,
  },
  {
    id: 'LGN-9015',
    userName: 'Suresh kulkarni',
    userEmail: 'suresh.k@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'S',
    firstEverLoginTimestamp: 'Mar 15, 2026 at 09:15:00 AM',
    logDate: 'Sep 07, 2026',
    loginTime: '09:30:00 AM',
    logoutTime: '05:45:00 PM',
    sessionDuration: '8h 15m',
    activeScreenTime: '5h 40m',
    ipAddress: '192.168.1.60',
    deviceInfo: 'Windows 11 / Edge 127',
    status: 'Logged Out',
    actionsLoggedCount: 14,
  },

  // --- PREVIOUS DAY (Sep 06, 2026) ---
  {
    id: 'LGN-9016',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    firstEverLoginTimestamp: 'Jan 12, 2026 at 08:30:00 AM',
    logDate: 'Sep 06, 2026',
    loginTime: '08:55:00 AM',
    logoutTime: '06:00:00 PM',
    sessionDuration: '9h 05m',
    activeScreenTime: '6h 30m',
    ipAddress: '192.168.1.45',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Logged Out',
    actionsLoggedCount: 18,
  },
  {
    id: 'LGN-9017',
    userName: 'Harish Gadipally',
    userEmail: 'harish.g@metaforgeit.com',
    userRole: 'lead',
    userAvatar: 'H',
    firstEverLoginTimestamp: 'Nov 10, 2025 at 08:15:00 AM',
    logDate: 'Sep 06, 2026',
    loginTime: '09:00:00 AM',
    logoutTime: '06:30:00 PM',
    sessionDuration: '9h 30m',
    activeScreenTime: '7h 15m',
    ipAddress: '192.168.1.10',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Logged Out',
    actionsLoggedCount: 32,
  },

  // --- PREVIOUS DAY (Sep 05, 2026) ---
  {
    id: 'LGN-9018',
    userName: 'Priya Sharma',
    userEmail: 'p.sharma@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'P',
    firstEverLoginTimestamp: 'Feb 01, 2026 at 09:00:00 AM',
    logDate: 'Sep 05, 2026',
    loginTime: '09:10:00 AM',
    logoutTime: '06:10:00 PM',
    sessionDuration: '9h 00m',
    activeScreenTime: '6h 20m',
    ipAddress: '192.168.1.52',
    deviceInfo: 'macOS Sonoma / Safari 17',
    status: 'Logged Out',
    actionsLoggedCount: 16,
  },
  {
    id: 'LGN-9019',
    userName: 'lakshmi.v Recruiter',
    userEmail: 'lakshmi.v@talentflow.io',
    userRole: 'lead',
    userAvatar: 'L',
    firstEverLoginTimestamp: 'Jan 05, 2026 at 08:45:00 AM',
    logDate: 'Sep 05, 2026',
    loginTime: '09:15:00 AM',
    logoutTime: '06:50:00 PM',
    sessionDuration: '9h 35m',
    activeScreenTime: '7h 10m',
    ipAddress: '10.0.4.18',
    deviceInfo: 'Windows 11 / Chrome 128',
    status: 'Logged Out',
    actionsLoggedCount: 26,
  },
  {
    id: 'LGN-9012',
    userName: 'David Park',
    userEmail: 'd.park@talentflow.io',
    userRole: 'admin',
    userAvatar: 'D',
    firstEverLoginTimestamp: 'Oct 01, 2025 at 08:00:00 AM',
    logDate: 'Today (Sep 09, 2026)',
    loginTime: '08:30:00 AM',
    logoutTime: 'Active Session (Logged in now)',
    sessionDuration: '5h 17m',
    activeScreenTime: '4h 00m',
    ipAddress: '192.168.1.5',
    deviceInfo: 'macOS Sequoia / Chrome 128',
    status: 'Active Now',
    actionsLoggedCount: 30,
  },
  {
    id: 'LGN-9013',
    userName: 'Robert Haines',
    userEmail: 'r.haines@talentflow.io',
    userRole: 'superadmin',
    userAvatar: 'R',
    firstEverLoginTimestamp: 'Sep 01, 2025 at 08:00:00 AM',
    logDate: 'Today (Sep 09, 2026)',
    loginTime: '08:15:00 AM',
    logoutTime: 'Active Session (Logged in now)',
    sessionDuration: '5h 32m',
    activeScreenTime: '4h 15m',
    ipAddress: '192.168.1.2',
    deviceInfo: 'Windows 11 Enterprise / Firefox 129',
    status: 'Active Now',
    actionsLoggedCount: 40,
  },
]

// 2. AUDIT TRAIL LOGS DATASET
const INITIAL_LOGS: ActivityLogItem[] = [
  // TODAY (Sep 09, 2026)
  {
    id: 'LOG-1001',
    timestamp: 'Today at 02:45 PM',
    userName: 'Harish Gadipally',
    userEmail: 'harish.g@metaforgeit.com',
    userRole: 'lead',
    userAvatar: 'H',
    action: 'Assigned Requirement REQ-2026-08-12-001 (Lead Java Full Stack) to Marcus Chen',
    category: 'Requirements',
    targetEntity: 'Requirement REQ-2026-08-12-001',
    targetId: 'REQ-2026-08-12-001',
    clientName: 'Accenture',
    ipAddress: '192.168.1.45',
    status: 'Success',
    details: 'Assigned requirement REQ-2026-08-12-001 for Accenture to team member Marcus Chen with high priority SLA.',
  },
  {
    id: 'LOG-1002',
    timestamp: 'Today at 01:20 PM',
    userName: 'Harish Gadipally',
    userEmail: 'harish.g@metaforgeit.com',
    userRole: 'lead',
    userAvatar: 'H',
    action: 'Cross-assigned Requirement REQ-2026-08-12-004 to Suresh kulkarni',
    category: 'Requirements',
    targetEntity: 'Requirement REQ-2026-08-12-004',
    targetId: 'REQ-2026-08-12-004',
    clientName: 'Accenture',
    ipAddress: '192.168.1.45',
    status: 'Success',
    details: 'Cross-client requirement assignment performed in My Team page for Accenture account.',
  },
  {
    id: 'LOG-2001',
    timestamp: 'Today at 01:45 PM',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    action: 'Submitted Candidate CAND-001 (Priya Nair) for REQ-2026-08-12-001',
    category: 'Submissions',
    targetEntity: 'Candidate CAND-001',
    targetId: 'CAND-001',
    clientName: 'Accenture',
    ipAddress: '192.168.1.45',
    status: 'Success',
    details: 'Submitted candidate profile with resume attachment for Lead Java Developer role at Accenture.',
  },
  {
    id: 'LOG-2002',
    timestamp: 'Today at 09:15 AM',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    action: 'Logged into Recruiter Application Portal',
    category: 'System & Access',
    targetEntity: 'User Session',
    targetId: 'LGN-9001',
    clientName: '',
    ipAddress: '192.168.1.45',
    status: 'Success',
    details: 'Successful authentication via 2FA. Session token issued for 8 hours.',
  },
  {
    id: 'LOG-3001',
    timestamp: 'Today at 10:15 AM',
    userName: 'David Park',
    userEmail: 'd.park@talentflow.io',
    userRole: 'admin',
    userAvatar: 'D',
    action: 'Updated Client SLA settings for Accenture Account',
    category: 'Client Management',
    targetEntity: 'Client Accenture',
    targetId: 'CLI-001',
    clientName: 'Accenture',
    ipAddress: '192.168.1.5',
    status: 'Success',
    details: 'Updated SLA requirement response threshold to 48 hours for Accenture global account.',
  },

  // YESTERDAY (Sep 08, 2026)
  {
    id: 'LOG-3002',
    timestamp: 'Sep 08, 2026 at 04:30 PM',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    action: 'Sourced candidate Alex Turner (Senior React Developer) for Accenture',
    category: 'Candidate Sourcing',
    targetEntity: 'Candidate CAND-002',
    targetId: 'CAND-002',
    clientName: 'Accenture',
    ipAddress: '192.168.1.45',
    status: 'Success',
    details: 'Uploaded candidate CV and performed AI skill extraction.',
  },
  {
    id: 'LOG-3003',
    timestamp: 'Sep 08, 2026 at 02:15 PM',
    userName: 'Priya Sharma',
    userEmail: 'p.sharma@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'P',
    action: 'Submitted Candidate Rohan Varma for REQ-2026-08-12-003',
    category: 'Submissions',
    targetEntity: 'Candidate CAND-008',
    targetId: 'CAND-008',
    clientName: 'Deloitte',
    ipAddress: '192.168.1.52',
    status: 'Success',
    details: 'Submitted profile to Lead Lakshmi V for review.',
  },
  {
    id: 'LOG-3004',
    timestamp: 'Sep 08, 2026 at 11:00 AM',
    userName: 'Suresh kulkarni',
    userEmail: 'suresh.k@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'S',
    action: 'Scheduled Technical Interview Round 1 for Vikram Mehta',
    category: 'Interviews',
    targetEntity: 'Candidate CAND-004',
    targetId: 'CAND-004',
    clientName: 'Accenture',
    ipAddress: '192.168.1.60',
    status: 'Success',
    details: 'Scheduled interview panel with Accenture Tech Manager.',
  },

  // PREVIOUS DAYS (Sep 07, Sep 06, Sep 05)
  {
    id: 'LOG-4001',
    timestamp: 'Sep 07, 2026 at 03:45 PM',
    userName: 'Marcus Chen',
    userEmail: 'm.chen@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'M',
    action: 'Sourced candidate Rania Khalil for Node.js Backend requirement',
    category: 'Candidate Sourcing',
    targetEntity: 'Candidate CAND-003',
    targetId: 'CAND-003',
    clientName: 'Accenture',
    ipAddress: '192.168.1.45',
    status: 'Success',
    details: 'Added profile details with 7 yrs Node.js experience.',
  },
  {
    id: 'LOG-4002',
    timestamp: 'Sep 07, 2026 at 10:30 AM',
    userName: 'Harish Gadipally',
    userEmail: 'harish.g@metaforgeit.com',
    userRole: 'lead',
    userAvatar: 'H',
    action: 'Assigned 3 new backend requirements to Priya Sharma',
    category: 'Requirements',
    targetEntity: 'Requirement REQ-2026-08-10-002',
    targetId: 'REQ-2026-08-10-002',
    clientName: 'Deloitte',
    ipAddress: '192.168.1.10',
    status: 'Success',
    details: 'Allocated Deloitte requirements for rapid sourcing.',
  },
  {
    id: 'LOG-5001',
    timestamp: 'Sep 06, 2026 at 04:15 PM',
    userName: 'Priya Sharma',
    userEmail: 'p.sharma@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'P',
    action: 'Updated candidate interview feedback for candidate Ananya Sharma',
    category: 'Interviews',
    targetEntity: 'Candidate CAND-005',
    targetId: 'CAND-005',
    clientName: 'Accenture',
    ipAddress: '192.168.1.52',
    status: 'Success',
    details: 'Logged Client Manager feedback: Passed Round 1 with high score.',
  },
  {
    id: 'LOG-6001',
    timestamp: 'Sep 05, 2026 at 02:00 PM',
    userName: 'Suresh kulkarni',
    userEmail: 'suresh.k@talentflow.io',
    userRole: 'recruiter',
    userAvatar: 'S',
    action: 'Exported Sourcing Performance Report for Aug 2026',
    category: 'User Management',
    targetEntity: 'Reporting Engine',
    targetId: 'REP-550',
    clientName: '',
    ipAddress: '192.168.1.60',
    status: 'Success',
    details: 'Downloaded performance metrics CSV.',
  },
]

interface ActivityLogsPageProps {
  role?: Role
  logs?: ActivityLogItem[]
}

export function ActivityLogsPage({ role = 'superadmin', logs }: ActivityLogsPageProps) {
  // Main Tab State: 'login_reports' | 'audit_trail'
  const [activeTab, setActiveTab] = useState<'login_reports' | 'audit_trail'>('login_reports')

  // Date Filter State across Tabs
  const [selectedDatePreset, setSelectedDatePreset] = useState<string>('today')
  const [customDate, setCustomDate] = useState<string>('')

  // Search & Filter State for Login Reports Tab
  const [loginSearch, setLoginSearch] = useState('')
  const [selectedRecruiterFilter, setSelectedRecruiterFilter] = useState('All Users')

  // UI & Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sessionModalDateMode, setSessionModalDateMode] = useState<'preset' | 'custom'>('preset')
  const [sessionModalCustomDate, setSessionModalCustomDate] = useState<string>('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleRefreshData = () => {
    setIsRefreshing(true)
    setLoginSearch('')
    setSelectedRecruiterFilter('All Users')
    setSelectedDatePreset('today')
    setCustomDate('')
    setSearchQuery('')
    setCategoryFilter('All Categories')
    setRoleFilter('All Roles')
    setStatusFilter('All Statuses')
    setCurrentPage(1)
    setTimeout(() => {
      setIsRefreshing(false)
      showToast('Audit logs & session history refreshed successfully!')
    }, 600)
  }

  // Search & Filter State for Audit Trail Tab
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

  // Selected Inspect Modal State
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null)
  const [selectedLoginRecord, setSelectedLoginRecord] = useState<RecruiterLoginRecord | null>(null)
  const [sessionActionsRecruiter, setSessionActionsRecruiter] = useState<RecruiterLoginRecord | null>(null)

  // Helper to match dates against preset or custom date picker
  const matchesDateFilter = (text: string, preset: string, customDateStr: string) => {
    if (preset === 'all' && !customDateStr) return true

    if (preset === 'today') {
      return text.includes('Today') || text.includes('Sep 09, 2026') || text.includes('Sep 9, 2026')
    }

    if (preset === 'yesterday') {
      return text.includes('Yesterday') || text.includes('Sep 08, 2026') || text.includes('Sep 8, 2026')
    }

    if (preset === 'custom' && customDateStr) {
      const [y, m, d] = customDateStr.split('-')
      if (!y || !m || !d) return true
      const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
      const monthShort = dt.toLocaleDateString('en-US', { month: 'short' })
      const dayNum = parseInt(d, 10)
      const dayPadded = dayNum < 10 ? `0${dayNum}` : `${dayNum}`

      const formatted1 = `${monthShort} ${dayPadded}, ${y}`
      const formatted2 = `${monthShort} ${dayNum}, ${y}`
      const formatted3 = `${monthShort} ${dayPadded}`
      const formatted4 = `${monthShort} ${dayNum}`

      const lowerText = text.toLowerCase()
      if (customDateStr === '2026-09-09' && lowerText.includes('today')) return true
      if (customDateStr === '2026-09-08' && lowerText.includes('yesterday')) return true

      return (
        lowerText.includes(formatted1.toLowerCase()) ||
        lowerText.includes(formatted2.toLowerCase()) ||
        lowerText.includes(formatted3.toLowerCase()) ||
        lowerText.includes(formatted4.toLowerCase()) ||
        lowerText.includes(customDateStr)
      )
    }

    if (preset && preset !== 'all') {
      const [y, m, d] = preset.split('-')
      if (y && m && d) {
        const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
        const monthShort = dt.toLocaleDateString('en-US', { month: 'short' })
        const dayNum = parseInt(d, 10)
        const dayPadded = dayNum < 10 ? `0${dayNum}` : `${dayNum}`

        const formatted1 = `${monthShort} ${dayPadded}, ${y}`
        const formatted2 = `${monthShort} ${dayNum}, ${y}`
        const lowerText = text.toLowerCase()

        if (preset === '2026-09-09' && lowerText.includes('today')) return true
        if (preset === '2026-09-08' && lowerText.includes('yesterday')) return true

        return lowerText.includes(formatted1.toLowerCase()) || lowerText.includes(formatted2.toLowerCase())
      }
    }

    return true
  }

  // Helper to generate chronological session actions for inspect modal
  const getSessionActionsForRecruiter = (rec: RecruiterLoginRecord) => {
    const list = [
      {
        id: `${rec.id}-ACT-01`,
        time: rec.loginTime,
        category: 'System & Access',
        action: `Logged into Recruiter Application Portal (${rec.userEmail})`,
        target: 'Authentication Session',
        status: 'Success',
        payload: `2FA authentication succeeded for ${rec.userEmail}. Session initiated on IP ${rec.ipAddress} (${rec.deviceInfo}).`
      },
      {
        id: `${rec.id}-ACT-02`,
        time: '09:20:15 AM',
        category: 'Requirements',
        action: `Retrieved active requirements worklist assigned to ${rec.userName}`,
        target: 'Requirements Module',
        status: 'Success',
        payload: `Queried client requirement allocations for ${rec.userRole} role.`
      },
      {
        id: `${rec.id}-ACT-03`,
        time: '09:42:10 AM',
        category: 'Candidate Sourcing',
        action: `Sourced candidate profile (Priya Nair, 8 yrs exp) into Candidate Repository`,
        target: 'Candidate Repository (CAND-001)',
        status: 'Success',
        payload: 'Parsed uploaded resume. Extracted primary skills: React, TypeScript, Java Full Stack.'
      },
      {
        id: `${rec.id}-ACT-04`,
        time: '10:05:30 AM',
        category: 'Candidate Sourcing',
        action: 'Executed automated AI Duplicate Detection algorithm on candidate Priya Nair',
        target: 'AI Intelligence Center',
        status: 'Success',
        payload: 'Duplicate search score: 0% duplicate probability. Candidate unique ID verified.'
      },
      {
        id: `${rec.id}-ACT-05`,
        time: '10:35:00 AM',
        category: 'Submissions',
        action: 'Submitted Candidate Priya Nair for Accenture (REQ-2026-08-12-001)',
        target: 'Accenture Account',
        status: 'Success',
        payload: 'Submitted candidate profile with SLA urgency flag to Team Lead Harish Gadipally.'
      },
      {
        id: `${rec.id}-ACT-06`,
        time: '11:10:22 AM',
        category: 'Candidate Sourcing',
        action: 'Sourced candidate profile (Alex Turner, 6 yrs exp) into Candidate Repository',
        target: 'Candidate Repository (CAND-002)',
        status: 'Success',
        payload: 'Extracted skills: React, Redux, TailwindCSS, Node.js.'
      },
      {
        id: `${rec.id}-ACT-07`,
        time: '11:45:00 AM',
        category: 'Submissions',
        action: 'Submitted Candidate Alex Turner for Accenture (REQ-2026-08-12-002)',
        target: 'Accenture Account',
        status: 'Success',
        payload: 'Submitted profile for Senior React Developer requirement.'
      },
      {
        id: `${rec.id}-ACT-08`,
        time: '12:15:30 PM',
        category: 'Interviews',
        action: 'Scheduled Technical Interview Round 1 for candidate Alex Turner',
        target: 'Accenture Hiring Panel',
        status: 'Success',
        payload: 'Outlook Calendar invite dispatched for Aug 12 at 02:00 PM.'
      },
      {
        id: `${rec.id}-ACT-09`,
        time: '01:05:10 PM',
        category: 'Candidate Sourcing',
        action: 'Sourced candidate profile (Rania Khalil, 7 yrs exp) into Candidate Repository',
        target: 'Candidate Repository (CAND-003)',
        status: 'Success',
        payload: 'Saved candidate details for Node.js Backend Specialist role.'
      },
      {
        id: `${rec.id}-ACT-10`,
        time: '01:45:00 PM',
        category: 'Submissions',
        action: 'Updated submission status of candidate Priya Nair to Submitted to Client',
        target: 'Submissions Tracker',
        status: 'Success',
        payload: 'Status updated following Team Lead approval.'
      },
      {
        id: `${rec.id}-ACT-11`,
        time: '02:10:45 PM',
        category: 'Interviews',
        action: 'Logged interview feedback note for Alex Turner Round 1 interview',
        target: 'Accenture Hiring Panel',
        status: 'Success',
        payload: 'Panel feedback: Strong React architecture knowledge, recommended for Round 2.'
      },
      {
        id: `${rec.id}-ACT-12`,
        time: '02:40:00 PM',
        category: 'Candidate Sourcing',
        action: 'Sourced candidate profile (Vikram Mehta, 10 yrs exp) for AWS DevOps role',
        target: 'Candidate Repository (CAND-004)',
        status: 'Success',
        payload: 'Saved candidate with 10 yrs AWS DevOps experience.'
      },
      {
        id: `${rec.id}-ACT-13`,
        time: '03:15:00 PM',
        category: 'User Management',
        action: 'Exported candidate submission progress report for client account',
        target: 'Reporting Engine',
        status: 'Success',
        payload: 'Generated submission summary CSV report.'
      },
      {
        id: `${rec.id}-ACT-14`,
        time: '03:45:00 PM',
        category: 'System & Access',
        action: 'Recorded active screen time heartbeat (Status: Active)',
        target: 'Screen Time Tracker',
        status: 'Success',
        payload: `Active screen time verified: ${rec.activeScreenTime}. Session active on IP ${rec.ipAddress}.`
      },
      {
        id: `${rec.id}-ACT-15`,
        time: '04:10:00 PM',
        category: 'Candidate Sourcing',
        action: 'Sourced candidate profile Ananya Sharma (5 yrs exp) for Java Full Stack',
        target: 'Candidate Repository (CAND-005)',
        status: 'Success',
        payload: 'Saved candidate resume in Candidate Repository.'
      },
      {
        id: `${rec.id}-ACT-16`,
        time: '04:45:00 PM',
        category: 'Submissions',
        action: 'Submitted Candidate Ananya Sharma for Java Full Stack requirement',
        target: 'Accenture Account',
        status: 'Success',
        payload: 'Submitted candidate profile for review.'
      },
      {
        id: `${rec.id}-ACT-17`,
        time: '05:15:00 PM',
        category: 'Interviews',
        action: 'Scheduled Client Manager Interview Round for candidate Priya Nair',
        target: 'Client Hiring Manager',
        status: 'Success',
        payload: 'Calendar invite sent for Aug 14 at 11:00 AM.'
      },
      {
        id: `${rec.id}-ACT-18`,
        time: '05:40:00 PM',
        category: 'Requirements',
        action: 'Updated candidate pipeline status to In Progress',
        target: 'Requirements Module',
        status: 'Success',
        payload: 'Pipeline conversion metric refreshed.'
      },

      {
        id: `${rec.id}-ACT-19`,
        time: '06:00:00 PM',
        category: 'Submissions',
        action: 'Approved candidate submission SUB-203 for client review',
        target: 'Submission Queue',
        status: 'Success',
        payload: 'Lead review completed and approved.'
      },
      {
        id: `${rec.id}-ACT-20`,
        time: '06:15:00 PM',
        category: 'Candidate Sourcing',
        action: 'Ran candidate search filter for Java & Spring Boot skills',
        target: 'Candidate Repository',
        status: 'Success',
        payload: 'Search query returned 38 matching profiles.'
      },
      {
        id: `${rec.id}-ACT-21`,
        time: '06:30:00 PM',
        category: 'System & Access',
        action: 'User initiated session logout request',
        target: 'Authentication Session',
        status: 'Success',
        payload: `Clean logout recorded. Total session duration: ${rec.sessionDuration}.`
      },
    ]

    return list.slice(0, Math.min(rec.actionsLoggedCount, list.length))
  }

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 1. FILTERED LOGIN RECORDS
  const filteredLoginRecords = useMemo(() => {
    return INITIAL_LOGIN_RECORDS.filter(record => {
      // Date Filter
      if (!matchesDateFilter(record.logDate, selectedDatePreset, customDate)) {
        return false
      }
      // Recruiter / User Filter
      if (selectedRecruiterFilter !== 'All Users' && record.userName !== selectedRecruiterFilter) {
        return false
      }
      // Text Search
      if (loginSearch.trim()) {
        const q = loginSearch.toLowerCase()
        const matchName = record.userName.toLowerCase().includes(q)
        const matchEmail = record.userEmail.toLowerCase().includes(q)
        const matchIp = record.ipAddress.toLowerCase().includes(q)
        const matchDevice = record.deviceInfo.toLowerCase().includes(q)
        const matchDate = record.logDate.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchIp && !matchDevice && !matchDate) return false
      }
      return true
    })
  }, [selectedRecruiterFilter, loginSearch, selectedDatePreset, customDate])

  // Paginated Login Records
  const paginatedLoginRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLoginRecords.slice(start, start + pageSize)
  }, [filteredLoginRecords, currentPage])

  // 2. FILTERED AUDIT TRAIL LOGS
  const filteredLogs = useMemo(() => {
    return INITIAL_LOGS.filter(log => {
      // Date Filter
      if (!matchesDateFilter(log.timestamp, selectedDatePreset, customDate)) {
        return false
      }
      // Role Filter
      if (roleFilter !== 'All Roles') {
        if (roleFilter === 'Team Lead' && log.userRole !== 'lead') return false
        if (roleFilter === 'Recruiter' && log.userRole !== 'recruiter') return false
        if (roleFilter === 'Admin' && log.userRole !== 'admin') return false
        if (roleFilter === 'Super Admin' && log.userRole !== 'superadmin' && log.userRole !== 'devteam') return false
      }
      // Category Filter
      if (categoryFilter !== 'All Categories' && log.category !== categoryFilter) return false
      // Status Filter
      if (statusFilter !== 'All Statuses' && log.status !== statusFilter) return false
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchUser = log.userName.toLowerCase().includes(q)
        const matchEmail = log.userEmail.toLowerCase().includes(q)
        const matchAction = log.action.toLowerCase().includes(q)
        const matchClient = log.clientName?.toLowerCase().includes(q)
        const matchTime = log.timestamp.toLowerCase().includes(q)
        if (!matchUser && !matchEmail && !matchAction && !matchClient && !matchTime) return false
      }
      return true
    })
  }, [roleFilter, categoryFilter, statusFilter, searchQuery, selectedDatePreset, customDate])

  // Paginated Audit Logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage])

  const totalLoginPages = Math.ceil(filteredLoginRecords.length / pageSize) || 1
  const totalAuditPages = Math.ceil(filteredLogs.length / pageSize) || 1

  // Unique recruiters list for dropdown filter
  const recruiterOptions = useMemo(() => {
    const names = Array.from(new Set(INITIAL_LOGIN_RECORDS.map(r => r.userName)))
    return names.sort()
  }, [])



  // Role Badge Helper
  const getRoleBadge = (r: Role) => {
    switch (r) {
      case 'recruiter':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-[#6B3BF6] border border-purple-200">Recruiter</span>
      case 'lead':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">Team Lead</span>
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">Admin</span>
      case 'devteam':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200">Dev Team</span>
      case 'superadmin':
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-900 border border-rose-200">Super Admin</span>
    }
  }

  // Export CSV Handler
  const handleExportReport = () => {
    const headers = ['Recruiter Name', 'Email', 'Role', 'First Application Login', 'Log Date', 'Daily Login Time', 'Logout Time', 'Session Duration', 'Active Screen Time', 'IP Address', 'Device', 'Status', 'Actions Count']
    const rows = INITIAL_LOGIN_RECORDS.map(r => [
      `"${r.userName}"`,
      `"${r.userEmail}"`,
      `"${r.userRole}"`,
      `"${r.firstEverLoginTimestamp}"`,
      `"${r.logDate}"`,
      `"${r.loginTime}"`,
      `"${r.logoutTime}"`,
      `"${r.sessionDuration}"`,
      `"${r.activeScreenTime}"`,
      `"${r.ipAddress}"`,
      `"${r.deviceInfo}"`,
      `"${r.status}"`,
      r.actionsLoggedCount
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Recruiter_Login_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 w-full pb-20 font-sans text-slate-800 animate-in fade-in duration-200">
      {/* 1. HEADER & EXPORT CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Audit Logs & Recruiter Login Reports
            </h1>
            <span className="px-3 py-1 bg-purple-50 text-[#6B3BF6] text-xs font-extrabold rounded-full border border-purple-200 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6B3BF6]" />
              <span>Admin & Super Admin Audit Module</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Individual recruiter daily login & logout history, first-time application access timestamps, and immutable activity audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Login & Audit Report</span>
          </button>

          <button
            onClick={handleRefreshData}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
            title="Refresh logs & reset filters"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-[#6B3BF6]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => {
            setActiveTab('login_reports')
            setCurrentPage(1)
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'login_reports'
              ? 'bg-[#6B3BF6] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Recruiter Login & Session History Report</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 font-black">
            {INITIAL_LOGIN_RECORDS.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('audit_trail')
            setCurrentPage(1)
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit_trail'
              ? 'bg-[#6B3BF6] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Audit Trail & Action Logs</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700 font-black">
            {INITIAL_LOGS.length}
          </span>
        </button>
      </div>

      {/* TAB 1: RECRUITER LOGIN & SESSION HISTORY REPORT */}
      {activeTab === 'login_reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-purple-700">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Logins Today</span>
                <LogIn className="w-4 h-4 text-[#6B3BF6]" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">11 Active</p>
              <p className="text-[10px] text-purple-700 font-medium">Recruiters logged in today</p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Daily Login Time</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">09:12 AM</p>
              <p className="text-[10px] text-emerald-700 font-medium">Punctual morning login average</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-blue-800">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Session Duration</span>
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">8h 45m</p>
              <p className="text-[10px] text-blue-700 font-medium">Daily logged-in work time</p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-1 shadow-2xs border border-slate-800">
              <div className="flex items-center justify-between text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Audit Trail Actions</span>
                <ShieldCheck className="w-4 h-4 text-purple-300" />
              </div>
              <p className="text-2xl font-black text-white font-mono">248 Actions</p>
              <p className="text-[10px] text-slate-300 font-medium">Logged during recruiter sessions</p>
            </div>
          </div>



          {/* FILTER CONTROLS FOR RECRUITER LOGINS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search recruiter name, email, or date..."
                  value={loginSearch}
                  onChange={e => {
                    setLoginSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
                />
              </div>

              {/* Filter Controls & Date Picker */}
              <div className="flex flex-wrap items-center gap-3">
                {/* DATE FILTER COMPONENT */}
                <div className="flex items-center gap-2 bg-purple-50/80 border border-purple-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <Calendar className="w-4 h-4 text-[#6B3BF6] shrink-0" />
                  <span className="text-xs font-black text-[#6B3BF6] whitespace-nowrap">Date:</span>
                  <div className="relative">
                    <select
                      value={selectedDatePreset}
                      onChange={e => {
                        const val = e.target.value
                        setSelectedDatePreset(val)
                        if (val !== 'custom') {
                          setCustomDate('')
                        }
                        setCurrentPage(1)
                      }}
                      className="appearance-none pl-2.5 pr-7 py-1 text-xs bg-white border border-purple-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                    >
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="custom">Custom Date</option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Custom Date Input */}
                  {selectedDatePreset === 'custom' && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
                      <input
                        type="date"
                        value={customDate}
                        onChange={e => {
                          setCustomDate(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="px-2.5 py-1 text-xs bg-white border border-purple-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#6B3BF6]"
                      />
                    </div>
                  )}

                  {/* Clear Date Filter Button */}
                  {(selectedDatePreset !== 'today' || customDate !== '') && (
                    <button
                      onClick={() => {
                        setSelectedDatePreset('today')
                        setCustomDate('')
                        setCurrentPage(1)
                      }}
                      className="p-1 hover:bg-purple-200/80 rounded-lg text-purple-700 transition-colors cursor-pointer"
                      title="Clear Date Filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* SELECT INDIVIDUAL RECRUITER */}
                <div className="relative">
                  <select
                    value={selectedRecruiterFilter}
                    onChange={e => {
                      setSelectedRecruiterFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-purple-50 border border-purple-200 rounded-xl font-black text-[#6B3BF6] focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                  >
                    <option value="All Users">👤 Select Individual Recruiter: All Users</option>
                    {recruiterOptions.map(name => (
                      <option key={name} value={name}>
                        Recruiter: {name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B3BF6] pointer-events-none" />
                </div>


              </div>
            </div>
          </div>

          {/* RECRUITER LOGIN HISTORY TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">RECRUITER / USER</th>
                    <th className="py-3.5 px-4">ROLE</th>
                    <th className="py-3.5 px-4">LOG DATE</th>
                    <th className="py-3.5 px-4">DAILY LOGIN TIME</th>
                    <th className="py-3.5 px-4">LOGOUT TIME</th>
                    <th className="py-3.5 px-4 text-center">ACTIVE SCREEN TIME</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-center">AUDIT ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {paginatedLoginRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <p className="font-bold text-sm">No login records found</p>
                        <p className="text-xs mt-1">Try adjusting the recruiter selection or status filter</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLoginRecords.map(rec => (
                      <tr
                        key={rec.id}
                        onClick={() => setSelectedLoginRecord(rec)}
                        className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                      >
                        {/* RECRUITER / USER */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200 shadow-2xs">
                              {rec.userAvatar}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs">{rec.userName}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{rec.userEmail}</div>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getRoleBadge(rec.userRole)}
                        </td>

                        {/* LOG DATE */}
                        <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-900">
                          {rec.logDate}
                        </td>

                        {/* DAILY LOGIN TIME */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-extrabold">
                            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{rec.loginTime}</span>
                          </span>
                        </td>

                        {/* LOGOUT TIME */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {rec.status === 'Active Now' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono text-xs font-extrabold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active Session</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-mono text-xs font-extrabold">
                              <LogOut className="w-3.5 h-3.5 text-slate-500" />
                              <span>{rec.logoutTime}</span>
                            </span>
                          )}
                        </td>

                        {/* ACTIVE SCREEN TIME */}
                        <td className="py-4 px-4 whitespace-nowrap text-center">
                          <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-[#6B3BF6] border border-purple-200 font-mono text-xs font-black">
                            {rec.activeScreenTime}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {rec.status === 'Active Now' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active Now</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Logged Out
                            </span>
                          )}
                        </td>

                        {/* AUDIT ACTIONS */}
                        <td className="py-4 px-4 whitespace-nowrap text-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSessionActionsRecruiter(rec)}
                            className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#6B3BF6] border border-purple-300 font-extrabold text-xs cursor-pointer shadow-2xs transition-all flex items-center gap-1.5 mx-auto active:scale-98"
                            title={`Inspect all ${rec.actionsLoggedCount} actions performed during this session`}
                          >
                            <Eye className="w-3.5 h-3.5 text-[#6B3BF6]" />
                            <span>{rec.actionsLoggedCount} Actions</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <PaginationFooter
              currentPage={currentPage}
              totalPages={totalLoginPages}
              totalItems={filteredLoginRecords.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM AUDIT TRAIL & ACTION LOGS */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* FILTERS & CONTROLS BAR */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name, action, date, client..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* DATE FILTER COMPONENT */}
                <div className="flex items-center gap-2 bg-purple-50/80 border border-purple-200 rounded-xl px-3 py-1.5 shadow-2xs">
                  <Calendar className="w-4 h-4 text-[#6B3BF6] shrink-0" />
                  <span className="text-xs font-black text-[#6B3BF6] whitespace-nowrap">Date:</span>
                  <div className="relative">
                    <select
                      value={selectedDatePreset}
                      onChange={e => {
                        const val = e.target.value
                        setSelectedDatePreset(val)
                        if (val !== 'custom') {
                          setCustomDate('')
                        }
                        setCurrentPage(1)
                      }}
                      className="appearance-none pl-2.5 pr-7 py-1 text-xs bg-white border border-purple-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                    >
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="custom">Custom Date</option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Custom Date Input */}
                  {selectedDatePreset === 'custom' && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 duration-150">
                      <input
                        type="date"
                        value={customDate}
                        onChange={e => {
                          setCustomDate(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="px-2.5 py-1 text-xs bg-white border border-purple-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#6B3BF6]"
                      />
                    </div>
                  )}

                  {/* Clear Date Filter Button */}
                  {(selectedDatePreset !== 'today' || customDate !== '') && (
                    <button
                      onClick={() => {
                        setSelectedDatePreset('today')
                        setCustomDate('')
                        setCurrentPage(1)
                      }}
                      className="p-1 hover:bg-purple-200/80 rounded-lg text-purple-700 transition-colors cursor-pointer"
                      title="Clear Date Filter"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={e => {
                      setRoleFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                  >
                    <option value="All Roles">All User Roles</option>
                    <option value="Team Lead">Team Lead Actions</option>
                    <option value="Recruiter">Recruiter Actions</option>
                    <option value="Admin">Admin Actions</option>
                    <option value="Super Admin">Super Admin & Dev Team</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={e => {
                      setCategoryFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="Candidate Sourcing">Candidate Sourcing</option>
                    <option value="Submissions">Submissions</option>
                    <option value="Requirements">Requirements</option>
                    <option value="User Management">User Management</option>
                    <option value="Client Management">Client Management</option>
                    <option value="System & Access">System & Access</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* TABLE OF AUDIT LOGS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">TIMESTAMP</th>
                    <th className="py-3.5 px-4">PERFORMED BY</th>
                    <th className="py-3.5 px-4">ROLE</th>
                    <th className="py-3.5 px-4">ACTION & DETAILS</th>
                    <th className="py-3.5 px-4">CATEGORY</th>
                    <th className="py-3.5 px-4">CLIENT / TARGET</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-center">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {paginatedLogs.map(log => (
                    <tr
                      key={log.id}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ipAddress}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                            {log.userAvatar}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs">{log.userName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{log.userEmail}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {getRoleBadge(log.userRole)}
                      </td>

                      <td className="py-4 px-4 max-w-sm">
                        <div className="font-extrabold text-slate-900 text-xs leading-snug">{log.action}</div>
                        {log.details && (
                          <div className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                            {log.details}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        {log.clientName ? (
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                            <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{log.clientName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">{log.targetEntity}</span>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Success</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer shadow-2xs flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3 h-3 text-[#6B3BF6]" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationFooter
              currentPage={currentPage}
              totalPages={totalAuditPages}
              totalItems={filteredLogs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* INSPECT LOGIN RECORD MODAL */}
      {selectedLoginRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 text-[#6B3BF6] font-black flex items-center justify-center text-base border border-purple-200">
                  {selectedLoginRecord.userAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{selectedLoginRecord.userName}</h3>
                    {getRoleBadge(selectedLoginRecord.userRole)}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{selectedLoginRecord.userEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoginRecord(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold block">Daily Login Time</span>
                  <span className="text-xs font-mono font-extrabold text-emerald-950">{selectedLoginRecord.loginTime}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Daily Logout Time</span>
                  <span className="text-xs font-mono font-extrabold text-slate-900">{selectedLoginRecord.logoutTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Active Screen Time</span>
                  <span className="text-xs font-mono font-extrabold text-purple-700">{selectedLoginRecord.activeScreenTime}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">IP Address & Network</span>
                  <span className="text-xs font-mono font-extrabold text-slate-900">{selectedLoginRecord.ipAddress}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLoginRecord(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT LOG MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-sm border border-purple-200">
                  {selectedLog.userAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{selectedLog.userName}</h3>
                    {getRoleBadge(selectedLog.userRole)}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{selectedLog.userEmail} • IP {selectedLog.ipAddress}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Action Description</span>
                <p className="text-sm font-extrabold text-slate-900">{selectedLog.action}</p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                  <span>Category: <strong>{selectedLog.category}</strong></span>
                  <span>Time: <strong>{selectedLog.timestamp}</strong></span>
                </div>
              </div>

              {selectedLog.details && (
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Detailed Execution Payload</span>
                  <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono rounded-2xl text-[11px] leading-relaxed border border-slate-800">
                    {selectedLog.details}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SESSION ACTION AUDIT TRAIL MODAL FOR SUPER ADMIN & ADMIN */}
      {sessionActionsRecruiter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 font-sans max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6B3BF6] font-black flex items-center justify-center text-lg border border-purple-200 shadow-2xs shrink-0">
                  {sessionActionsRecruiter.userAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Session Action Audit Trail — {sessionActionsRecruiter.userName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-[#6B3BF6] border border-purple-200">
                      {sessionModalDateMode === 'custom' ? '22 Actions Logged' : `${sessionActionsRecruiter.actionsLoggedCount} Actions Logged`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Session Date: <strong>{sessionModalDateMode === 'custom' && sessionModalCustomDate ? sessionModalCustomDate : sessionActionsRecruiter.logDate}</strong> • Login Time: <span className="font-mono text-slate-700 font-bold">{sessionActionsRecruiter.loginTime}</span>
                  </p>
                </div>
              </div>

              {/* DATE SWITCHER DROPDOWN FOR THIS RECRUITER */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-purple-50/70 border border-purple-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-[#6B3BF6]" />
                  <span className="text-[11px] font-bold text-[#6B3BF6]">Select Date:</span>
                  <div className="relative">
                    <select
                      value={sessionModalDateMode === 'custom' ? 'custom' : sessionActionsRecruiter.id}
                      onChange={e => {
                        const val = e.target.value
                        if (val === 'custom') {
                          setSessionModalDateMode('custom')
                          setSessionModalCustomDate('Sep 07, 2026')
                        } else {
                          setSessionModalDateMode('preset')
                          setSessionModalCustomDate('')
                          const rec = INITIAL_LOGIN_RECORDS.find(r => r.id === val)
                          if (rec) setSessionActionsRecruiter(rec)
                        }
                      }}
                      className="appearance-none pl-2 pr-6 py-0.5 text-xs font-black text-[#6B3BF6] bg-white border border-purple-200 rounded-lg focus:outline-none cursor-pointer"
                    >
                      {INITIAL_LOGIN_RECORDS.filter(r => r.userName === sessionActionsRecruiter.userName).map(r => (
                        <option key={r.id} value={r.id}>
                          {r.logDate} ({r.actionsLoggedCount} Actions)
                        </option>
                      ))}
                      <option value="custom">📅 Custom Date...</option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-[#6B3BF6] pointer-events-none" />
                  </div>

                  {sessionModalDateMode === 'custom' && (
                    <input
                      type="date"
                      onChange={e => {
                        const val = e.target.value
                        if (val) {
                          const [y, m, d] = val.split('-')
                          const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
                          const formatted = dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                          setSessionModalCustomDate(formatted)
                        }
                      }}
                      className="px-2 py-0.5 text-xs bg-white border border-purple-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#6B3BF6]"
                    />
                  )}
                </div>

                <button
                  onClick={() => {
                    setSessionActionsRecruiter(null)
                    setSessionModalDateMode('preset')
                    setSessionModalCustomDate('')
                  }}
                  className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* AUDIT ACTIONS TABLE / STREAM */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Chronological Action Audit Stream ({sessionActionsRecruiter.actionsLoggedCount} Total Events)
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Super Admin & Admin Verified Audit
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/70 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">TIMESTAMP</th>
                      <th className="py-2.5 px-3">CATEGORY</th>
                      <th className="py-2.5 px-3">ACTION DESCRIPTION</th>
                      <th className="py-2.5 px-3">TARGET ENTITY</th>
                      <th className="py-2.5 px-3 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 text-slate-800 font-medium">
                    {getSessionActionsForRecruiter(sessionActionsRecruiter).map(act => (
                      <tr key={act.id} className="hover:bg-white transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <Clock className="w-3 h-3 text-[#6B3BF6]" />
                            <span>{act.time}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                            {act.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900 text-xs">{act.action}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-md">{act.payload}</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-xs font-semibold text-slate-700">
                          {act.target}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Success</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSessionActionsRecruiter(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
              >
                Close Session Action Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
