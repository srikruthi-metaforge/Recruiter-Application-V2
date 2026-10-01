import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, KeyRound } from 'lucide-react'
import { Role } from '../../types'
import { SEED_ACCOUNTS } from '../../data/seedCredentials'
import { authenticate } from '../../data/authService'
import { brand, roleTheme, authTheme } from '../../theme'
import { MetaforgeLogo } from '../common/MetaforgeLogo'

interface RoleLoginPageProps {
  role: Role
  onLogin: (role: Role) => void
  onBack: () => void
  onForgot: () => void
}

export function RoleLoginPage({ role, onLogin, onBack, onForgot }: RoleLoginPageProps) {
  const theme = roleTheme[role]
  const account = SEED_ACCOUNTS[role]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await authenticate(email, password, role)
    if (!result.ok) {
      setError(result.message)
      setLoading(false)
      return
    }

    window.setTimeout(() => {
      onLogin(role)
    }, 600)
  }

  const fillDemo = () => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden flex bg-slate-50 font-sans">
      {/* Left panel - Unified Deep Navy Showcase with Role Branding */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[500px] 2xl:w-[540px] flex-shrink-0 bg-[#0B1021] flex-col relative overflow-hidden text-white border-r border-slate-800/80">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient lighting glows with subtle role accent tint */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full px-8 xl:px-10 py-6 xl:py-8 overflow-y-auto">
          {/* Back button & Logo */}
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-mono transition-all mb-4 border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Portals
            </button>

            <div className="flex items-center gap-3 mb-4">
              <MetaforgeLogo variant="light" size="md" />
              <div>
                <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase font-semibold">
                  Recruiter Intelligence Platform
                </p>
              </div>
            </div>
          </div>

          {/* Role Portal Details */}
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-[11px] font-mono font-medium mb-3 w-max shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Scoped Workspace</span>
            </div>

            <h1 className="text-2xl xl:text-3xl font-extrabold text-white leading-snug mb-3 tracking-tight">
              {theme.portalTitle}
            </h1>
            <p className="text-slate-300 text-xs xl:text-sm leading-relaxed max-w-md mb-4">
              {theme.portalDesc}
            </p>

            {/* Feature Checkmarks */}
            <div className="space-y-2 mb-4">
              {[
                `Scoped dashboard & features for ${theme.label}`,
                'Real-time metrics, live pipelines & analytics',
                'Enterprise-grade security and role isolation',
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                  <div className="w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Interactive Demo Box in left panel */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-blue-400" /> Demo Credentials
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Ready to Sign In
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">{account.name}</p>
                <p className="text-[10px] font-mono text-blue-300">{account.email}</p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2.5 w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 font-mono text-xs rounded-xl font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Auto-fill credentials into form
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono pt-3 border-t border-slate-800/60 mt-2">
            <span>© 2026 TalentFlow Inc.</span>
            <span>v3.2.0 Enterprise</span>
          </div>
        </div>
      </div>

      {/* Right Form Container - Enlarged, Modern & Screen-Suited */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 relative overflow-y-auto h-full">
        <div className="w-full max-w-md xl:max-w-lg my-auto">
          {/* Mobile Back Button */}
          <button
            onClick={onBack}
            className="lg:hidden inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to all portals
          </button>

          {/* Form Card Box - Expanded & Attractive */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/5">
            {/* Header / Role Pill */}
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
              {/* Email Input Field */}
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

              {/* Password Input Field */}
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

              {/* Error Message Alert */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Fill Demo Action Bar */}
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

              {/* Submit Button */}
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
    </div>
  )
}

