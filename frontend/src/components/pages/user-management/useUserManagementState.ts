import { useState, useMemo } from 'react'
import { Role } from '../../../types'
import type {
  UserAccountData,
  DeletedUserData,
  RecruiterUserPermissionData,
  EnterpriseRoleData,
} from './types'
import { INITIAL_DELETED_USERS } from './deletedUsers.data'
import { INITIAL_ROLES } from './permissions.data'
import { INITIAL_RECRUITERS_PERMISSIONS } from './recruiters.data'
import { INITIAL_USERS } from './users.data'

export function useUserManagementState(
  role: Role = 'superadmin',
  initialTab: 'users' | 'permissions' | 'role_definitions' = 'users',
) {
  const canModifyUsers = role === 'superadmin' || role === 'devteam'
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'role_definitions'>(initialTab)

  const [users, setUsers] = useState<UserAccountData[]>(INITIAL_USERS)
  const [roles, setRoles] = useState<EnterpriseRoleData[]>(INITIAL_ROLES)
  const [recruiterUsers, setRecruiterUsers] = useState<RecruiterUserPermissionData[]>(INITIAL_RECRUITERS_PERMISSIONS)

  const [viewMode, setViewMode] = useState<'list' | 'create_user' | 'reset_password' | 'assign_role' | 'create_role' | 'configure_permissions'>('list')
  const [selectedUser, setSelectedUser] = useState<UserAccountData | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')

  // Create User Form State
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserEmpId, setNewUserEmpId] = useState('')
  const [newUserRole, setNewUserRole] = useState<'Super Admin' | 'Admin' | 'Team Lead' | 'Recruiter' | 'Dev Team'>('Recruiter')
  const [newUserTeam, setNewUserTeam] = useState('Engineering Team')
  const [newUserSupervisor, setNewUserSupervisor] = useState('Charlie Darwin (Lead)')
  const [newUserClient, setNewUserClient] = useState('Accenture')
  const [tempPassword, setTempPassword] = useState('Pass@2026#Temp')

  // Reset Password State
  const [resetNewPass, setResetNewPass] = useState('')
  const [resetConfirmPass, setResetConfirmPass] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forceChangePass, setForceChangePass] = useState(true)
  const [sendEmailNotify, setSendEmailNotify] = useState(true)

  // Assign Role & Adjust Client State
  const [targetRole, setTargetRole] = useState<'Super Admin' | 'Admin' | 'Team Lead' | 'Recruiter' | 'Client Reviewer' | 'Dev Team'>('Recruiter')
  const [targetClient, setTargetClient] = useState<string>('Accenture')
  const [reassignReason, setReassignReason] = useState('')
  const [adjustClientUser, setAdjustClientUser] = useState<UserAccountData | null>(null)

  // Manage Recruiter Individual Permission Modal State
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

  // Create Role Form State
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

  // Full-Page Configure Role Permissions State
  const [editingRole, setEditingRole] = useState<EnterpriseRoleData | null>(null)
  const [tempRolePermissions, setTempRolePermissions] = useState<Record<string, boolean>>({})

  const [deletedUsers, setDeletedUsers] = useState<DeletedUserData[]>(INITIAL_DELETED_USERS)
  const [userSubTab, setUserSubTab] = useState<'active' | 'deleted'>('active')

  // Two-Step Delete Verification State
  const [userToDeleteConfirm, setUserToDeleteConfirm] = useState<UserAccountData | null>(null)
  const [deleteConfirmCheck, setDeleteConfirmCheck] = useState(false)
  const [userToPermanentDeleteConfirm, setUserToPermanentDeleteConfirm] = useState<DeletedUserData | null>(null)
  const [permanentDeleteCheck, setPermanentDeleteCheck] = useState(false)

  const [undoToast, setUndoToast] = useState<{ msg: string; userToRestore: UserAccountData } | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setUndoToast(null)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const showToastWithUndo = (msg: string, userToRestore: UserAccountData) => {
    setUndoToast({ msg, userToRestore })
    setToastMsg(null)
    setTimeout(() => setUndoToast(null), 7000)
  }

  // Filtered Users for Tab 1
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'All Roles' && u.role !== roleFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.employeeId.toLowerCase().includes(q) ||
          u.team.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [users, searchQuery, roleFilter])

  // Filtered Recruiter Matrix Users for Tab 2
  const filteredRecruiterUsers = useMemo(() => {
    return recruiterUsers.filter(u => {
      if (searchQuery.trim() && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (roleFilter !== 'All Roles' && u.roleName !== roleFilter) {
        return false
      }
      return true
    })
  }, [recruiterUsers, searchQuery, roleFilter])

  return {
    role, canModifyUsers,
    activeTab, setActiveTab,
    users, setUsers, roles, setRoles, recruiterUsers, setRecruiterUsers,
    viewMode, setViewMode, selectedUser, setSelectedUser,
    searchQuery, setSearchQuery, roleFilter, setRoleFilter,
    newUserName, setNewUserName, newUserEmail, setNewUserEmail, newUserPhone, setNewUserPhone,
    newUserEmpId, setNewUserEmpId, newUserRole, setNewUserRole, newUserTeam, setNewUserTeam,
    newUserSupervisor, setNewUserSupervisor, newUserClient, setNewUserClient, tempPassword, setTempPassword,
    resetNewPass, setResetNewPass, resetConfirmPass, setResetConfirmPass, showPassword, setShowPassword,
    forceChangePass, setForceChangePass, sendEmailNotify, setSendEmailNotify,
    targetRole, setTargetRole, targetClient, setTargetClient, reassignReason, setReassignReason,
    adjustClientUser, setAdjustClientUser,
    selectedUserForManage, setSelectedUserForManage, tempUserPermissions, setTempUserPermissions, tempUserRoleName, setTempUserRoleName,
    newRoleName, setNewRoleName, newRoleDescription, setNewRoleDescription, newRoleTemplate, setNewRoleTemplate, newPermissions, setNewPermissions,
    editingRole, setEditingRole, tempRolePermissions, setTempRolePermissions,
    deletedUsers, setDeletedUsers, userSubTab, setUserSubTab,
    userToDeleteConfirm, setUserToDeleteConfirm, deleteConfirmCheck, setDeleteConfirmCheck,
    userToPermanentDeleteConfirm, setUserToPermanentDeleteConfirm, permanentDeleteCheck, setPermanentDeleteCheck,
    undoToast, setUndoToast, toastMsg, setToastMsg,
    showToast, showToastWithUndo, filteredUsers, filteredRecruiterUsers,
  }
}

export type UserManagementState = ReturnType<typeof useUserManagementState>
