import type { AddCandidatePageProps } from './preamble'
import { useAddCandidatePageState } from './useAddCandidatePageState'
import { useAddCandidatePageHandlers1 } from './useAddCandidatePageHandlers1'
import { useAddCandidatePageHandlers2 } from './useAddCandidatePageHandlers2'

export function useAddCandidatePage(props: AddCandidatePageProps) {
  const s = useAddCandidatePageState(props)
  const h1 = useAddCandidatePageHandlers1(s)
  const h2 = useAddCandidatePageHandlers2(s)
  return { ...s, ...h1, ...h2 }
}

export type AddCandidateVm = ReturnType<typeof useAddCandidatePage>
