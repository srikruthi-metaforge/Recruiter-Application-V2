import React from 'react'
import { Sparkles, CheckCircle2, ShieldCheck, Zap, TrendingUp, Layers } from 'lucide-react'
import { MetaforgeLogo } from '../common/MetaforgeLogo'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden font-sans">
      {/* Left panel - Branding & Platform Showcase */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] 2xl:w-[600px] flex-shrink-0 bg-[#0B1021] flex-col relative overflow-hidden text-white border-r border-slate-800/80">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Dynamic ambient lighting glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-10 xl:px-14 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div>
              <MetaforgeLogo variant="light" size="lg" />
              <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-1.5 uppercase font-semibold">
                Recruiter Intelligence Platform
              </p>
            </div>
          </div>

          {/* Headline & Showcase */}
          <div className="flex-1 flex flex-col justify-center py-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-mono font-medium mb-6 w-max shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Next-Gen Enterprise Recruitment Suite</span>
            </div>

            <h2 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-white leading-[1.18] mb-6 tracking-tight">
              Manage every<br />
              placement & candidate,<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                end to end with clarity.
              </span>
            </h2>

            <p className="text-slate-300 text-sm xl:text-base leading-relaxed max-w-md font-normal">
              Track requirements, recruiter submissions, and interview pipelines across your entire staffing enterprise in real time.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3.5">
              {[
                { title: 'Scoped Portal Access', desc: 'Dedicated views for Super Admin, Admin, Lead, Recruiter & Dev' },
                { title: 'AI Candidate Matching', desc: 'Real-time score calculation and automated skill screening' },
                { title: 'Live Placement Analytics', desc: 'Instant feedback loops, stage velocity and throughput tracking' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs xl:text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-[11px] xl:text-xs text-slate-400 font-mono mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="mt-10 grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-7">
              {[
                { val: '226', label: 'Submissions / mo' },
                { val: '52', label: 'Interviews / mo' },
                { val: '16', label: 'Placements / mo' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3">
                  <p className="text-2xl font-bold font-mono text-white tracking-tight">{s.val}</p>
                  <p className="text-[10px] font-mono text-blue-400 mt-1 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer badge */}
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono pt-6 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Enterprise Secured
            </span>
            <span>v3.2.0 Console</span>
          </div>
        </div>
      </div>

      {/* Right panel - Spacious Form container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-slate-50 relative overflow-y-auto">
        <div className="w-full max-w-lg xl:max-w-xl my-auto">
          {/* Mobile Brand Header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold font-mono text-sm shadow-md">
              TF
            </div>
            <div>
              <span className="text-slate-900 font-bold text-lg font-sans">metaforge</span>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Recruitment Console</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

