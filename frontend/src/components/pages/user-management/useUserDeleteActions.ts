import type { UserAccountData, DeletedUserData } from './types'
import type { UserManagementState } from './useUserManagementState'

export function useUserDeleteActions(s: UserManagementState) {
  const {
    canModifyUsers, users, setUsers, setRecruiterUsers,
    deletedUsers, setDeletedUsers, userToDeleteConfirm, setUserToDeleteConfirm,
    deleteConfirmCheck, setDeleteConfirmCheck, setUserToPermanentDeleteConfirm, setPermanentDeleteCheck,
    setUndoToast, showToast, showToastWithUndo
  } = s
  const role = s.role

  const promptDeleteUser = (user: UserAccountData) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin and Dev Team can delete user accounts.')
      return
    }
    setUserToDeleteConfirm(user)
    setDeleteConfirmCheck(false)
  }

  // Handle Delete User (Soft Delete to Deleted Users list with Undo)
  const handleDeleteUser = (userId: string, userName: string) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin and Dev Team can delete user accounts.')
      return
    }
    const userToDelete = users.find(u => u.id === userId)
    if (!userToDelete) return

    setUsers(prev => prev.filter(u => u.id !== userId))
    setRecruiterUsers(prev => prev.filter(u => u.id !== userId))

    const deletedRecord: DeletedUserData = {
      ...userToDelete,
      deletedAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today`,
      deletedBy: role === 'superadmin' ? 'Super Admin' : 'Admin User',
    }

    setDeletedUsers(prev => [deletedRecord, ...prev])
    showToastWithUndo(`User account for "${userName}" moved to Deleted Users / Trash Bin.`, userToDelete)
  }

  // Confirm Two-Step Delete Action
  const handleConfirmDeleteUser = () => {
    if (!userToDeleteConfirm || !deleteConfirmCheck) return
    const targetUser = userToDeleteConfirm
    setUserToDeleteConfirm(null)
    setDeleteConfirmCheck(false)
    handleDeleteUser(targetUser.id, targetUser.name)
  }

  // Handle Restore User
  const handleRestoreUser = (userId: string) => {
    const userToRestore = deletedUsers.find(u => u.id === userId)
    if (!userToRestore) return

    setDeletedUsers(prev => prev.filter(u => u.id !== userId))
    const { deletedAt, deletedBy, ...cleanUser } = userToRestore
    setUsers(prev => [cleanUser, ...prev])
    setUndoToast(null)
    showToast(`Successfully restored user account for "${cleanUser.name}"!`)
  }

  // Prompt Permanent Delete Modal
  const promptPermanentDeleteUser = (user: DeletedUserData) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin can permanently remove user records.')
      return
    }
    setUserToPermanentDeleteConfirm(user)
    setPermanentDeleteCheck(false)
  }

  // Handle Permanent Delete User
  const handlePermanentDeleteUser = (userId: string, userName: string) => {
    if (!canModifyUsers) {
      showToast('Access Restricted: Only Super Admin can permanently remove user records.')
      return
    }
    setDeletedUsers(prev => prev.filter(u => u.id !== userId))
    showToast(`User account "${userName}" permanently purged from system.`)
  }

  // Handle Bulk Actions for Deleted Users
  const handleRestoreAllDeleted = () => {
    if (deletedUsers.length === 0) return
    const restored = deletedUsers.map(({ deletedAt, deletedBy, ...u }) => u)
    setUsers(prev => [...restored, ...prev])
    setDeletedUsers([])
    showToast(`Restored all ${restored.length} deleted user accounts!`)
  }

  const handleEmptyTrash = () => {
    if (deletedUsers.length === 0) return
    const count = deletedUsers.length
    setDeletedUsers([])
    showToast(`Permanently cleared ${count} user accounts from trash bin.`)
  }

  return {
    promptDeleteUser,
    handleDeleteUser,
    handleConfirmDeleteUser,
    handleRestoreUser,
    promptPermanentDeleteUser,
    handlePermanentDeleteUser,
    handleRestoreAllDeleted,
    handleEmptyTrash,
  }
}
