export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface UserProfile {
  id: number
  email: string
  name: string | null
  role: import('./rbac').SystemRoles
  status: UserStatus
  createdAt: Date
  updatedAt: Date
}

