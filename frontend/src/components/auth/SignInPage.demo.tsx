import React from 'react'
import { KeyRound } from 'lucide-react'
import { Role } from '../../types'
import { SEED_ACCOUNTS } from '../../data/seedCredentials'
import { roleTheme } from '../../theme'

/** Credential hints for the demo accounts, matching the existing RoleLoginPage pattern. */
export function DemoCredentialsPanel({ onPick }: { onPick: (email: string, password: string) => void }) {
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
          const acc = SEED_ACCOUNTS[r]
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
