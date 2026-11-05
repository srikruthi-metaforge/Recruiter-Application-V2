/** Tab-scoped form draft helpers (sessionStorage). Survives refresh; clears when the tab closes. */

function canUseSession(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export function readSessionDraft<T>(key: string): T | null {
  if (!canUseSession()) return null
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeSessionDraft(key: string, value: unknown): void {
  if (!canUseSession()) return
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / private mode
  }
}

export function clearSessionDraft(key: string): void {
  if (!canUseSession()) return
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const CANDIDATE_FORM_SESSION_KEY = 'mrap_candidate_form_session_v1'
export const JD_CREATE_FORM_SESSION_KEY = 'mrap_jd_create_form_session_v1'
export const JD_EDIT_FORM_SESSION_PREFIX = 'mrap_jd_edit_form_session_v1:'
export const REQ_CREATING_SESSION_KEY = 'mrap_req_creating_demand_v1'
export const REQ_EDITING_ID_SESSION_KEY = 'mrap_req_editing_demand_id_v1'
export const CANDIDATE_VIEW_MODE_SESSION_KEY = 'mrap_candidate_view_mode_v1'

export function jdEditFormSessionKey(requirementId: string): string {
  return `${JD_EDIT_FORM_SESSION_PREFIX}${String(requirementId || '').trim()}`
}
