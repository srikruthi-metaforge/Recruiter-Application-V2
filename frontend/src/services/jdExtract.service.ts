import { api } from '../lib/api'

export type JdExtractFormFields = {
  jobTitle?: string
  clientLeadPoc?: string
  clientPoc?: string
  location?: string
  experience?: string
  experienceLevel?: string
  noticePeriod?: string
  skills?: string[]
  technologies?: string[]
  primarySkills?: string[]
  secondarySkills?: string[]
  primary_skills?: string[]
  secondary_skills?: string[]
  positions?: number
  employmentType?: 'Full-time' | 'Contract'
  workMode?: string
  budget?: string
  budgetAmountInr?: number
  budgetCurrency?: string
  priority?: 'High' | 'Medium' | 'Low'
  demandType?: 'Single' | 'Multiple' | 'Bulk'
  submittingTo?: string
  jdDescription?: string
  extractionSource?: string
  totalRolesDetected?: number
  roleTitle?: string
  usedFallbackParser?: boolean
}

type ExtractResponse = {
  success?: boolean
  message?: string
  data?: JdExtractFormFields
}

/** Extract form fields from pasted JD text via Nest JD parser. */
export async function extractJdFromText(text: string): Promise<JdExtractFormFields> {
  const result = await api.post<ExtractResponse>('/jd-parser/extract', { text: text.trim() })
  if (!result?.data || typeof result.data !== 'object') {
    throw new Error('Invalid extraction response from server')
  }
  return result.data
}

/** Extract form fields from an uploaded JD document (PDF/DOCX). */
export async function extractJdFromFile(file: File): Promise<JdExtractFormFields> {
  const form = new FormData()
  form.append('file', file)
  const result = await api.upload<ExtractResponse>('/jd-parser/extract', form)
  if (!result?.data || typeof result.data !== 'object') {
    throw new Error('Invalid extraction response from server')
  }
  return result.data
}
