'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from '../../components/common/ErrorBoundary'

const App = dynamic(() => import('../../features/app'), { ssr: false })

/**
 * Catch-all so SPA routes like /requirements, /addcandidates work on refresh
 * and deep links. Inner navigation is still state-based (ROLE_NAV) and synced to the URL.
 */
export default function SpaCatchAllPage() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
