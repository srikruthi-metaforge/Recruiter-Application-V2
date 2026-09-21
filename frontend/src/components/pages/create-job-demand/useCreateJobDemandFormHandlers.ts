import React from 'react'
import { Requirement } from '../../../types'
import type { CreateJobDemandVmState } from './useCreateJobDemandFormState'

export function useCreateJobDemandFormHandlers(s: CreateJobDemandVmState) {
  const {
    onSubmit, initialData, reqId, demandDate,
    requirementFrom, customCompany, clientLeadPoc, jobTitle,
    setJobTitle, jobStatus, priority, openings,
    yearlyBudget, locationInput, setLocationInput, locations,
    setLocations, mandatorySkillInput, setMandatorySkillInput, mandatorySkills,
    setMandatorySkills, skillInput, setSkillInput, skills,
    setSkills, jdText, setIsExtracting, showToast
  } = s
  const handleAddLocation = () => {
    if (locationInput.trim()) {
      setLocations([...locations, locationInput.trim()])
      setLocationInput('')
    }
  }

  // Handle Add Mandatory Skill
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

  // Handle Add Skill
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

  // Simulated AI JD Extraction
  const handleExtractAndAutoFill = () => {
    if (!jdText.trim()) {
      showToast('Please paste JD text or upload a document to extract.')
      return
    }
    setIsExtracting(true)
    setTimeout(() => {
      setIsExtracting(false)
      if (!jobTitle) setJobTitle('Senior Data Engineer (AI/ML)')
      if (mandatorySkills.length === 0) setMandatorySkills(['Python', 'PySpark', 'SQL', 'Azure'])
      if (skills.length === 0) setSkills(['Problem Solving', 'Agile', 'ETL Pipelines'])
      showToast('Extracted & auto-filled details from JD text successfully!')
    }, 1200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobTitle.trim()) {
      showToast('Please specify a Job Title.')
      return
    }

    const finalClient = requirementFrom === 'Other' ? customCompany || 'Other' : requirementFrom

    const updatedReq: Requirement = {
      ...(initialData || {} as any),
      id: reqId || `REQ-${Date.now().toString().slice(-6)}`,
      client: finalClient,
      title: jobTitle,
      priority: priority,
      status: jobStatus === 'Closed' ? 'Closed' : (initialData?.status || 'Active'),
      assignmentStatus: initialData?.assignmentStatus || (jobStatus === 'Assigned' ? 'Assigned' : 'Unassigned'),
      owner: initialData?.owner || (jobStatus === 'Assigned' ? 'Harish Gadipally' : 'Unassigned'),
      submissions: initialData?.submissions || 7,
      interviews: initialData?.interviews || 0,
      placed: initialData?.placed || 0,
      rejections: initialData?.rejections || 0,
      clientEmail: clientLeadPoc || `${finalClient.toLowerCase()}@client.com`,
      clientPhone: '+91 98765 43210',
      location: locations.join(', ') || locationInput || 'Remote',
      openings: openings || 1,
      dueDate: demandDate || new Date().toISOString().split('T')[0],
      emailArrivedTime: initialData?.emailArrivedTime || `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, 05:30 AM`,
      budget: yearlyBudget ? `₹${yearlyBudget}` : '₹1,400,000',
      skills: mandatorySkills,
    }

    onSubmit(updatedReq)
  }

  return {
    handleAddLocation, handleAddMandatorySkill, handleAddSkill, handleExtractAndAutoFill,
    handleSubmit
  }
}
