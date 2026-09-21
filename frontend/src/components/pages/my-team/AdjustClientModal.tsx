import React from 'react'
import { Save, Building, Building2, X } from 'lucide-react'
import { TeamMemberData } from './types'

interface Props {
  adjustClientMember: TeamMemberData | null
  setAdjustClientMember: (m: TeamMemberData | null) => void
  selectedClientForMember: string
  setSelectedClientForMember: (v: string) => void
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMemberData[]>>
  showToast: (msg: string) => void
}
export function AdjustClientModal({
  adjustClientMember, setAdjustClientMember, selectedClientForMember, setSelectedClientForMember, setTeamMembers, showToast
}: Props) {
  if (!adjustClientMember) return null
  return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#6B3BF6]" />
                <h3 className="font-extrabold text-slate-900 text-base">Adjust Client Account Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustClientMember(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200">
                <p className="text-xs font-extrabold text-slate-900">{adjustClientMember.name}</p>
                <p className="text-[11px] text-[#6B3BF6] font-bold mt-0.5">{adjustClientMember.role}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold text-xs mb-1.5">
                  Assigned Client Account *
                </label>
                <select
                  value={selectedClientForMember}
                  onChange={e => setSelectedClientForMember(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                >
                  <option value="Accenture">Accenture</option>
                  <option value="Deloitte">Deloitte</option>
                  <option value="MetaForge">MetaForge IT Solutions</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="TCS">Tata Consultancy Services (TCS)</option>
                  <option value="Infosys">Infosys</option>
                  <option value="Wipro">Wipro</option>
                  <option value="All Clients">All Clients (Executive Oversight)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Reassigning this client updates requirement allocations and candidate submission targets for this team member.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustClientMember(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeamMembers(prev =>
                    prev.map(m =>
                      m.id === adjustClientMember.id
                        ? {
                            ...m,
                            assignedClients: [
                              {
                                clientName: selectedClientForMember,
                                submissionsCount: m.totalSubmissions,
                                activeReqCount: m.totalActiveReqs,
                                status: 'Active' as const,
                              },
                            ],
                          }
                        : m
                    )
                  )
                  showToast(`Adjusted client assignment for ${adjustClientMember.name} to "${selectedClientForMember}"!`)
                  setAdjustClientMember(null)
                }}
                className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Save Client Assignment</span>
              </button>
            </div>
          </div>
        </div>
  )
}
