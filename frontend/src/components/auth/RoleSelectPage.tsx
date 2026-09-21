import React from 'react'
import { Shield, UserCheck, Users, User, ArrowLeft, ArrowRight, Building2, Terminal, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Role } from '../../types'
import { brand, roleTheme } from '../../theme'
import { MetaforgeLogo } from '../common/MetaforgeLogo'

interface RoleSelectPageProps {
  onSelectRole: (role: Role) => void
  /** Optional — renders a "back to sign in" affordance when provided */
  onBack?: () => void
}

const ROLES: { role: Role; icon: React.ElementType; tag: string }[] = [
  { role: 'superadmin', icon: Shield, tag: 'Full Control' },
  { role: 'admin', icon: UserCheck, tag: 'Operations' },
  { role: 'lead', icon: Users, tag: 'Team Lead' },
  { role: 'recruiter', icon: User, tag: 'Submissions' },
  { role: 'devteam', icon: Terminal, tag: 'Engineering' },
]

export function RoleSelectPage({ onSelectRole, onBack }: RoleSelectPageProps) {
  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden font-sans">
      {/* Left panel - Unified Deep Navy Showcase */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] 2xl:w-[600px] flex-shrink-0 bg-[#0B1021] flex-col justify-between relative overflow-hidden text-white border-r border-slate-800/80">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient lighting glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-12">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-mono transition-all mb-10 border border-white/10 w-max cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
          )}

          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <MetaforgeLogo variant="light" size="lg" />
            <div>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-semibold">
                Recruiter Intelligence Platform
              </p>
            </div>
          </div>

          {/* Headline & Info */}
          <div className="flex-1 flex flex-col justify-center py-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono font-medium mb-6 w-max shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Multi-Portal Authentication Hub</span>
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Select your role<br />
              to access your portal.
            </h1>

            <p className="text-slate-300 text-sm xl:text-base leading-relaxed max-w-md mb-8">
              Each platform role features a tailored, high-performance workspace scoped strictly to relevant requirements, candidates, and analytics.
            </p>

            <div className="space-y-3.5">
              {[
                'Role-isolated data access and feature permissions',
                'Instant single sign-on with demo credentials',
                'End-to-end recruitment tracking & live metrics',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-xs xl:text-sm text-slate-300 font-medium">
                  <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-xs font-mono pt-6 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Enterprise Portal Hub
            </span>
            <span>v3.2.0 Console</span>
          </div>
        </div>
      </div>

      {/* Right Content - Spacious Role Selector */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-xl xl:max-w-2xl my-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-slate-900 mb-5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
          )}

          {/* Mobile Header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold font-mono text-sm shadow-md">
              TF
            </div>
            <div>
              <span className="text-slate-900 font-bold text-lg font-sans">metaforge</span>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Recruitment Console</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-bold mb-3 uppercase tracking-wider">
              Step 1 of 2 — Portal Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 font-sans">
              Choose your login persona
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
              Select your organization role below to continue to your dedicated login workspace.
            </p>
          </div>

          {/* Role Cards List */}
          <div className="space-y-4">
            {ROLES.map(({ role, icon: Icon, tag }) => {
              const theme = roleTheme[role]
              return (
                <button
                  key={role}
                  onClick={() => onSelectRole(role)}
                  className="w-full flex items-center gap-4 sm:gap-5 p-5 rounded-2xl border border-slate-200/90 bg-white text-left transition-all duration-200 hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-0.5 group cursor-pointer relative overflow-hidden"
                >
                  {/* Subtle hover background highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Role Icon Container */}
                  <div
                    className="w-12 h-12 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm"
                    style={{ background: theme.accentLight, color: theme.accent }}
                  >
                    <Icon className="w-6 h-6 sm:w-6 sm:h-6" />
                  </div>

                  {/* Role Info */}
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-center gap-2.5 mb-1">
                      <p className="font-bold text-base sm:text-lg text-slate-900 font-sans tracking-tight">
                        {theme.label}
                      </p>
                      <span
                        className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                        style={{ background: theme.accentLight, color: theme.accent }}
                      >
                        {tag}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 truncate font-normal">
                      {theme.portalTitle} — {theme.portalDesc}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center flex-shrink-0 transition-all duration-200 z-10">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Need workspace access? Contact system admin</span>
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Support & Docs →</span>
          </div>
        </div>
      </div>
    </div>
  )
}

