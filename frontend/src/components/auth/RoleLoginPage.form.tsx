import React from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react'
import { Role } from '../../types'
import { SEED_ACCOUNTS } from '../../data/seedCredentials'
import { roleTheme } from '../../theme'

export function RoleLoginForm({
  role,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  onBack,
  onForgot,
  fillDemo,
  handleSubmit,
}: {
  role: Role
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  error: string
  loading: boolean
  onBack: () => void
  onForgot: () => void
  fillDemo: () => void
  handleSubmit: (e: React.FormEvent) => void
}) {
  const theme = roleTheme[role]
  const account = SEED_ACCOUNTS[role]

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 relative overflow-y-auto h-full">
      <div className="w-full max-w-md xl:max-w-lg my-auto">
        <button
          onClick={onBack}
          className="lg:hidden inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all portals
        </button>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/5">
          <div className="flex items-center justify-between mb-6">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono tracking-wide"
              style={{ background: theme.accentLight, color: theme.accent }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />
              {theme.label} Portal
            </div>
            <span className="text-xs font-mono text-slate-400">Step 2 of 2</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 font-sans">
            Sign in to {theme.label}
          </h2>
          <p className="text-sm text-slate-500 mb-8 font-normal leading-relaxed">
            Enter your credentials to access your scoped workspace and live dashboard tools.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={account.email}
                  className="w-full h-12 sm:h-13 pl-12 pr-4 text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  Account Password
                </label>
                <button
                  type="button"
                  onClick={onForgot}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 sm:h-13 pl-12 pr-12 text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:text-slate-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Demo login pre-fill:</span>
              <button
                type="button"
                onClick={fillDemo}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                Fill Demo Password →
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-13 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Authenticating & Loading Workspace…' : `Sign In to ${theme.label} Console`}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
