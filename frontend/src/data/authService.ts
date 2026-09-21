import { Role } from '../types'
import { DEMO_ACCOUNTS } from './mockData'
import { api, ApiError } from '../lib/api'
import { setAccessToken, setSessionUser } from '../store/session'

/**
 * Auth helper. Prefers NestJS JWT login so authorization lives on the server.
 * Falls back to the existing DEMO_ACCOUNTS check only when the API is unreachable,
 * so the current sign-in UX and demo credentials remain unchanged.
 */

export interface ResolvedAccount {
  role: Role
  email: string
  name: string
  password: string
  title: string
}

const ACCOUNTS = Object.entries(DEMO_ACCOUNTS) as [Role, (typeof DEMO_ACCOUNTS)[Role]][]

/** Roles that may sign in through the unified (non role-scoped) sign-in page. */
export const SIGN_IN_ROLES: Role[] = ['superadmin', 'admin', 'lead', 'recruiter', 'devteam', 'client']

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Look up a registered account by work email (case-insensitive). */
export function findAccountByEmail(email: string): ResolvedAccount | null {
  const needle = email.trim().toLowerCase()
  if (!needle) return null

  const match = ACCOUNTS.find(([, acc]) => acc.email.toLowerCase() === needle)
  if (!match) return null

  const [role, acc] = match
  return { role, ...acc }
}

export type AuthResult =
  | { ok: true; account: ResolvedAccount }
  | { ok: false; field: 'email' | 'password' | 'general'; message: string }

function localAuthenticate(email: string, password: string, expectedRole?: Role): AuthResult {
  const trimmed = email.trim()

  if (!trimmed) return { ok: false, field: 'email', message: 'Work email address is required' }
  if (!isValidEmail(trimmed)) return { ok: false, field: 'email', message: 'Enter a valid work email address' }
  if (!password) return { ok: false, field: 'password', message: 'Password is required' }

  const account = findAccountByEmail(trimmed)
  if (!account || account.password !== password) {
    return {
      ok: false,
      field: 'general',
      message: expectedRole
        ? 'Invalid email or password. Use the demo credentials below.'
        : 'Invalid email or password. Check your credentials and try again.',
    }
  }
  if (expectedRole && account.role !== expectedRole) {
    return {
      ok: false,
      field: 'general',
      message: 'Invalid email or password. Use the demo credentials below.',
    }
  }
  return { ok: true, account }
}

/** Validate credentials against NestJS, falling back to the existing account store. */
export async function authenticate(email: string, password: string, expectedRole?: Role): Promise<AuthResult> {
  const local = localAuthenticate(email, password, expectedRole)
  if (!local.ok) return local

  try {
    const payload: { email: string; password: string; role?: Role } = { email: email.trim(), password }
    if (expectedRole) payload.role = expectedRole
    const res = await api.post<{
      accessToken: string
      user: { id: string; email: string; name: string; role: Role; title?: string; permissions?: Record<string, boolean> }
    }>('/auth/login', payload)
    setAccessToken(res.accessToken)
    setSessionUser(res.user)
    const account = findAccountByEmail(res.user.email) || local.account
    return { ok: true, account: { ...account, role: res.user.role, name: res.user.name, email: res.user.email } }
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      return {
        ok: false,
        field: 'general',
        message:
          expectedRole
            ? 'Invalid email or password. Use the demo credentials below.'
            : 'Invalid email or password. Check your credentials and try again.',
      }
    }
    // API unreachable — preserve existing demo login so the UI workflow is not blocked.
    return local
  }
}

export async function logoutRemote(): Promise<void> {
  try {
    await api.post('/auth/logout')
  } catch {
    // ignore
  }
}

export async function requestAccess(body: Record<string, unknown>): Promise<void> {
  await api.post('/auth/register-request', body)
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

export async function verifyOtp(email: string, otpCode: string): Promise<{ resetToken: string }> {
  return api.post('/auth/verify-otp', { email, otpCode })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword })
}

/* ---------------------------------------------------------------------- */
/* Password policy                                                         */
/* ---------------------------------------------------------------------- */

export interface PasswordRule {
  id: string
  label: string
  test: (value: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: v => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: v => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: v => /[a-z]/.test(v) },
  { id: 'number', label: 'One number (0–9)', test: v => /[0-9]/.test(v) },
  { id: 'symbol', label: 'One special character (!@#$…)', test: v => /[^A-Za-z0-9]/.test(v) },
]

export function passedRules(value: string): number {
  return PASSWORD_RULES.filter(r => r.test(value)).length
}

export function isStrongPassword(value: string): boolean {
  return passedRules(value) === PASSWORD_RULES.length
}

export function passwordStrength(value: string): { score: number; label: string; color: string } {
  const score = passedRules(value)
  if (!value) return { score: 0, label: 'Empty', color: '#CBD5E1' }
  if (score <= 2) return { score, label: 'Weak', color: '#DC2626' }
  if (score === 3) return { score, label: 'Fair', color: '#D97706' }
  if (score === 4) return { score, label: 'Good', color: '#2563EB' }
  return { score, label: 'Strong', color: '#059669' }
}

/* ---------------------------------------------------------------------- */
/* Verification codes (password recovery)                                  */
/* ---------------------------------------------------------------------- */

/** Six-digit recovery code. Surfaced in the UI the same way DEMO_ACCOUNTS are. */
export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export const VERIFICATION_CODE_LENGTH = 6
