import { Save, X } from 'lucide-react'
import type { RolesPermissionsVM } from './useRolesPermissions'

export function ManagePermissionsModal(vm: RolesPermissionsVM) {
  if (!vm.selectedUserForManage) return null
  const {
    setViewMode, handleSaveRolePermissions, editingRole, tempRolePermissions, setTempRolePermissions,
    newRoleName, setNewRoleName, newRoleTemplate, setNewRoleTemplate, newRoleDescription, setNewRoleDescription,
    handleCreateRoleSubmit, searchQuery, setSearchQuery, roleFilter, setRoleFilter,
    filteredRecruiterUsers, recruiterUsers, roles, handleOpenUserPermissionModal, handleOpenConfigurePermissionsPage,
    selectedUserForManage, setSelectedUserForManage, tempUserRoleName, setTempUserRoleName, tempUserPermissions,
    setTempUserPermissions, handleSaveUserPermissions, toastMsg, activeTab, setActiveTab
  } = vm
  return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6B3BF6] font-bold flex items-center justify-center text-sm border border-purple-200">
                  {selectedUserForManage.avatar}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Manage Permissions — {selectedUserForManage.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedUserForManage.email} • {selectedUserForManage.team}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForManage(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Assigned System Role</label>
                <select
                  value={tempUserRoleName}
                  onChange={e => setTempUserRoleName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
                >
                  <option value="Senior Technical Recruiter">Senior Technical Recruiter</option>
                  <option value="IT Recruiter">IT Recruiter</option>
                  <option value="ERP Technical Recruiter">ERP Technical Recruiter</option>
                  <option value="Junior Recruiter">Junior Recruiter</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Individual Capability Switches */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 mb-1">Granular Capabilities & Access Rights</label>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {[
                    { key: 'addCandidates', label: 'Add & Search Candidate Repository' },
                    { key: 'submitToClients', label: 'Submit Candidates to Client Requirements' },
                    { key: 'scheduleInterviews', label: 'Schedule Candidate Interviews' },
                    { key: 'exportReportsCsv', label: 'Export Reports & Resumes CSV' },
                    { key: 'viewTeamAnalytics', label: 'View Team Analytics & Benchmarks' },
                    { key: 'reassignRequirements', label: 'Reassign Requirements & Candidates' },
                    { key: 'deleteRecords', label: 'Delete Requirements / Candidates' },
                  ].map(cap => {
                    const isChecked = (tempUserPermissions as any)[cap.key]
                    return (
                      <label
                        key={cap.key}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-50/60 border-purple-200 text-purple-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cap.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setTempUserPermissions(prev => ({
                              ...prev,
                              [cap.key]: !(prev as any)[cap.key],
                            }))
                          }
                          className="w-4 h-4 text-[#6B3BF6] rounded focus:ring-[#6B3BF6] cursor-pointer"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserForManage(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserPermissions}
                className="px-5 py-2 text-xs font-bold bg-[#6B3BF6] text-white rounded-xl hover:bg-[#5833E0] shadow-xs cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Recruiter Permissions</span>
              </button>
            </div>
          </div>
        </div>
  )
}
