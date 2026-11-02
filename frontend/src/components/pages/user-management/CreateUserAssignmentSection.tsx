import {
  ShieldCheck,
} from 'lucide-react'
import type { UserManagementVM } from './useUserManagement'

export function CreateUserAssignmentSection({
    newUserRole, setNewUserRole, newUserClient, setNewUserClient, clientOptions
}: UserManagementVM) {
  return (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>2. Role Governance & Team Assignment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Assign System Role *</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs font-bold text-[#6B3BF6] focus:outline-none cursor-pointer"
                >
                  <option value="Recruiter">Recruiter (Sourcing & Pipeline Access)</option>
                  <option value="Team Lead">Team Lead (Team Supervision Access)</option>
                  <option value="Admin">Admin (Full Operational Control)</option>
                  <option value="Super Admin">Super Admin (System Governance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Assigned Client Account *</label>
                <select
                  value={newUserClient}
                  onChange={e => setNewUserClient(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 focus:outline-none cursor-pointer"
                >
                  <option value="">All Clients</option>
                  {clientOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
  )
}
