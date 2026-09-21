import type { UserAccountData, RecruiterUserPermissionData } from './types'
import type { UserManagementState } from './useUserManagementState'

export function useUserAccessActions(s: UserManagementState) {
  const {
    canModifyUsers, roles, recruiterUsers, setRecruiterUsers,
    setViewMode, setSelectedUser, setResetNewPass, setResetConfirmPass,
    setTargetRole, setTargetClient, setReassignReason, setAdjustClientUser,
    selectedUserForManage, setSelectedUserForManage, tempUserPermissions, setTempUserPermissions,
    tempUserRoleName, setTempUserRoleName, showToast
  } = s

  const openAdjustClientModal = (user: UserAccountData) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin and Dev Team can adjust client assignments.')
      return
    }
    setAdjustClientUser(user)
    setTargetClient(user.assignedClient || 'Accenture')
  }

  // Open Reset Password Page
  const openResetPasswordPage = (user: UserAccountData) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin and Dev Team can reset user passwords.')
      return
    }
    setSelectedUser(user)
    setResetNewPass('Pass@' + Math.floor(1000 + Math.random() * 9000))
    setResetConfirmPass('')
    setViewMode('reset_password')
  }

  // Open Assign Role Page
  const openAssignRolePage = (user: UserAccountData) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin and Dev Team can edit or reassign user roles.')
      return
    }
    setSelectedUser(user)
    setTargetRole(user.role)
    setTargetClient(user.assignedClient || 'Accenture')
    setReassignReason('')
    setViewMode('assign_role')
  }

  // Open Manage Individual Permissions Modal for a user
  const openManageUserPermissionsModal = (user: UserAccountData | RecruiterUserPermissionData) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin can modify individual user permission capabilities.')
      return
    }
    const existing = recruiterUsers.find(r => r.email === user.email || r.name === user.name)
    if (existing) {
      setSelectedUserForManage(existing)
      setTempUserPermissions({ ...existing.permissions })
      setTempUserRoleName(existing.roleName)
    } else {
      const dummy: RecruiterUserPermissionData = {
        id: user.id,
        name: user.name,
        email: user.email,
        roleName: (user as UserAccountData).role || 'Recruiter',
        roleCode: (user as UserAccountData).roleCode || 'recruiter',
        team: (user as UserAccountData).team || 'Engineering Pod',
        avatar: user.name.charAt(0),
        status: 'Active',
        permissions: {
          addCandidates: true,
          submitToClients: true,
          scheduleInterviews: true,
          exportReportsCsv: false,
          viewTeamAnalytics: false,
          deleteRecords: false,
          reassignRequirements: false,
        },
      }
      setSelectedUserForManage(dummy)
      setTempUserPermissions(dummy.permissions)
      setTempUserRoleName(dummy.roleName)
    }
  }

  // Save Recruiter Individual Permissions
  const handleSaveUserPermissions = () => {
    if (!selectedUserForManage) return
    const updated = recruiterUsers.map(u =>
      u.id === selectedUserForManage.id
        ? {
            ...u,
            roleName: tempUserRoleName,
            permissions: { ...tempUserPermissions },
          }
        : u
    )
    if (!recruiterUsers.some(u => u.id === selectedUserForManage.id)) {
      setRecruiterUsers([...recruiterUsers, { ...selectedUserForManage, roleName: tempUserRoleName, permissions: tempUserPermissions }])
    } else {
      setRecruiterUsers(updated)
    }
    showToast(`Permissions updated successfully for ${selectedUserForManage.name}!`)
    setSelectedUserForManage(null)
  }

  return {
    openAdjustClientModal,
    openResetPasswordPage,
    openAssignRolePage,
    openManageUserPermissionsModal,
    handleSaveUserPermissions,
  }
}
