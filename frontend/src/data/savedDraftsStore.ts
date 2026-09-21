export interface SavedDraftItem {
  id: string
  type: 'candidate' | 'requirement'
  title: string
  subtitle: string
  savedAt: string
  createdBy: string
  status?: string
  data: any
}

const INITIAL_DRAFTS: SavedDraftItem[] = [
  {
    id: 'DRAFT-101',
    type: 'candidate',
    title: 'Ananya Verma',
    subtitle: 'Full Stack React & Node.js Lead • 6 Years Exp • Current: TCS (18 LPA)',
    savedAt: '26 Aug 2026, 04:15 PM',
    createdBy: 'Harish Gadipally',
    status: 'Draft Profile',
    data: {
      candidateName: 'Ananya Verma',
      currentCompany: 'TCS',
      contactNumber: '+91 97112 88401',
      email: 'ananya.verma@gmail.com',
      qualification: 'B.Tech IT, NIT Warangal',
      skills: 'React, TypeScript, Node.js, Express, PostgreSQL, AWS, Docker',
      technologies: 'Full Stack Web Development',
      totalExperience: '6 Years',
      relevantExperience: '5.5 Years',
      currentCtc: '18 LPA',
      expectedCtc: '24 LPA',
      noticePeriod: '30 Days',
      currentLocation: 'Hyderabad',
      preferredLocation: 'Hyderabad / Remote',
      interviewAvailability: 'Available weekdays after 5 PM',
      offerInHand: 'No',
      reasonForChange: 'Looking for product-based company',
      notes: 'Draft saved for client submission after salary budget approval.',
    },
  },
  {
    id: 'DRAFT-102',
    type: 'requirement',
    title: 'REQ-2026-08-25-009 — Cloud DevOps & SRE Architect',
    subtitle: 'Client: Accenture • Openings: 2 • Budget: ₹32,00,000 PA • Priority: High',
    savedAt: '25 Aug 2026, 11:30 AM',
    createdBy: 'Harish Gadipally',
    status: 'Draft Demand',
    data: {
      reqId: 'REQ-2026-08-25-009',
      jobTitle: 'Cloud DevOps & SRE Architect',
      client: 'Accenture',
      priority: 'High',
      openings: 2,
      yearlyBudget: '3200000',
      mandatorySkills: ['Kubernetes', 'Terraform', 'AWS SRE', 'CI/CD Pipelines'],
      location: 'Bengaluru / Remote',
    },
  },
]

const DRAFTS_STORAGE_KEY = 'metaforge_saved_drafts_v1'

export function getSavedDrafts(): SavedDraftItem[] {
  try {
    const data = localStorage.getItem(DRAFTS_STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Error loading saved drafts:', e)
  }
  // Fallback to initial mock drafts
  return INITIAL_DRAFTS
}

export function saveDraftItem(item: Omit<SavedDraftItem, 'id' | 'savedAt'>): SavedDraftItem {
  const current = getSavedDrafts()
  const newItem: SavedDraftItem = {
    ...item,
    id: `DRAFT-${Date.now()}`,
    savedAt: new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
  const updated = [newItem, ...current]
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Error saving draft:', e)
  }
  return newItem
}

export function removeSavedDraft(id: string): SavedDraftItem[] {
  const current = getSavedDrafts()
  const updated = current.filter(item => item.id !== id)
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Error removing draft:', e)
  }
  return updated
}
