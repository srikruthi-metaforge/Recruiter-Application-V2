import React from 'react'
import type { UserAccountData, EnterpriseRoleData } from './types'
import type { UserManagementState } from './useUserManagementState'

export function useUserFormActions(s: UserManagementState) {
  const {
    role, canModifyUsers, users, setUsers,
    roles, setRoles, setRecruiterUsers, setViewMode,
    selectedUser, setSelectedUser, newUserName, setNewUserName,
    newUserEmail, setNewUserEmail, newUserPhone, setNewUserPhone,
    newUserEmpId, setNewUserEmpId, newUserRole, newUserTeam,
    newUserSupervisor, newUserClient, resetNewPass, targetRole,
    targetClient, newRoleName, setNewRoleName, newRoleDescription,
    setNewRoleDescription, newPermissions, editingRole, setEditingRole,
    tempRolePermissions, showToast
  } = s

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canModifyUsers) {
      showToast('Access Restricted: Admin has view-only permissions.')
      setViewMode('list')
      return
    }
    if (!newUserName.trim() || !newUserEmail.trim()) return

    const newRecord: UserAccountData = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+91 98765 00000',
      employeeId: newUserEmpId.trim() || `EMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      role: newUserRole,
      roleCode: newUserRole.toLowerCase().replace(/\s+/g, '_'),
      team: newUserTeam,
      supervisor: newUserSupervisor,
      assignedClient: newUserClient,
      status: 'Active',
      twoFactorEnabled: true,
      lastLogin: 'Never (New Account)',
      lastPasswordChange: 'Just now',
    }

    setUsers([newRecord, ...users])
    setViewMode('list')
    showToast(`Successfully created user account for ${newUserName} (Client: ${newUserClient})`)

    setNewUserName('')
    setNewUserEmail('')
    setNewUserPhone('')
    setNewUserEmpId('')
  }

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !resetNewPass) return

    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id ? { ...u, lastPasswordChange: 'Today (Reset by Admin)' } : u
      )
    )
    setViewMode('list')
    showToast(`Password successfully reset for ${selectedUser.name}!`)
    setSelectedUser(null)
  }

  // Handle Assign Role & Adjust Client Submit
  const handleAssignRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id
          ? {
              ...u,
              role: targetRole,
              roleCode: targetRole.toLowerCase().replace(/\s+/g, '_'),
              assignedClient: targetClient,
            }
          : u
      )
    )
    setRecruiterUsers(prev =>
      prev.map(r =>
        r.id === selectedUser.id || r.email === selectedUser.email
          ? { ...r, assignedClient: targetClient }
          : r
      )
    )
    setViewMode('list')
    showToast(`Updated role to "${targetRole}" & client to "${targetClient}" for ${selectedUser.name}`)
    setSelectedUser(null)
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

  // Handle Save Role Permissions
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

  return {
    handleCreateUserSubmit,
    handleResetPasswordSubmit,
    handleAssignRoleSubmit,
    handleCreateRoleSubmit,
    handleSaveRolePermissions,
  }
}
