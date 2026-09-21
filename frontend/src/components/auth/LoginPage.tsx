import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, Sparkles, Zap } from 'lucide-react'
import { Role } from '../../types'
import { DEMO_ACCOUNTS, ROLE_META } from '../../data/mockData'
import { AuthLayout } from './AuthLayout'

interface LoginPageProps {
  onLogin: (role: Role) => void
  onForgot: () => void
  onSignup: () => void
}

export function LoginPage({ onLogin, onForgot, onSignup }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [quickRole, setQuickRole] = useState<Role | null>('superadmin')

  const fillDemo = (role: Role) => {
    setQuickRole(role)
    setEmail(DEMO_ACCOUNTS[role].email)
    setPassword(DEMO_ACCOUNTS[role].password)
    setErrors({})
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    onLogin(quickRole || 'superadmin')
  }

  const handleDemoClick = (role: Role) => {
    fillDemo(role)
    onLogin(role)
  }

  return (
    <AuthLayout>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/5">
        {/* Direct One-Click Console Launcher */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300" /> Redesigned Enterprise Demo
            </span>
            <span className="text-[10px] font-mono text-blue-100">Live Console</span>
          </div>
          <p className="text-xs text-blue-100 font-body mb-4 leading-relaxed">
            Explore the updated dashboards, visual charts, command palette, and candidate Kanban boards.
          </p>
          <button
            onClick={() => onLogin(quickRole || 'superadmin')}
            className="w-full h-11 bg-white text-blue-700 hover:bg-blue-50 font-bold font-sans text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Launch Redesigned Dashboard Directly <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            Select Demo Persona
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Click any role persona below to instantly launch into that workspace view
          </p>
        </div>

        {/* Quick Demo Role Selector */}
        <div className="mb-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3">
            {(Object.entries(ROLE_META) as [Role, typeof ROLE_META[Role]][]).map(([r, meta]) => (
              <button
                key={r}
                type="button"
                onClick={() => handleDemoClick(r)}
                className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
                  quickRole === r
                    ? `${meta.bg} ${meta.border} shadow-md font-semibold ring-2 ring-blue-500/20`
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className={`text-xs sm:text-sm font-sans font-bold ${quickRole === r ? meta.color : 'text-slate-900'}`}>
                  {meta.label}
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{meta.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="submit"
            className="w-full h-12 sm:h-13 bg-slate-900 hover:bg-blue-600 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 font-sans cursor-pointer"
          >
            <span>Enter Console as {ROLE_META[quickRole || 'superadmin'].label}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}

