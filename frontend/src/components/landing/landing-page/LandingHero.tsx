import React from 'react'
import { Activity, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react'
import { NAV_LINKS, AI_CAPABILITIES, RECRUITMENT_WORKFLOW, ENTERPRISE_CAPABILITIES, GOVERNANCE_PILLARS } from './preamble'
import { SectionHeading } from './SectionHeading'
import { RecruitmentIntelligenceVisualization } from './RecruitmentIntelligenceVisualization'
import { MetaforgeLogo } from '../../common/MetaforgeLogo'
import { LandingVm } from './useLandingPage'

export function LandingHero({ vm }: { vm: LandingVm }) {
  const {
    onSignIn,
    onRequestAccess,
  } = vm
  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Hero Section                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="platform" className="relative bg-[#0B1021] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-32 -left-24 w-[500px] h-[500px] bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[560px] h-[560px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-12 lg:gap-14 items-center">
            {/* Copy column */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono font-bold mb-7 shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>MetaForge Enterprise Recruiter Intelligence Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight mb-6">
                Recruitment Intelligence.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Built for High-Performance Teams.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mb-9 font-medium">
                Manage requirements, candidates, submissions, interviews and recruiter performance from one intelligent recruitment platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-11">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="h-13 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-extrabold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  Sign In to MRAP <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onRequestAccess}
                  className="h-13 px-7 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Request Workspace Access
                </button>
              </div>

              {/* Qualitative Enterprise Positioning Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-7">
                {[
                  { label: 'Governed Access Control', icon: ShieldCheck },
                  { label: 'Centralized Operations', icon: Building2 },
                  { label: 'AI Match Scoring', icon: Sparkles },
                  { label: 'Complete Traceability', icon: Activity },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-300 font-sans">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Visualization column */}
            <RecruitmentIntelligenceVisualization />
          </div>
        </div>
      </section>

    </>
  )
}
