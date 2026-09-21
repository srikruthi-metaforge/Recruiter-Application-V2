import { Lock } from 'lucide-react'

export function RestrictedAccessView() {
  return (
      <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-200">
        <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-rose-500/30 text-center space-y-6 max-w-2xl mx-auto my-12">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 border border-rose-400/30 text-rose-300 inline-block uppercase tracking-wider">
              Access Control Restricted
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Super Admin Access Only
            </h2>
            <p className="text-xs text-rose-200/80 max-w-md mx-auto leading-relaxed font-medium">
              Managing recruiter accounts, system roles, and security permissions is strictly reserved for Super Admin level accounts. Admin role does not have permission to alter organizational access policies.
            </p>
          </div>
        </div>
      </div>
  )
}
