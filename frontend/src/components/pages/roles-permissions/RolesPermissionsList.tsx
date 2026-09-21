import { Users, Shield, Lock, User, Plus } from 'lucide-react'
import type { RolesPermissionsVM } from './useRolesPermissions'
import { RecruiterMatrixTab } from './RecruiterMatrixTab'
import { RoleDefinitionsTab } from './RoleDefinitionsTab'
import { ManagePermissionsModal } from './ManagePermissionsModal'

export function RolesPermissionsList(vm: RolesPermissionsVM) {
  const { activeTab, setActiveTab, setViewMode, recruiterUsers, roles, toastMsg } = vm
  return (
    <div className="space-y-6 w-full pb-16 font-sans text-slate-800 animate-in fade-in duration-150">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roles & Permissions</h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1.5 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Super Admin Governance Control</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage recruiter accounts, assigned roles, and granular security capabilities across your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('create_role')}
            className="px-4 py-2.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('recruiter_matrix')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'recruiter_matrix'
              ? 'bg-[#6B3BF6] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Recruiters & User Permissions Matrix ({recruiterUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('role_definitions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'role_definitions'
              ? 'bg-[#6B3BF6] text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>System Role Definitions ({roles.length})</span>
        </button>
      </div>

      {activeTab === 'recruiter_matrix' && (
        <RecruiterMatrixTab {...vm} />
      )}
      {activeTab === 'role_definitions' && (
        <RoleDefinitionsTab {...vm} />
      )}
      <ManagePermissionsModal {...vm} />
      {toastMsg && (
        <div className="fixed bottom-12 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-medium animate-in fade-in duration-200">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
