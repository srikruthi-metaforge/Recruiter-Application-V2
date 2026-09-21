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
  onOpenRepository: () => void
  onAddCandidate?: (candidate: Candidate) => void
}
