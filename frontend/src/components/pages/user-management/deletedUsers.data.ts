import { DeletedUserData } from './types'

export const INITIAL_DELETED_USERS: DeletedUserData[] = [
  {
    id: 'usr-del-901',
    name: 'Rachel Green',
    email: 'rachel.g@metaforgeit.com',
    phone: '+91 98765 11223',
    employeeId: 'EMP-2023-044',
    role: 'Recruiter',
    roleCode: 'recruiter',
    team: 'Engineering Pod',
    supervisor: 'Charlie Darwin (Lead)',
    assignedClient: 'Microsoft',
    status: 'Active',
    twoFactorEnabled: true,
    lastLogin: 'Yesterday • 05:30 PM',
    lastPasswordChange: '10 May 2026',
    deletedAt: '09:15 AM, Today',
    deletedBy: 'Super Admin',
  },
]
