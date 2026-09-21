'use client'

import App from '../features/app'
import { ErrorBoundary } from '../components/common/ErrorBoundary'

/** Existing SPA shell — inner navigation remains state-based (ROLE_NAV). */
export default function HomePage() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
