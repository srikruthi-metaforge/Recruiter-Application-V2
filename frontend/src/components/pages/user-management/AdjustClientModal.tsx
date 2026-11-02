import {
  Save,
  Building2,
  X,
} from 'lucide-react'
import { usersService } from '../../../services/workspace.service'
import { apiErrorMessage } from './userApi'
import type { UserManagementVM } from './useUserManagement'

export function AdjustClientModal({
    targetClient,
    setTargetClient, adjustClientUser, setAdjustClientUser, showToast,
    clientOptions, clientNameById, reloadUsers, isSaving, setIsSaving,
}: UserManagementVM) {
  if (!adjustClientUser) return null

  const clientLabel = targetClient
    ? (clientNameById[targetClient] || 'selected client')
    : 'All Clients'

  return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6B3BF6]" />
                <h3 className="font-extrabold text-slate-900 text-base">Adjust Client Account Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustClientUser(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200">
                <p className="text-xs font-extrabold text-slate-900">{adjustClientUser.name}</p>
                <p className="text-[11px] text-[#6B3BF6] font-bold mt-0.5">{adjustClientUser.role} • {adjustClientUser.team}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold text-xs mb-1.5">
                  Assigned Client Account *
                </label>
                <select
                  value={targetClient}
                  onChange={e => setTargetClient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                >
                  <option value="">All Clients (Executive Oversight)</option>
                  {clientOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Reassigning this client updates requirement allocations, candidate submission targets, and performance SLAs for this recruiter/lead.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustClientUser(null)}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true)
                  try {
                    await usersService.update(adjustClientUser.id, {
                      clientId: targetClient || '',
                    })
                    await reloadUsers()
                    showToast(`Adjusted client assignment for ${adjustClientUser.name} to "${clientLabel}"!`)
                    setAdjustClientUser(null)
                  } catch (err) {
                    showToast(apiErrorMessage(err))
                  } finally {
                    setIsSaving(false)
                  }
                }}
                className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving…' : 'Save Client Assignment'}</span>
              </button>
            </div>
          </div>
        </div>
  )
}
