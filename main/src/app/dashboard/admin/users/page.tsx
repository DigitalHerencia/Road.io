import InviteUserForm from '@/features/admin/components/InviteUserForm'
import { requirePermission } from '@/lib/rbac'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminUsersPage() {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles')
  const orgUsers = await db.select().from(users).where(eq(users.orgId, currentUser.orgId))

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
          <ul className="space-y-2">
            {orgUsers.map(u => (
              <li key={u.id} className="flex justify-between">
                <span>{u.email}</span>
                <span className="text-muted-foreground">{u.role}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
