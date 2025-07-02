import RoleForm from '@/features/admin/components/RoleForm'
import RoleList from '@/features/admin/components/RoleList'
import { requirePermission } from '@/lib/rbac'
import { getOrgRoles } from '@/lib/fetchers/roles'
import { ROLE_PERMISSIONS } from '@/types/rbac'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function SettingsRolesPage() {
  const current = await requirePermission('org:admin:manage_users_and_roles')
  const roles = await getOrgRoles(current.orgId)
  const permissions = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat()))

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Role</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleForm permissions={permissions} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleList roles={roles} />
        </CardContent>
      </Card>
    </div>
  )
}
