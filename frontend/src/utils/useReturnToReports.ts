import { useEffect, useState } from 'react'
import {
  SIDEBAR_NAV_EVENT,
  hasReturnToReportsAnalytics,
} from './notificationNavigation'

/** True only after a reports drill-down. A direct sidebar click clears it. */
export function useReturnToReports(): boolean {
  const [show, setShow] = useState(() => hasReturnToReportsAnalytics())

  useEffect(() => {
    const sync = () => setShow(hasReturnToReportsAnalytics())
    window.addEventListener(SIDEBAR_NAV_EVENT, sync)
    window.addEventListener('notification_navigate', sync)
    return () => {
      window.removeEventListener(SIDEBAR_NAV_EVENT, sync)
      window.removeEventListener('notification_navigate', sync)
    }
  }, [])

  return show
}
