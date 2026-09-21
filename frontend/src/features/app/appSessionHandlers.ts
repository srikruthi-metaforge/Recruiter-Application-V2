import type { Dispatch, SetStateAction } from 'react'
import { AuthScreen, Role } from '../../types'
import { logoutRemote } from '../../data/authService'
import { clearSession } from '../../store/session'

export function createLogoutHandler(setScreen: Dispatch<SetStateAction<AuthScreen>>, setActiveNav: Dispatch<SetStateAction<string>>) {
  return () => {
    void logoutRemote()
    clearSession()
    try {
      localStorage.removeItem('metaforge_session_active')
      localStorage.removeItem('metaforge_user_role')
      localStorage.removeItem('metaforge_active_nav')
      localStorage.removeItem('metaforge_reports_active_view')
      localStorage.removeItem('metaforge_candidate_view_mode')
    } catch (e) {
      // ignore
    }
    setScreen('landing')
    setActiveNav('Requirements')
  }
}

export function createAuthenticatedHandler(
  setRole: Dispatch<SetStateAction<Role>>,
  setActiveNav: Dispatch<SetStateAction<string>>,
  setScreen: Dispatch<SetStateAction<AuthScreen>>,
) {
  return (r: Role) => {
    setRole(r)
    const defaultNav = (r === 'superadmin' || r === 'devteam' || r === 'admin' || r === 'lead') ? 'Requirements' : 'Dashboard'
    try {
      localStorage.setItem('metaforge_session_active', 'true')
      localStorage.setItem('metaforge_user_role', r)
      localStorage.setItem('metaforge_active_nav', defaultNav)
    } catch (e) {
      // ignore
    }
    setActiveNav(defaultNav)
    setScreen('app')
  }
}

export function createNavSelectHandler(
  setSelectedReqIdForSubmit: Dispatch<SetStateAction<string | null>>,
  setActiveNav: Dispatch<SetStateAction<string>>,
) {
  return (nav: string) => {
    if (nav === 'Candidates' || nav === 'Candidate Search') {
      setSelectedReqIdForSubmit(null)
    }
    setActiveNav(nav)
    try {
      localStorage.setItem('metaforge_active_nav', nav)
    } catch (e) {}
  }
}
