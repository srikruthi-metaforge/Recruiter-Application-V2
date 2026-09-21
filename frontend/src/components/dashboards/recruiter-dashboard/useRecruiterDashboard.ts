import type { Props } from './preamble'
import { useRecruiterDashboardState } from './useRecruiterDashboardState'
import { useRecruiterDashboardHandlers } from './useRecruiterDashboardHandlers'

export function useRecruiterDashboard(props: Props) {
  const s = useRecruiterDashboardState(props)
  const h1 = useRecruiterDashboardHandlers(s)
  return { ...s, ...h1 }
}

export type RecruiterDashboardVm = ReturnType<typeof useRecruiterDashboard>
