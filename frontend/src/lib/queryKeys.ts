/**
 * Cache keys are scoped by the signed-in user id.
 * Cookie auth is per user and per tenant; a shared key would show another user's workspace
 * after a login switch in the same tab.
 */
export const queryKeys = {
  workspace: (userId: string) => ['workspace', userId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  candidatePage: (
    userId: string,
    params: {
      mode: 'list' | 'sourced'
      page: number
      limit: number
      search: string
      createdBy: string
      sourcedBy: string
      from: string
      to: string
    },
  ) => ['candidates', userId, params] as const,
}

export const WORKSPACE_STALE_MS = 15_000
export const WORKSPACE_GC_MS = 30 * 60 * 1000
export const NOTIFICATION_FAST_MS = 8_000
export const NOTIFICATION_IDLE_MS = 30_000
export const NOTIFICATION_GC_MS = 10 * 60 * 1000
export const CANDIDATE_STALE_MS = 15_000
export const CANDIDATE_GC_MS = 10 * 60 * 1000

/** Default repository page. Prefetch uses this exact key so opening the page is a cache hit. */
export const CANDIDATE_PREFETCH_PARAMS = {
  mode: 'list' as const,
  page: 1,
  limit: 5,
  search: '',
  createdBy: '',
  sourcedBy: '',
  from: '',
  to: '',
}
