import React from 'react'
import { Requirement } from '../../../types'
import type { CreateJobDemandVmState } from './useCreateJobDemandFormState'
import { extractJdFromFile, extractJdFromText, type JdExtractFormFields } from '../../../services/jdExtract.service'

function titleCaseClientSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function mapRelevantExperience(level?: string): string | null {
  if (!level?.trim()) return null
  const v = level.trim().toLowerCase()
  if (v.includes('entry') || v.includes('junior')) return 'Entry Level'
  if (v.includes('executive') || v.includes('director') || v.includes('principal')) return 'Executive'
  if (v.includes('senior') || v.includes('lead')) return 'Senior'
  if (v.includes('mid')) return 'Mid Senior'
  return level.trim()
}

function mapBudgetCurrency(raw?: string): string | null {
  if (!raw?.trim()) return null
  const v = raw.trim().toUpperCase()
  if (v.includes('USD') || v === '$') return 'USD ($)'
  if (v.includes('EUR') || v === '€') return 'EUR (€)'
  if (v.includes('GBP') || v === '£') return 'GBP (£)'
  if (v.includes('INR') || v.includes('₹') || v === 'RS') return 'INR (₹)'
  return null
}

function skillList(data: JdExtractFormFields, kind: 'primary' | 'secondary'): string[] {
  if (kind === 'primary') {
    return (
      data.primarySkills ||
      data.primary_skills ||
      data.skills ||
      data.technologies ||
      []
    ).map((s) => String(s).trim()).filter(Boolean)
  }
  return (
    data.secondarySkills ||
    data.secondary_skills ||
    []
  ).map((s) => String(s).trim()).filter(Boolean)
}

