import React, { useState, useMemo } from 'react'
import { Candidate, Requirement } from '../../../types'
import { PageHeader } from '../../layout/PageHeader'
import {
  Users,
  Upload,
  FileText,
  Calendar,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  Bookmark,
  Trash2,
  Play,
  Clock,
  Briefcase,
  ShieldAlert,
} from 'lucide-react'
import {
  getSavedDrafts,
  saveDraftItem,
  removeSavedDraft,
  SavedDraftItem,
} from '../../../data/savedDraftsStore'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'

export interface AddCandidatePageProps {
  requirements?: Requirement[]
  selectedReqId?: string | null
  /** Show Back only when opened as a nested view (e.g. from Repository or My Workspace) */
  showBack?: boolean
  backLabel?: string
  /** When set, Back uses this instead of opening the repository. */
  onBack?: () => void
  pageTitle?: string
  onOpenRepository: () => void
  onAddCandidate?: (candidate: Candidate) => void
}
