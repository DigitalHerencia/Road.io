export interface Role {
  id: number
  orgId: number
  name: string
  description: string | null
  baseRole: import('./rbac').SystemRoles
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}

