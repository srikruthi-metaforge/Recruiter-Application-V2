import React, { useState } from 'react'
import { KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Role } from '../../types'
import { DEMO_ACCOUNTS } from '../../data/mockData'
import { authenticate } from '../../data/authService'
import { roleTheme } from '../../theme'
import { AuthCard, AuthShell } from './AuthShell'
import { AuthAlert, PasswordField, SubmitButton, TextField } from './AuthFormControls'

interface SignInPageProps {
  /** Called with the authenticated role — wires into the existing App session flow. */
  onLogin: (role: Role) => void
  onForgot: (email?: string) => void
  onSignup: () => void
  /** Back to the landing page */
  onBack: () => void
  /** Jump into the existing role-scoped portal selector */
  onRolePortals: () => void
}

const REMEMBER_KEY = 'metaforge_remembered_email'

export function SignInPage({ onLogin, onForgot, onSignup, onBack, onRolePortals }: SignInPageProps) {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_KEY) || ''
    } catch {
      return ''
    }
  })
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => {
    try {
      return !!localStorage.getItem(REMEMBER_KEY)
    } catch {
      return false
    }
  })
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const result = await authenticate(email, password)
    if (!result.ok) {
      setErrors({ [result.field]: result.message })
      setLoading(false)
      return
    }

    const role = result.account.role
    window.setTimeout(() => {
      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, result.account.email)
        else localStorage.removeItem(REMEMBER_KEY)
      } catch {
        // storage unavailable — sign-in still proceeds
      }
      onLogin(role)
    }, 600)
  }

  return (
    <AuthShell
      backLabel="Back to home"
      onBack={onBack}
      eyebrow="Secure Workspace Access"
      headline={
        <>
          Sign in to your
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            recruitment command centre.
          </span>
        </>
      }
      description="One sign-in for requirements, candidates, submissions, interviews and recruiter performance — scoped to your role the moment you land."
      bullets={[
        'Role-based access for Super Admin, Admin, Lead and Recruiter',
        'AI resume & JD parsing with live match scoring',
        'Every action captured in the platform audit trail',
      ]}
      aside={<DemoCredentialsPanel onPick={(e, p) => { setEmail(e); setPassword(p); setErrors({}) }} />}
    >
      <AuthCard>
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-bold font-mono tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            MRAP Console
          </div>
          <span className="text-[11px] font-mono text-slate-400">Secure Sign In</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1 font-sans">
          Welcome back
        </h2>
        <p className="text-xs text-slate-500 mb-5 font-normal leading-relaxed">
          Enter your work credentials to access your MetaForge recruitment workspace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Work Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={v => {
              setEmail(v)
              setErrors(prev => ({ ...prev, email: undefined, general: undefined }))
            }}
            placeholder="you@company.com"
            autoComplete="username"
            error={errors.email}
            disabled={loading}
          />

          <PasswordField
            label="Account Password"
            icon={Lock}
            value={password}
            onChange={v => {
              setPassword(v)
              setErrors(prev => ({ ...prev, password: undefined, general: undefined }))
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password}
            disabled={loading}
            action={
              <button
                type="button"
                onClick={() => onForgot(email)}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            }
          />

          {errors.general && <AuthAlert tone="error">{errors.general}</AuthAlert>}

          <label className="flex items-center gap-2 cursor-pointer w-max">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="rounded border-slate-300 accent-blue-600 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-xs text-slate-600 font-medium">Remember me on this device</span>
          </label>

          <SubmitButton loading={loading} loadingLabel="Authenticating & loading workspace…">
            Sign In to Workspace
          </SubmitButton>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-2.5">
          <button
            type="button"
            onClick={onRolePortals}
            className="w-full h-10 border border-slate-300 bg-white text-slate-700 rounded-xl text-xs font-mono font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all cursor-pointer"
          >
            Sign in through a role portal instead →
          </button>
          <p className="text-center text-xs text-slate-500 font-normal">
            Don&apos;t have workspace access?{' '}
            <button type="button" onClick={onSignup} className="text-blue-600 font-semibold hover:underline cursor-pointer">
              Request an account →
            </button>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  )
}

/** Credential hints for the demo accounts, matching the existing RoleLoginPage pattern. */
function DemoCredentialsPanel({ onPick }: { onPick: (email: string, password: string) => void }) {
  const roles: Role[] = ['superadmin', 'admin', 'lead', 'recruiter']

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
          <KeyRound className="w-3 h-3 text-blue-400" /> Demo Credentials
        </span>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Ready to Sign In
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {roles.map(r => {
          const acc = DEMO_ACCOUNTS[r]
          return (
            <button
              key={r}
              type="button"
              onClick={() => onPick(acc.email, acc.password)}
              className="flex flex-col justify-center px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/5 hover:border-blue-500/30 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-[11px] font-bold text-white truncate">{roleTheme[r].label}</span>
                <span className="text-[9px] font-mono text-slate-500 group-hover:text-blue-300">
                  Fill →
                </span>
              </div>
              <span className="text-[9px] font-mono text-blue-300 truncate w-full">{acc.email}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
