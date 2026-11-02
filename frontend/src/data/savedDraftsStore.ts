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

const STORAGE_KEY = 'mrap_saved_drafts_v1'

let draftsMemory: SavedDraftItem[] | null = null

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readFromStorage(): SavedDraftItem[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedDraftItem[]) : []
  } catch {
    return []
  }
}

function writeToStorage(items: SavedDraftItem[]) {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota / private mode — keep in-memory copy for the session.
  }
}

function ensureLoaded(): SavedDraftItem[] {
  // Don't cache an empty list during SSR — re-read once we are in the browser.
  if (!canUseStorage()) return draftsMemory ?? []
  if (draftsMemory === null) {
    draftsMemory = readFromStorage()
  }
  return draftsMemory
}

export function getSavedDrafts(): SavedDraftItem[] {
  return ensureLoaded()
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
  draftsMemory = [newItem, ...current]
  writeToStorage(draftsMemory)
  return newItem
}

export function removeSavedDraft(id: string): SavedDraftItem[] {
  draftsMemory = getSavedDrafts().filter(item => item.id !== id)
  writeToStorage(draftsMemory)
  return draftsMemory
}
