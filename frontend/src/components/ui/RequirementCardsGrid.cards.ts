import {
  FileText,
  Send,
  UserX,
  UserCheck,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Requirement, Submission, Interview } from '../../types'
import {
  isRequirementUnassigned,
  isRequirementAssigned,
  isRequirementInProgress,
  requirementHasSelections,
  requirementHasRejection,
} from './requirementAssignment'

export type CardFilterType =
  | 'ALL'
  | 'SUBMISSIONS'
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'INTERVIEWS'
  | 'SELECTIONS'
  | 'REJECTIONS'

export function buildRequirementCards(
  requirements: Requirement[],
  submissions: Submission[],
  interviews: Interview[],
) {
  // Every KPI value = number of requirement rows shown when that card is clicked
  const totalReqs = requirements.length
  const submissionsReqCount = requirements.filter(r => (r.submissions || 0) > 0).length
  const unassignedCount = requirements.filter(isRequirementUnassigned).length
  const assignedCount = requirements.filter(isRequirementAssigned).length
  const inProgressCount = requirements.filter(isRequirementInProgress).length
  const interviewsReqCount = requirements.filter(r => (r.interviews || 0) > 0).length
  const selectionsReqCount = requirements.filter(requirementHasSelections).length
  const rejectionsReqCount = requirements.filter(r =>
    requirementHasRejection(r, interviews, submissions),
  ).length

  return [
    {
      key: 'ALL' as CardFilterType,
      label: 'Total',
      value: totalReqs,
      icon: FileText,
      bg: '#F4EFFE',
      borderColor: '#E9D8FD',
      iconBg: '#8B5CF6',
    },
    {
      key: 'SUBMISSIONS' as CardFilterType,
      label: 'Submissions',
      value: submissionsReqCount,
      icon: Send,
      bg: '#E6F8F0',
      borderColor: '#A7F3D0',
      iconBg: '#00BA7C',
    },
    {
      key: 'UNASSIGNED' as CardFilterType,
      label: 'Unassigned',
      value: unassignedCount,
      icon: UserX,
      bg: '#FDE8EC',
      borderColor: '#FECDD3',
      iconBg: '#FF3B68',
    },
    {
      key: 'ASSIGNED' as CardFilterType,
      label: 'Assigned',
      value: assignedCount,
      icon: UserCheck,
      bg: '#EBF3FE',
      borderColor: '#BFDBFE',
      iconBg: '#3B82F6',
    },
    {
      key: 'IN_PROGRESS' as CardFilterType,
      label: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      bg: '#FEF6E6',
      borderColor: '#FDE68A',
      iconBg: '#F59E0B',
    },
    {
      key: 'INTERVIEWS' as CardFilterType,
      label: 'Interviews',
      value: interviewsReqCount,
      icon: Video,
      bg: '#EEF2FF',
      borderColor: '#C7D2FE',
      iconBg: '#6366F1',
    },
    {
      key: 'SELECTIONS' as CardFilterType,
      label: 'Selected',
      value: selectionsReqCount,
      icon: CheckCircle2,
      bg: '#E6F8F0',
      borderColor: '#A7F3D0',
      iconBg: '#00BA7C',
    },
    {
      key: 'REJECTIONS' as CardFilterType,
      label: 'Rejected',
      value: rejectionsReqCount,
      icon: XCircle,
      bg: '#FDE8EC',
      borderColor: '#FECDD3',
      iconBg: '#FF3B68',
    },
  ]
}
