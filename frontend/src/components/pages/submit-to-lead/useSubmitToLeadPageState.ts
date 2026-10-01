import { CLIENT_TRACKER_PRESETS } from './trackerPresets.data'
import type { SubmitToLeadPageProps } from './preamble'
import { getForwardRequestByReq, ForwardRequest } from '../../../data/forwardRequestsStore'
import { getSessionUser } from '../../../store/session'
import React from 'react'

export function useSubmitToLeadPageState(props: SubmitToLeadPageProps) {
  const {
  selectedCandidates = [],
  requirement = null,
  role,
  onBack,
  onSubmitSuccess,
}: SubmitToLeadPageProps = props as SubmitToLeadPageProps & Record<string, never>
  const storedRole = getSessionUser()?.role || null
  const activeRole = role || storedRole || 'recruiter'
  const normalizedRole = (activeRole || '').toLowerCase()
  const isSuperAdminOrAdmin = normalizedRole === 'superadmin' || normalizedRole === 'admin' || normalizedRole === 'devteam'
  const isLead = normalizedRole === 'lead' || normalizedRole.includes('lead') || normalizedRole === 'team lead' || normalizedRole === 'team_lead'
  const isLeadOrAdmin = isLead || isSuperAdminOrAdmin

  const currentReqId = requirement?.id || 'REQ-2026-08-12-001'

  // Sync forward request from store
  const [forwardReq, setForwardReq] = useState<ForwardRequest | undefined>(() =>
    getForwardRequestByReq(currentReqId)
  )

  // Destination Checkboxes (Forward to client loop is DEFAULT as requested)
  const [submitToLeadChecked, setSubmitToLeadChecked] = useState(true)
  const [forwardLoopChecked, setForwardLoopChecked] = useState(true)

  // Sync state with forwardRequestsStore
  useEffect(() => {
    const handleSync = () => {
      const updated = getForwardRequestByReq(currentReqId)
      setForwardReq(updated)
    }
    handleSync()
    window.addEventListener('forward_requests_updated', handleSync)
    return () => window.removeEventListener('forward_requests_updated', handleSync)
  }, [currentReqId])

  const isLeadApproved = forwardReq?.status === 'approved'
  const isApprovalRequested = forwardReq?.status === 'pending'
  // Client Tracker Preset Definitions (Matching exact user screenshot & rules)
  const [clientName, setClientName] = useState(
    requirement?.client || 'METAFORGE (INTERNAL)'
  )

  // Thread Subject
  const [threadSubject, setThreadSubject] = useState(
    requirement
      ? `${requirement.id} — ${requirement.title} (${requirement.client})`
      : 'Candidate Profile Submission'
  )

  // From Recruiter
  const [recruiterName, setRecruiterName] = useState('Harish Gadipally')
  const [recruiterEmail, setRecruiterEmail] = useState('harish.g@metaforgeit.com')

  // Recipients
  const [toRecipients, setToRecipients] = useState([
    'Nikitha.S@Ltts.com',
    'Deepashree.Bc_ext@Ltts.com',
    'Bowya.Bowya_ext@Ltts.com',
  ])
  const [ccRecipients, setCcRecipients] = useState([
    'Ashwini.Kudi@Ltts.com',
    'Kallol.Chakraborty@Ltts.com',
  ])
  const [newToInput, setNewToInput] = useState('')
  const [newCcInput, setNewCcInput] = useState('')

  // Lead Email & Introduction (Default Mandatory for Recruiters, Counts as 1 Submission)
  const [leadEmail, setLeadEmail] = useState('lead.review@metaforgeit.com')
  const [emailGreeting, setEmailGreeting] = useState('Dear Lead & Hiring Team,')
  const [introduction, setIntroduction] = useState(
    'I hope you are doing well.\n\nPlease find below the candidate profile submitted for your review against the discussed requirement.\n\nKindly review the profile and share your feedback. We will be happy to coordinate the next steps based on your evaluation.'
  )

  const [confirmForwardChecked, setConfirmForwardChecked] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Custom Column & Tracker Table State
  const defaultPreset = CLIENT_TRACKER_PRESETS['METAFORGE (INTERNAL)']

  const [columnList, setColumnList] = useState<string[]>(defaultPreset.columns)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())
  const [customColName, setCustomColName] = useState('')
  const [customColPosition, setCustomColPosition] = useState('At start')
  const [headerColor, setHeaderColor] = useState(defaultPreset.headerColor)

  // Drag & Drop State for Column Layout Reordering (Fail-Safe)
  const isDraggingRef = useRef<boolean>(false)
  const draggedColIndexRef = useRef<number | null>(null)
  const [draggedColIndex, setDraggedColIndex] = useState<number | null>(null)
  const [dragOverColIndex, setDragOverColIndex] = useState<number | null>(null)
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  return {
    selectedCandidates,
    requirement,
    role,
    onBack,
    onSubmitSuccess,
    forwardReq,
    setForwardReq,
    submitToLeadChecked,
    setSubmitToLeadChecked,
    forwardLoopChecked,
    setForwardLoopChecked,
    clientName,
    setClientName,
    threadSubject,
    setThreadSubject,
    recruiterName,
    setRecruiterName,
    recruiterEmail,
    setRecruiterEmail,
    toRecipients,
    setToRecipients,
    ccRecipients,
    setCcRecipients,
    newToInput,
    setNewToInput,
    newCcInput,
    setNewCcInput,
    leadEmail,
    setLeadEmail,
    emailGreeting,
    setEmailGreeting,
    introduction,
    setIntroduction,
    confirmForwardChecked,
    setConfirmForwardChecked,
    toastMsg,
    setToastMsg,
    columnList,
    setColumnList,
    hiddenColumns,
    setHiddenColumns,
    customColName,
    setCustomColName,
    customColPosition,
    setCustomColPosition,
    headerColor,
    setHeaderColor,
    draggedColIndex,
    setDraggedColIndex,
    dragOverColIndex,
    setDragOverColIndex,
    selectedColIndex,
    setSelectedColIndex,
    storedRole,
    activeRole,
    normalizedRole,
    isSuperAdminOrAdmin,
    isLead,
    isLeadOrAdmin,
    currentReqId,
    isLeadApproved,
    isApprovalRequested,
    CLIENT_TRACKER_PRESETS,
    defaultPreset,
    isDraggingRef,
    draggedColIndexRef,
    showToast,
  }
}
export type SubmitToLeadVmState = ReturnType<typeof useSubmitToLeadPageState>
