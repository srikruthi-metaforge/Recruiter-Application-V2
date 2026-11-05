import { QueryClient } from '@tanstack/react-query'
import { getSessionUser } from '../store/session'
import { saveSubmissionsStore } from '../data/submissionsStore'
import { workspaceService, candidatesService, type WorkspacePayload } from '../services/workspace.service'
import { getQueryClient } from './queryClient'
import {
  CANDIDATE_PREFETCH_PARAMS,
  CANDIDATE_STALE_MS,
  NOTIFICATION_IDLE_MS,
  WORKSPACE_STALE_MS,
  queryKeys,
} from './queryKeys'
import { fetchNotificationList } from './notificationCache'

export const WORKSPACE_FRESH_MS = WORKSPACE_STALE_MS

type LoadOpts = { force?: boolean }
type WorkspaceListener = (payload: WorkspacePayload) => void

let listener: WorkspaceListener | null = null

export function emptyWorkspace(): WorkspacePayload {
  return {
    requirements: [],
    submissions: [],
    interviews: [],
    recruiters: [],
    leads: [],
    admins: [],
    activityLogs: [],
    candidates: [],
    clients: [],
    teams: [],
    users: [],
  }
}

/** Mirrors a cache write into the submissions store without firing submissions_updated. */
function publishWorkspace(payload: WorkspacePayload) {
  saveSubmissionsStore(payload.submissions || [], { silent: true })
  listener?.(payload)
}

export function readWorkspace(client: QueryClient, userId: string): WorkspacePayload | undefined {
  return client.getQueryData<WorkspacePayload>(queryKeys.workspace(userId))
}

export function updateWorkspace(
  client: QueryClient,
  userId: string,
  updater: (current: WorkspacePayload) => WorkspacePayload,
): WorkspacePayload {
  const next = updater(readWorkspace(client, userId) ?? emptyWorkspace())
  client.setQueryData(queryKeys.workspace(userId), next)
  return next
}

/** Optimistic edit of the signed-in user's workspace. No network call. */
export function patchWorkspace(updater: (current: WorkspacePayload) => WorkspacePayload) {
  const id = getSessionUser()?.id
  if (!id) return
  const next = updateWorkspace(getQueryClient(), id, updater)
  publishWorkspace(next)
}

export async function fetchWorkspace(
  userId: string,
  opts?: LoadOpts,
  client: QueryClient = getQueryClient(),
): Promise<WorkspacePayload> {
  const queryKey = queryKeys.workspace(userId)
  if (opts?.force) {
    // A mutation that lands while a GET is in flight must not reuse that older response.
    await client.cancelQueries({ queryKey })
  }
  const payload = await client.fetchQuery({
    queryKey,
    staleTime: opts?.force ? 0 : WORKSPACE_STALE_MS,
    queryFn: ({ signal }) => workspaceService.load({ signal }),
  })
  publishWorkspace(payload)
  return payload
}

export function prefetchWorkspace(userId: string, client: QueryClient = getQueryClient()) {
  return client.prefetchQuery({
    queryKey: queryKeys.workspace(userId),
    staleTime: WORKSPACE_STALE_MS,
    queryFn: ({ signal }) => workspaceService.load({ signal }),
  })
}

export function prefetchNotifications(userId: string, client: QueryClient = getQueryClient()) {
  return client.prefetchQuery({
    queryKey: queryKeys.notifications(userId),
    staleTime: NOTIFICATION_IDLE_MS,
    queryFn: ({ signal }) => fetchNotificationList(signal),
  })
}

export function prefetchCandidateFirstPage(userId: string, client: QueryClient = getQueryClient()) {
  return client.prefetchQuery({
    queryKey: queryKeys.candidatePage(userId, CANDIDATE_PREFETCH_PARAMS),
    staleTime: CANDIDATE_STALE_MS,
    queryFn: ({ signal }) =>
      candidatesService.listPage({
        page: CANDIDATE_PREFETCH_PARAMS.page,
        limit: CANDIDATE_PREFETCH_PARAMS.limit,
        signal,
      }),
  })
}

/** Drop every cached query so the next user cannot see this tenant's data. */
export function resetWorkspaceRefresh(): void {
  const client = getQueryClient()
  void client.cancelQueries()
  client.clear()
}

/**
 * Optional mirror for the unused app controller.
 * The live shell reads the query cache directly and does not bind a second copy.
 */
export function bindWorkspaceLoader(fn: WorkspaceListener): () => void {
  listener = fn
  return () => {
    if (listener === fn) listener = null
  }
}

/** Force a reload by default so assignment and status changes are not swallowed by staleTime. */
export function requestWorkspaceRefresh(opts?: LoadOpts): Promise<void> {
  const id = getSessionUser()?.id
  if (!id) return Promise.resolve()
  return fetchWorkspace(id, { force: opts?.force !== false }).then(() => undefined)
}

export async function refreshWorkspace(
  apply: (payload: WorkspacePayload) => void,
  opts?: LoadOpts,
): Promise<void> {
  const id = getSessionUser()?.id
  if (!id) return
  const payload = await fetchWorkspace(id, opts)
  apply(payload)
}
