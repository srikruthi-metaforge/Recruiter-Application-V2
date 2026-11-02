import {
  KeyRound,
  RotateCcw,
  Copy,
} from 'lucide-react'
import type { UserManagementVM } from './useUserManagement'

function generateTempPassword() {
  return 'Pass@' + Math.floor(10000 + Math.random() * 90000)
}

export function CreateUserSecuritySection({
    tempPassword, setTempPassword, showToast
}: UserManagementVM) {
  return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <span>3. Initial Temporary Password</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Sign-in uses the work email + this password (not Employee ID / user ID). Copy and share the password securely — welcome email is not sent automatically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Initial Temporary Password *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={tempPassword}
                    onChange={e => setTempPassword(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTempPassword(generateTempPassword())}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>
                  <button
                    type="button"
                    disabled={!tempPassword}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(tempPassword)
                        showToast('Password copied to clipboard')
                      } catch {
                        showToast('Could not copy password — select and copy it manually')
                      }
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
  )
}
