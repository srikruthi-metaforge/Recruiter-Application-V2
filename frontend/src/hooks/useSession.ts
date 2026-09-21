'use client'

import { getSessionUser, SessionUser } from '../store/session'
import { useEffect, useState } from 'react'

/** Client session helper — does not replace existing App.tsx role state. */
export function useSession(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null)
  useEffect(() => {
    setUser(getSessionUser())
  }, [])
  return user
}
