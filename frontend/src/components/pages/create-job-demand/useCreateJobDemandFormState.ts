import type { CreateJobDemandFormProps } from './preamble'
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import { getClientEmailDefaults, isAccentureClient, sanitizeEmailList } from '../../../config/clientEmailDefaults'
import {
  JD_CREATE_FORM_SESSION_KEY,
  clearSessionDraft,
  jdEditFormSessionKey,
  readSessionDraft,
  writeSessionDraft,
} from '../../../lib/formSessionDraft'

type JdFormSessionDraft = {
  reqId?: string
  demandDate?: string
  internalPoc?: string
  requirementFrom?: string
  customCompany?: string
  toEmails?: string[]
  ccEmails?: string[]
  clientLeadPoc?: string
  clientPoc?: string
  jobTitle?: string
  jobStatus?: string
  closedDate?: string
  typeOfDemand?: string
  priority?: 'High' | 'Medium' | 'Low'
  openings?: number
  relevantExp?: string
  employmentType?: string
  workMode?: string
  budgetCurrency?: string
  yearlyBudget?: string
  locationInput?: string
  locations?: string[]
  overallExp?: string
  noticePeriod?: string
  mandatorySkills?: string[]
  skills?: string[]
  rolesAndResponsibilities?: string
  jdDescription?: string
  jdText?: string
}

