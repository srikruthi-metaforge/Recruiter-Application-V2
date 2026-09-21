import { DEFAULT_MODULE_PERMISSIONS } from './permissions.data'
import { ArrowLeft, Save, Shield, Sliders } from 'lucide-react'
import type { RolesPermissionsVM } from './useRolesPermissions'

export function ConfigurePermissionsView(vm: RolesPermissionsVM) {
  if (!vm.editingRole) return null
  const {
    setViewMode, handleSaveRolePermissions, editingRole, tempRolePermissions, setTempRolePermissions,
    newRoleName, setNewRoleName, newRoleTemplate, setNewRoleTemplate, newRoleDescription, setNewRoleDescription,
    handleCreateRoleSubmit, searchQuery, setSearchQuery, roleFilter, setRoleFilter,
    filteredRecruiterUsers, recruiterUsers, roles, handleOpenUserPermissionModal, handleOpenConfigurePermissionsPage,
    selectedUserForManage, setSelectedUserForManage, tempUserRoleName, setTempUserRoleName, tempUserPermissions,
    setTempUserPermissions, handleSaveUserPermissions, toastMsg, activeTab, setActiveTab
  } = vm
  return (
      <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-slate-200"
              title="Back to Roles List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Configure Permissions Matrix
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-[#6B3BF6] border border-purple-200 inline-flex items-center gap-1.5 shadow-2xs">
                  <Shield className="w-3.5 h-3.5 text-[#6B3BF6]" />
                  <span>{editingRole.name}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Role System Code: <strong className="font-mono text-slate-800">{editingRole.code}</strong> • Assigned Users: <strong className="text-purple-700">{editingRole.userCount} Active Accounts</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveRolePermissions}
              className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Save Permission Matrix</span>
            </button>
          </div>
        </div>

        {/* PERMISSION MATRIX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEFAULT_MODULE_PERMISSIONS.map(group => (
            <div key={group.module} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#6B3BF6]" />
                    <span>{group.module}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-[#6B3BF6] border border-purple-200">
                    {group.permissions.filter(p => tempRolePermissions[p.key]).length} / {group.permissions.length} Enabled
                  </span>
                </div>

                <div className="space-y-2">
                  {group.permissions.map(p => {
                    const isChecked = !!tempRolePermissions[p.key]
                    return (
                      <label
                        key={p.key}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-50/50 border-purple-200 text-purple-950 font-bold'
                            : 'bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs">{p.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setTempRolePermissions(prev => ({
                              ...prev,
                              [p.key]: !prev[p.key],
                            }))
                          }
                          className="w-4 h-4 text-[#6B3BF6] rounded-md focus:ring-[#6B3BF6] cursor-pointer"
                        />
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}