export function useCreateJobDemandFormHandlers(s: CreateJobDemandVmState) {
  const {
    onSubmit, initialData, reqId, demandDate,
    requirementFrom, customCompany, clientLeadPoc, toEmails, ccEmails, jobTitle,
    setJobTitle, jobStatus, priority, openings,
    yearlyBudget, budgetCurrency, locationInput, setLocationInput, locations,
    setLocations, mandatorySkillInput, setMandatorySkillInput, mandatorySkills,
    setMandatorySkills, skillInput, setSkillInput, skills,
    setSkills, jdText, jdFile, setJdText, setIsExtracting, showToast,
    setClientLeadPoc, setClientPoc, setOverallExp, setRelevantExp, setNoticePeriod,
    setOpenings, setEmploymentType, setWorkMode, setYearlyBudget, setBudgetCurrency,
    setPriority, setTypeOfDemand, setRequirementFrom, setCustomCompany,
  } = s
  const handleAddLocation = () => {
    if (locationInput.trim()) {
      setLocations([...locations, locationInput.trim()])
      setLocationInput('')
    }
  }

  const handleAddMandatorySkill = () => {
    if (mandatorySkillInput.trim()) {
      const newSkills = mandatorySkillInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      setMandatorySkills([...mandatorySkills, ...newSkills])
      setMandatorySkillInput('')
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const newSkills = skillInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
      setSkills([...skills, ...newSkills])
      setSkillInput('')
    }
  }

  const applyExtractedFields = (data: JdExtractFormFields) => {
    const filled: string[] = []

    if (data.jobTitle?.trim()) {
      setJobTitle(data.jobTitle.trim())
      filled.push('job title')
    }
    if (data.clientLeadPoc?.trim()) {
      setClientLeadPoc(data.clientLeadPoc.trim())
      filled.push('client lead POC')
    }
    if (data.clientPoc?.trim()) {
      setClientPoc(data.clientPoc.trim())
      filled.push('client POC')
    }
    if (data.submittingTo?.trim()) {
      const company = titleCaseClientSlug(data.submittingTo)
      setRequirementFrom('Other')
      setCustomCompany(company)
      filled.push('company')
    }
    if (data.location?.trim()) {
      const locs = data.location.split(/[,;/|]/).map((x) => x.trim()).filter(Boolean)
      if (locs.length) {
        setLocations(locs)
        filled.push('location')
      }
    }
    if (data.experience?.trim()) {
      setOverallExp(data.experience.trim())
      filled.push('overall experience')
    }
    const rel = mapRelevantExperience(data.experienceLevel)
    if (rel) {
      setRelevantExp(rel)
      filled.push('relevant experience')
    }
    if (data.noticePeriod?.trim()) {
      setNoticePeriod(data.noticePeriod.trim())
      filled.push('notice period')
    }
    if (typeof data.positions === 'number' && data.positions >= 1) {
      setOpenings(data.positions)
      filled.push('positions')
    }
    if (data.employmentType) {
      setEmploymentType(data.employmentType)
      filled.push('employment type')
    }
    if (data.workMode?.trim()) {
      setWorkMode(data.workMode.trim())
      filled.push('work mode')
    }
    if (typeof data.budgetAmountInr === 'number' && data.budgetAmountInr > 0) {
      setYearlyBudget(String(data.budgetAmountInr))
      filled.push('budget')
    } else if (data.budget?.trim() && /\d/.test(data.budget)) {
      const digits = data.budget.replace(/[^0-9]/g, '')
      if (digits) {
        setYearlyBudget(digits)
        filled.push('budget')
      }
    }
    const currency = mapBudgetCurrency(data.budgetCurrency)
    if (currency) setBudgetCurrency(currency)
    if (data.priority) {
      setPriority(data.priority)
      filled.push('priority')
    }
    if (data.demandType) {
      setTypeOfDemand(data.demandType)
      filled.push('demand type')
    }

    const primary = skillList(data, 'primary')
    if (primary.length) {
      setMandatorySkills(primary)
      filled.push('mandatory skills')
    }
    const secondary = skillList(data, 'secondary')
    if (secondary.length) {
      setSkills(secondary)
      filled.push('skills')
    }

    if (data.jdDescription?.trim() && !jdText.trim()) {
      setJdText(data.jdDescription.trim())
    }

    // Prefer internal POC from submitting metadata when present as email-like internal string
    if (data.roleTitle?.trim() && !data.jobTitle?.trim()) {
      setJobTitle(data.roleTitle.trim())
      if (!filled.includes('job title')) filled.push('job title')
    }

    return filled
  }

  const handleExtractAndAutoFill = async () => {
    const hasText = jdText.trim().length >= 50
    const hasFile = Boolean(jdFile)
    if (!hasText && !hasFile) {
      showToast('Paste JD text (min 50 chars) or upload a PDF/DOCX, then click Extract & Auto-fill.')
      return
    }

    setIsExtracting(true)
    try {
      const data = hasFile && jdFile
        ? await extractJdFromFile(jdFile)
        : await extractJdFromText(jdText)
      const filled = applyExtractedFields(data)
      const note = data.usedFallbackParser ? ' (rule-based fallback)' : ''
      const roles =
        typeof data.totalRolesDetected === 'number' && data.totalRolesDetected > 1
          ? ` Detected ${data.totalRolesDetected} roles — filled the first.`
          : ''
      showToast(
        filled.length
          ? `Filled ${filled.join(', ')}${note}.${roles}`
          : `Extraction finished${note}, but no mappable fields were found.${roles}`,
      )
    } catch (err: any) {
      showToast(err?.message || 'JD extraction failed. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle.trim()) {
      showToast('Please specify a Job Title.')
      return
    }

    const finalClient = requirementFrom === 'Other' ? customCompany || 'Other' : requirementFrom
    const currencyCode = /USD|\$/i.test(budgetCurrency || '')
      ? 'USD'
      : /EUR|€/i.test(budgetCurrency || '')
        ? 'EUR'
        : 'INR'
    const currencySymbol = currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : '₹'
    const budgetAmount = Number(String(yearlyBudget || '').replace(/[^0-9.]/g, '')) || 0
    const budgetDisplay = budgetAmount > 0
      ? `${currencySymbol}${budgetAmount}`
      : (initialData?.budget || '')

    const updatedReq: Requirement = {
      ...(initialData || {} as any),
      id: reqId || `REQ-${Date.now().toString().slice(-6)}`,
      client: finalClient,
      title: jobTitle,
      priority: priority,
      status: jobStatus === 'Closed' ? 'Closed' : (initialData?.status || 'Active'),
      assignmentStatus: initialData?.assignmentStatus || (jobStatus === 'Assigned' ? 'Assigned' : 'Unassigned'),
      owner: initialData?.owner || 'Unassigned',
      submissions: initialData?.submissions || 0,
      interviews: initialData?.interviews || 0,
      placed: initialData?.placed || 0,
      rejections: initialData?.rejections || 0,
      clientEmail: clientLeadPoc || initialData?.clientEmail || '',
      toEmails: Array.isArray(toEmails) ? toEmails : [],
      ccEmails: Array.isArray(ccEmails) ? ccEmails : [],
      clientPhone: initialData?.clientPhone || '',
      location: locations.join(', ') || locationInput || '',
      openings: openings || 1,
      dueDate: demandDate || new Date().toISOString().split('T')[0],
      emailArrivedTime: initialData?.emailArrivedTime || '',
      budget: budgetDisplay,
      skills: mandatorySkills,
      ...(budgetAmount > 0
        ? {
            budgetRange: { min: budgetAmount, max: budgetAmount, currency: currencyCode },
            budgetText: budgetDisplay,
          }
        : {}),
    }

    try {
      await onSubmit(updatedReq)
    } catch (err: any) {
      showToast(err?.message || 'Failed to create requirement. Please try again.')
      throw err
    }
  }

  return {
    handleAddLocation, handleAddMandatorySkill, handleAddSkill, handleExtractAndAutoFill,
    handleSubmit
  }
}
