import type { ClientGapAnalysisProps } from './preamble'
import { useClientDeliveryGapState } from './useClientDeliveryGapState'
import { useClientDeliveryGapHandlers } from './useClientDeliveryGapHandlers'

export function useClientDeliveryGap(props: ClientGapAnalysisProps) {
  const s = useClientDeliveryGapState(props)
  const h1 = useClientDeliveryGapHandlers(s)
  return { ...s, ...h1 }
}

export type ClientGapVm = ReturnType<typeof useClientDeliveryGap>
