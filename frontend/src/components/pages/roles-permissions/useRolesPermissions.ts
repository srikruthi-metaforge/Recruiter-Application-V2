import React, { useState } from 'react'
import type { RecruiterUserPermissionData, EnterpriseRoleData } from './types'
import { INITIAL_ROLES } from './permissions.data'
import { INITIAL_RECRUITERS_PERMISSIONS } from './recruiters.data'

export function useRolesPermissions() {
  const [activeTab, setActiveTab] = useState<'recruiter_matrix' | 'role_definitions'>('recruiter_matrix')
  const [roles, setRoles] = useState<EnterpriseRoleData[]>(INITIAL_ROLES)
  const [recruiterUsers, setRecruiterUsers] = useState<RecruiterUserPermissionData[]>(INITIAL_RECRUITERS_PERMISSIONS)
  const [viewMode, setViewMode] = useState<'list' | 'create_role' | 'configure_permissions'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')

  // Manage Recruiter Permission Modal State
  const [selectedUserForManage, setSelectedUserForManage] = useState<RecruiterUserPermissionData | null>(null)
  const [tempUserPermissions, setTempUserPermissions] = useState<RecruiterUserPermissionData['permissions']>({
    addCandidates: true,
    submitToClients: true,
    scheduleInterviews: true,
    exportReportsCsv: false,
    viewTeamAnalytics: false,
    deleteRecords: false,
    reassignRequirements: false,
  })
  const [tempUserRoleName, setTempUserRoleName] = useState('')

  // Create Role Form State (Full Page)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleDescription, setNewRoleDescription] = useState('')
  const [newRoleTemplate, setNewRoleTemplate] = useState('recruiter')
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>({
    req_view_all: false, req_create: true, req_edit: true, req_assign: false, req_delete: false,
    cand_search: true, cand_add: true, cand_export: true, cand_delete: false,
    sub_create: true, sub_view_all: false, sub_reassign: false, sub_move_stage: true,
    int_schedule: true, int_join_links: true, int_feedback: true, int_cancel: false,
    rep_view_exec: false, rep_view_recruiter: false, rep_export_csv: false,
    user_manage: false, role_manage: false, audit_logs: false,
  })

  // Full-Page Configure Permissions State
  const [editingRole, setEditingRole] = useState<EnterpriseRoleData | null>(null)
  const [tempRolePermissions, setTempRolePermissions] = useState<Record<string, boolean>>({})

  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Open Manage Recruiter Permissions Modal
  const handleOpenUserPermissionModal = (user: RecruiterUserPermissionData) => {
    setSelectedUserForManage(user)
    setTempUserPermissions({ ...user.permissions })
    setTempUserRoleName(user.roleName)
  }

  // Save Recruiter Individual Permissions
  const handleSaveUserPermissions = () => {
    if (!selectedUserForManage) return
    const updatedUsers = recruiterUsers.map(u =>
      u.id === selectedUserForManage.id
        ? {
            ...u,
            roleName: tempUserRoleName,
            permissions: { ...tempUserPermissions },
          }
        : u
    )
    setRecruiterUsers(updatedUsers)
    showToast(`Permissions updated successfully for ${selectedUserForManage.name}!`)
    setSelectedUserForManage(null)
  }

  // Handle Open Full-Page Configure Role Permissions View
  const handleOpenConfigurePermissionsPage = (roleObj: EnterpriseRoleData) => {
    setEditingRole(roleObj)
    setTempRolePermissions({ ...roleObj.permissions })
    setViewMode('configure_permissions')
  }

  // Save Role Permissions from Full Page View
  const handleSaveRolePermissions = () => {
    if (!editingRole) return
    const updatedRoles = roles.map(r =>
      r.id === editingRole.id ? { ...r, permissions: { ...tempRolePermissions }, lastUpdated: 'Today' } : r
    )
    setRoles(updatedRoles)
    setViewMode('list')
    showToast(`Role permissions updated for ${editingRole.name}!`)
    setEditingRole(null)
  }

  // Handle Create Role Form Submit
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return

    const createdRole: EnterpriseRoleData = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      code: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      description: newRoleDescription.trim() || 'Custom enterprise role created by administrator.',
      userCount: 0,
      isSystem: false,
      lastUpdated: 'Just now',
      permissions: { ...newPermissions },
    }

    setRoles([...roles, createdRole])
    setViewMode('list')
    showToast(`New Role "${createdRole.name}" created successfully!`)

    setNewRoleName('')
    setNewRoleDescription('')
  }

  const filteredRecruiterUsers = recruiterUsers.filter(u => {
    if (searchQuery.trim() && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (roleFilter !== 'All Roles' && u.roleName !== roleFilter) {
      return false
    }
    return true
  })

  return {
    activeTab, setActiveTab, roles, setRoles, recruiterUsers, setRecruiterUsers,
    viewMode, setViewMode, searchQuery, setSearchQuery, roleFilter, setRoleFilter,
    selectedUserForManage, setSelectedUserForManage, tempUserPermissions, setTempUserPermissions,
    tempUserRoleName, setTempUserRoleName, newRoleName, setNewRoleName, newRoleDescription, setNewRoleDescription,
    newRoleTemplate, setNewRoleTemplate, newPermissions, setNewPermissions, editingRole, setEditingRole,
    tempRolePermissions, setTempRolePermissions, toastMsg, setToastMsg, showToast,
    handleOpenUserPermissionModal, handleSaveUserPermissions, handleOpenConfigurePermissionsPage,
    handleSaveRolePermissions, handleCreateRoleSubmit, filteredRecruiterUsers,
  }
}

export type RolesPermissionsVM = ReturnType<typeof useRolesPermissions>
