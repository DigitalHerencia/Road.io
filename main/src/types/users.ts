export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface UserProfile {
  orgId: number
  id: number
  email: string
  name: string | null
  role: import('./rbac').SystemRoles
  customRoleId: number | null
  customRoleName: string | null
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

