import InviteUserForm from '@/features/admin/components/InviteUserForm'
import { requirePermission } from '@/lib/rbac'
import { getOrgUsers } from '@/lib/fetchers/users'
import UserList from '@/features/admin/components/UserList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminUsersPage() {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles')
  const orgUsers = await getOrgUsers(currentUser.orgId)

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite User</CardTitle>
        </CardHeader>
        <CardContent>
          <InviteUserForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserList users={orgUsers} />
        </CardContent>
      </Card>
    </div>
  )
}