export function useCreateJobDemandFormState(props: CreateJobDemandFormProps) {
  const {
  onCancel,
  onSubmit,
  userRole = 'Recruiter View',
  mode = 'create',
  initialData = null,
}: CreateJobDemandFormProps = props as CreateJobDemandFormProps & Record<string, never>
  const isEdit = mode === 'edit' || !!initialData
  const draftKey = isEdit && initialData?.id
    ? jdEditFormSessionKey(String(initialData.id))
    : JD_CREATE_FORM_SESSION_KEY
  const sessionDraft = useRef(
    typeof window !== 'undefined' ? readSessionDraft<JdFormSessionDraft>(draftKey) : null,
  ).current
  const skipClientEmailDefaultsRef = useRef(Boolean(sessionDraft))

  // Form State — prefer session draft (user corrections) over parse/initial defaults
  const [reqId, setReqId] = useState(
    () => sessionDraft?.reqId || initialData?.id || `REQ-${new Date().toISOString().split('T')[0]}-001`,
  )
  const [demandDate, setDemandDate] = useState(
    () => sessionDraft?.demandDate || initialData?.dueDate || new Date().toISOString().split('T')[0],
  )
  const [internalPoc, setInternalPoc] = useState(
    () => sessionDraft?.internalPoc || initialData?.assignedLead || 'offshore demands',
  )
  const [requirementFrom, setRequirementFrom] = useState(
    () => sessionDraft?.requirementFrom || initialData?.client || 'Other',
  )
  const [customCompany, setCustomCompany] = useState(
    () => sessionDraft?.customCompany || initialData?.client || '',
  )
  
  const [toEmails, setToEmails] = useState<string[]>(
    () => sessionDraft?.toEmails || initialData?.toEmails || [],
  )
  const [ccEmails, setCcEmails] = useState<string[]>(
    () => sessionDraft?.ccEmails || initialData?.ccEmails || [],
  )
  const [toEmailInput, setToEmailInput] = useState('')
  const [ccEmailInput, setCcEmailInput] = useState('')
  const [clientLeadPoc, setClientLeadPoc] = useState(
    () => sessionDraft?.clientLeadPoc || initialData?.clientEmail || '',
  )
  const [clientPoc, setClientPoc] = useState(
    () => sessionDraft?.clientPoc || initialData?.clientEmail || '',
  )
  useEffect(() => {
    if (skipClientEmailDefaultsRef.current) {
      skipClientEmailDefaultsRef.current = false
      return
    }
    const finalClient = requirementFrom === 'Other' ? customCompany : requirementFrom
    const defaults = getClientEmailDefaults(finalClient)
    if (defaults) {
      if (defaults.requirement.from) {
        setClientLeadPoc(defaults.requirement.from)
      }
      setToEmails(sanitizeEmailList(defaults.requirement.to))
      setCcEmails(sanitizeEmailList(defaults.requirement.cc))
    } else if (isAccentureClient(initialData?.client) && !isAccentureClient(finalClient)) {
      setToEmails([])
      setCcEmails([])
    }
  }, [requirementFrom, customCompany])

  const handleAddToEmail = () => {
    if (toEmailInput.trim() && toEmailInput.includes('@')) {
      setToEmails(prev => sanitizeEmailList([...prev, toEmailInput.trim()]))
      setToEmailInput('')
    }
  }

  const handleRemoveToEmail = (email: string) => {
    setToEmails(prev => prev.filter(e => e.toLowerCase() !== email.trim().toLowerCase()))
  }

  const handleAddCcEmail = () => {
    if (ccEmailInput.trim() && ccEmailInput.includes('@')) {
      setCcEmails(prev => sanitizeEmailList([...prev, ccEmailInput.trim()]))
      setCcEmailInput('')
    }
  }

  const handleRemoveCcEmail = (email: string) => {
    setCcEmails(prev => prev.filter(e => e.toLowerCase() !== email.trim().toLowerCase()))
  }


  const [jobTitle, setJobTitle] = useState(
    () => sessionDraft?.jobTitle || initialData?.title || '',
  )
  const [jobStatus, setJobStatus] = useState(
    () => sessionDraft?.jobStatus || (initialData?.status === 'Closed' ? 'Closed' : 'Open'),
  )
  const [closedDate, setClosedDate] = useState(() => sessionDraft?.closedDate || '')
  const [typeOfDemand, setTypeOfDemand] = useState(
    () =>
      sessionDraft?.typeOfDemand ||
      (initialData?.openings && initialData.openings > 1 ? 'Multiple' : 'Single'),
  )
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(
    () => sessionDraft?.priority || initialData?.priority || 'Low',
  )

  const [openings, setOpenings] = useState<number>(
    () => sessionDraft?.openings ?? initialData?.openings ?? 1,
  )
  const [relevantExp, setRelevantExp] = useState(
    () => sessionDraft?.relevantExp || 'Select relevant experience',
  )
  const [employmentType, setEmploymentType] = useState(
    () => sessionDraft?.employmentType || 'Full-time',
  )
  const [workMode, setWorkMode] = useState(() => sessionDraft?.workMode || 'On-site')
  const [budgetCurrency, setBudgetCurrency] = useState(
    () => sessionDraft?.budgetCurrency || 'INR (₹)',
  )
  const [yearlyBudget, setYearlyBudget] = useState(
    () =>
      sessionDraft?.yearlyBudget ||
      (initialData?.budget ? initialData.budget.replace(/[^0-9]/g, '') : ''),
  )
  const [locationInput, setLocationInput] = useState(() => sessionDraft?.locationInput || '')
  const [locations, setLocations] = useState<string[]>(
    () =>
      sessionDraft?.locations ||
      (initialData?.location
        ? initialData.location.split(/[,;/|]/).map(s => s.trim()).filter(Boolean)
        : []),
  )
  const [overallExp, setOverallExp] = useState(
    () => sessionDraft?.overallExp || initialData?.experience || '',
  )
  const [noticePeriod, setNoticePeriod] = useState(
    () => sessionDraft?.noticePeriod || initialData?.noticePeriod || '',
  )

  const [mandatorySkillInput, setMandatorySkillInput] = useState('')
  // Do not pre-fill sample skills — only populate after JD parse (or from edit initialData).
  const [mandatorySkills, setMandatorySkills] = useState<string[]>(
    () => sessionDraft?.mandatorySkills || initialData?.mandatorySkills || initialData?.skills || [],
  )

  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(() => {
    if (sessionDraft?.skills) return sessionDraft.skills
    return initialData?.skills && initialData?.mandatorySkills
      ? initialData.skills.filter(
          s => !(initialData.mandatorySkills || []).some(m => m.toLowerCase() === s.toLowerCase()),
        )
      : []
  })

  /** Filled only after JD Extract & Auto-fill — persisted on create, no UI field yet. */
  const [rolesAndResponsibilities, setRolesAndResponsibilities] = useState(
    () => sessionDraft?.rolesAndResponsibilities || initialData?.rolesAndResponsibilities || '',
  )
  const [jdDescription, setJdDescription] = useState(
    () => sessionDraft?.jdDescription || initialData?.description || '',
  )

  const [jdText, setJdText] = useState(() => sessionDraft?.jdText || '')
  const [jdFile, setJdFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Autosave so refresh keeps corrected JD fields and stays usable on create/edit
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasContent = Boolean(
        jobTitle.trim() ||
          jdText.trim() ||
          jdDescription.trim() ||
          mandatorySkills.length ||
          skills.length ||
          locations.length ||
          rolesAndResponsibilities.trim(),
      )
      if (!hasContent && !isEdit) {
        clearSessionDraft(draftKey)
        return
      }
      writeSessionDraft(draftKey, {
        reqId,
        demandDate,
        internalPoc,
        requirementFrom,
        customCompany,
        toEmails,
        ccEmails,
        clientLeadPoc,
        clientPoc,
        jobTitle,
        jobStatus,
        closedDate,
        typeOfDemand,
        priority,
        openings,
        relevantExp,
        employmentType,
        workMode,
        budgetCurrency,
        yearlyBudget,
        locationInput,
        locations,
        overallExp,
        noticePeriod,
        mandatorySkills,
        skills,
        rolesAndResponsibilities,
        jdDescription,
        jdText,
      } satisfies JdFormSessionDraft)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [
    draftKey,
    isEdit,
    reqId,
    demandDate,
    internalPoc,
    requirementFrom,
    customCompany,
    toEmails,
    ccEmails,
    clientLeadPoc,
    clientPoc,
    jobTitle,
    jobStatus,
    closedDate,
    typeOfDemand,
    priority,
    openings,
    relevantExp,
    employmentType,
    workMode,
    budgetCurrency,
    yearlyBudget,
    locationInput,
    locations,
    overallExp,
    noticePeriod,
    mandatorySkills,
    skills,
    rolesAndResponsibilities,
    jdDescription,
    jdText,
  ])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Handle Add Location
  return {
    onCancel,
    onSubmit,
    userRole,
    mode,
    initialData,
    reqId,
    setReqId,
    demandDate,
    setDemandDate,
    internalPoc,
    setInternalPoc,
    requirementFrom,
    setRequirementFrom,
    customCompany,
    setCustomCompany,
    clientLeadPoc,
    setClientLeadPoc,
    clientPoc,
    setClientPoc,
    toEmails,
    setToEmails,
    ccEmails,
    setCcEmails,
    toEmailInput,
    setToEmailInput,
    ccEmailInput,
    setCcEmailInput,
    handleAddToEmail,
    handleRemoveToEmail,
    handleAddCcEmail,
    handleRemoveCcEmail,
    jobTitle,
    setJobTitle,
    jobStatus,
    setJobStatus,
    closedDate,
    setClosedDate,
    typeOfDemand,
    setTypeOfDemand,
    priority,
    setPriority,
    openings,
    setOpenings,
    relevantExp,
    setRelevantExp,
    employmentType,
    setEmploymentType,
    workMode,
    setWorkMode,
    budgetCurrency,
    setBudgetCurrency,
    yearlyBudget,
    setYearlyBudget,
    locationInput,
    setLocationInput,
    locations,
    setLocations,
    overallExp,
    setOverallExp,
    noticePeriod,
    setNoticePeriod,
    mandatorySkillInput,
    setMandatorySkillInput,
    mandatorySkills,
    setMandatorySkills,
    skillInput,
    setSkillInput,
    skills,
    setSkills,
    rolesAndResponsibilities,
    setRolesAndResponsibilities,
    jdDescription,
    setJdDescription,
    jdText,
    setJdText,
    jdFile,
    setJdFile,
    isExtracting,
    setIsExtracting,
    toastMsg,
    setToastMsg,
    isEdit,
    showToast,
  }
}
export type CreateJobDemandVmState = ReturnType<typeof useCreateJobDemandFormState>
