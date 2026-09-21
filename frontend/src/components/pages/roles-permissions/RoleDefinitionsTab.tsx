import { Users, Shield, User, Sliders } from 'lucide-react'
import type { RolesPermissionsVM } from './useRolesPermissions'

export function RoleDefinitionsTab(vm: RolesPermissionsVM) {
  const {
    setViewMode, handleSaveRolePermissions, editingRole, tempRolePermissions, setTempRolePermissions,
    newRoleName, setNewRoleName, newRoleTemplate, setNewRoleTemplate, newRoleDescription, setNewRoleDescription,
    handleCreateRoleSubmit, searchQuery, setSearchQuery, roleFilter, setRoleFilter,
    filteredRecruiterUsers, recruiterUsers, roles, handleOpenUserPermissionModal, handleOpenConfigurePermissionsPage,
    selectedUserForManage, setSelectedUserForManage, tempUserRoleName, setTempUserRoleName, tempUserPermissions,
    setTempUserPermissions, handleSaveUserPermissions, toastMsg, activeTab, setActiveTab
  } = vm
  return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-150">
          {roles.map(roleObj => (
            <div
              key={roleObj.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#6B3BF6] font-extrabold flex items-center justify-center border border-purple-200">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">{roleObj.name}</h3>
                        {roleObj.isSystem && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                            System Default
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">code: {roleObj.code}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-slate-700 text-xs font-extrabold border border-slate-200">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>{roleObj.userCount} Users</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {roleObj.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">Updated: {roleObj.lastUpdated}</span>

                <button
                  onClick={() => handleOpenConfigurePermissionsPage(roleObj)}
                  className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-[#6B3BF6] font-extrabold rounded-xl border border-purple-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure Role Matrix</span>
                </button>
              </div>
            </div>
          ))}
        </div>
  )
}
