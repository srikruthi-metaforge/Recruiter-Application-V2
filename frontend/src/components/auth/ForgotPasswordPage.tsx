import React, { useState } from 'react'
import { Mail, Key, CheckCircle2, ArrowLeft } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { DEMO_ACCOUNTS, ROLE_META } from '../../data/mockData'
import { Role } from '../../types'

interface ForgotPasswordPageProps {
  onBack: () => void
  onSent: () => void
}

export function ForgotPasswordPage({ onBack, onSent }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email) {
      setError('Work email address is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid work email address')
      return
    }

    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 800)
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/5">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight mb-2">Check your inbox</h1>
          <p className="text-sm text-slate-500 font-normal mb-6 leading-relaxed">
            We sent password reset recovery instructions to <span className="text-slate-900 font-semibold">{email}</span>.
          </p>

          <button
            onClick={onBack}
            className="w-full h-12 sm:h-13 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </button>

        <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
          <Key className="w-7 h-7" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mb-2">Reset password</h1>
        <p className="text-sm text-slate-500 mb-8 font-normal leading-relaxed">
          Enter your registered work email and we'll send password recovery instructions instantly.
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
                placeholder="you@company.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setError('')
                }}
                className={`w-full h-12 sm:h-13 pl-12 pr-4 text-sm font-medium bg-slate-50/70 border rounded-xl focus:outline-none transition-all ${
                  error ? 'border-rose-400 bg-rose-50/50 text-rose-900' : 'border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                }`}
              />
            </div>
            {error && <p className="text-xs font-mono text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Quick Demo Helper */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">Quick Demo Emails:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {(Object.entries(DEMO_ACCOUNTS) as [Role, typeof DEMO_ACCOUNTS[Role]][]).map(([r, acc]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setEmail(acc.email)}
                  className="text-left text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline truncate font-mono"
                >
                  {ROLE_META[r].label}: {acc.email}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 sm:h-13 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 disabled:opacity-60 font-sans cursor-pointer"
          >
            {loading ? 'Sending Instructions...' : 'Send Password Reset Link'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}

