import { ShieldCheck, ArrowLeft, Save, Shield } from 'lucide-react'
import type { RolesPermissionsVM } from './useRolesPermissions'

export function CreateRoleView(vm: RolesPermissionsVM) {
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
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center border border-slate-200"
              title="Back to Roles List"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#6B3BF6]" />
                <span>Create New Custom Enterprise Role</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Define custom access control levels, assign module permissions, and clone base security templates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              form="create-role-full-form"
              type="submit"
              className="px-5 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Save & Create Role</span>
            </button>
          </div>
        </div>

        <form id="create-role-full-form" onSubmit={handleCreateRoleSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900 font-extrabold text-sm">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Role Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Role Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Talent Acquisition Partner"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1.5">Role Description & Responsibilities</label>
                <textarea
                  rows={2}
                  placeholder="Describe what this role is responsible for..."
                  value={newRoleDescription}
                  onChange={e => setNewRoleDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#6B3BF6]"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
  )
}
