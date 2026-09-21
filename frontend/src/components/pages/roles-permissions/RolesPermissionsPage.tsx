import { Role } from '../../../types'
import { useRolesPermissions } from './useRolesPermissions'
import { RestrictedAccessView } from './RestrictedAccessView'
import { ConfigurePermissionsView } from './ConfigurePermissionsView'
import { CreateRoleView } from './CreateRoleView'
import { RolesPermissionsList } from './RolesPermissionsList'

interface RolesPermissionsPageProps {
  role?: Role
}

export function RolesPermissionsPage({ role = 'superadmin' }: RolesPermissionsPageProps) {
  if (role !== 'superadmin' && role !== 'devteam') {
    return <RestrictedAccessView />
  }
  const vm = useRolesPermissions()
  if (vm.viewMode === 'configure_permissions' && vm.editingRole) {
    return <ConfigurePermissionsView {...vm} />
  }
  if (vm.viewMode === 'create_role') {
    return <CreateRoleView {...vm} />
  }
  return <RolesPermissionsList {...vm} />
}
