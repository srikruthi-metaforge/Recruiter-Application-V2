import React, { useState } from 'react'
import { Interview, Requirement, Submission, ActivityLogItem } from '../../../types'
import { RequirementDetailOverview } from '../../pages/RequirementDetailOverview'
import { CandidateRepositoryPage } from '../../pages/CandidateRepositoryPage'
import { SubmissionsPage } from '../../pages/SubmissionsPage'
import { InterviewTrackingPage } from '../../pages/InterviewTrackingPage'
import {
  Send,
  MessageSquare,
  CheckCircle2,
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  ExternalLink,
  Plus,
  Briefcase,
  ArrowUp,
} from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { PageHeader } from '../../layout/PageHeader'

export interface Props {
  submissions: Submission[]
  interviews: Interview[]
  requirements: Requirement[]
  activityLogs?: ActivityLogItem[]
  currentUserName?: string
  currentUserEmail?: string
  onOpenSubmitCandidate?: (reqId?: string) => void
  onOpenCandidateRepo?: (reqId?: string) => void
  onOpenFeedbackModal?: (interview: Interview) => void
  onOpenCandidateDetail?: (sub: Submission) => void
  onAddActivityLog?: (log: ActivityLogItem) => void
}

export interface ActiveReqRow {
  type: string
  id: string
  name: string
  client: string
  status: string
  timestamp: string
}

export const DEFAULT_ACTIVE_REQS: ActiveReqRow[] = [
  {
    type: 'Requirement',
    id: 'REQ-2026-06-19-001',
    name: 'AI Data Engineer',
    client: 'harish',
    status: 'Assigned',
    timestamp: 'Jun 19, 2026, 07:29 PM',
  },
  {
    type: 'Requirement',
    id: 'REQ-2026-06-19-002',
    name: 'Fullstack React Developer',
    client: 'Metaforge IT',
    status: 'Submitted',
    timestamp: 'Jun 20, 2026, 10:15 AM',
  },
  {
    type: 'Requirement',
    id: 'REQ-2026-06-19-003',
    name: 'DevOps Cloud Specialist',
    client: 'Continental Automotive',
    status: 'Selected for interview',
    timestamp: 'Jun 21, 2026, 02:45 PM',
  },
]
