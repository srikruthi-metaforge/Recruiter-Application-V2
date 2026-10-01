export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  title?: string
  permissions?: string[] | Record<string, boolean>
}

const TOKEN_KEY = 'metaforge_access_token'
const USER_KEY = 'metaforge_session_user'

let accessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
let sessionUser: SessionUser | null = typeof window !== 'undefined' ? (() => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
})() : null

export function getAccessToken(): string | null {
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem(TOKEN_KEY)
  }
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }
}

export function getSessionUser(): SessionUser | null {
  if (!sessionUser && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(USER_KEY)
      sessionUser = raw ? JSON.parse(raw) : null
    } catch {
      sessionUser = null
    }
  }
  return sessionUser
}

export function setSessionUser(user: SessionUser | null): void {
  sessionUser = user
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }
}

export function clearSession(): void {
  accessToken = null
  sessionUser = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }
}
