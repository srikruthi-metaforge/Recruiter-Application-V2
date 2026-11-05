import { QueryClient } from '@tanstack/react-query'
import { WORKSPACE_GC_MS, WORKSPACE_STALE_MS } from './queryKeys'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: WORKSPACE_STALE_MS,
        gcTime: WORKSPACE_GC_MS,
        // Phase 1 did not retry failed GETs. A retry would double traffic on outages.
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
    },
  })
}

let client: QueryClient | null = null

export function getQueryClient() {
  if (!client) client = createQueryClient()
  return client
}

/** Test helper so suites do not share the app singleton. */
export function setQueryClient(next: QueryClient | null) {
  client = next
}
