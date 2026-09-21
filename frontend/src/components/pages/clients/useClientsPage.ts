import type { ClientsPageProps } from './preamble'
import { useClientsPageState } from './useClientsPageState'
import { useClientsPageHandlers } from './useClientsPageHandlers'

export function useClientsPage(props: ClientsPageProps) {
  const s = useClientsPageState(props)
  const h1 = useClientsPageHandlers(s)
  return { ...s, ...h1 }
}

export type ClientsVm = ReturnType<typeof useClientsPage>
