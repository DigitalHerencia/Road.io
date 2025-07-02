import InviteUserForm from '@/features/admin/components/InviteUserForm'
import { requirePermission } from '@/lib/rbac'
import { getUserList } from '@/lib/fetchers/users'
import UserList from '@/features/admin/components/UserList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles')
  const sort = (searchParams.sort as 'name'|'email'|'role'|'createdAt') || 'createdAt'
  const status = searchParams.status as 'ACTIVE' | 'INACTIVE' | undefined
  const orgUsers = await getUserList(currentUser.orgId, sort, status)

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
        <CardContent className="space-y-4">
          <form method="get" className="flex items-end gap-2">
            <div>
              <label className="text-sm" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={status ?? ''} className="border rounded h-8 px-2 ml-2">
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-sm" htmlFor="sort">Sort</label>
              <select id="sort" name="sort" defaultValue={sort} className="border rounded h-8 px-2 ml-2">
                <option value="createdAt">Created</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </select>
            </div>
            <button type="submit" className="h-8 px-3 rounded bg-primary text-primary-foreground">Apply</button>
          </form>
          <UserList users={orgUsers} />
        </CardContent>
      </Card>
    </div>
  )
}
