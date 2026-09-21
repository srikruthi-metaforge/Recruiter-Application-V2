import { Role } from '../../../types'
import { useUserManagement } from './useUserManagement'
import { ConfigurePermissionsView } from './ConfigurePermissionsView'
import { CreateRoleView } from './CreateRoleView'
import { CreateUserView } from './CreateUserView'
import { ResetPasswordView } from './ResetPasswordView'
import { AssignRoleView } from './AssignRoleView'
import { UserManagementList } from './UserManagementList'

interface UserManagementPageProps {
  role?: Role
  initialTab?: 'users' | 'permissions' | 'role_definitions'
}

export function UserManagementPage({ role = 'superadmin', initialTab = 'users' }: UserManagementPageProps) {
  const vm = useUserManagement(role, initialTab)
  if (vm.viewMode === 'configure_permissions' && vm.editingRole) {
    return <ConfigurePermissionsView {...vm} />
  }
  if (vm.viewMode === 'create_role') {
    return <CreateRoleView {...vm} />
  }
  if (vm.viewMode === 'create_user') {
    return <CreateUserView {...vm} />
  }
  if (vm.viewMode === 'reset_password' && vm.selectedUser) {
    return <ResetPasswordView {...vm} />
  }
  if (vm.viewMode === 'assign_role' && vm.selectedUser) {
    return <AssignRoleView {...vm} />
  }
  return <UserManagementList {...vm} />
}
