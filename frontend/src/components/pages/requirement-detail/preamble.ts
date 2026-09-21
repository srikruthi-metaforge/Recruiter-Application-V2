import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  FileText,
  Pencil,
  Briefcase,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  User,
  Users,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Search,
  RotateCcw,
} from 'lucide-react'
import { Requirement } from '../../../types'
import { ScheduleInterviewModal } from '../../modals/ScheduleInterviewModal'
import { SubmitCandidateModal } from '../../modals/SubmitCandidateModal'

export interface RequirementDetailOverviewProps {
  requirement: Requirement
  role?: string
  onBack: () => void
  onOpenAssignModal?: () => void
  onEditRequirement?: () => void
  onAddCandidate?: () => void
  onRevokeRequirement?: () => void
}
