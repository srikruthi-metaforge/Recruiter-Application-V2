import React from 'react'
import { ArrowLeft, Sparkles, CheckCircle2, KeyRound } from 'lucide-react'
import { Role } from '../../types'
import { DEMO_ACCOUNTS } from '../../data/mockData'
import { roleTheme } from '../../theme'
import { MetaforgeLogo } from '../common/MetaforgeLogo'

export function RoleLoginLeftPanel({
  role,
  onBack,
  fillDemo,
}: {
  role: Role
  onBack: () => void
  fillDemo: () => void
}) {
  const theme = roleTheme[role]
  const account = DEMO_ACCOUNTS[role]

  return (
    <div className="hidden lg:flex lg:w-[460px] xl:w-[500px] 2xl:w-[540px] flex-shrink-0 bg-[#0B1021] flex-col relative overflow-hidden text-white border-r border-slate-800/80">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full px-8 xl:px-10 py-6 xl:py-8 overflow-y-auto">
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
  )
}
