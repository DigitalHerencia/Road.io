import { updateUserAction } from '@/lib/actions/users'
import { SystemRoles } from '@/types/rbac'
import type { UserProfile } from '@/types/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { Role } from '@/types/roles'

interface Props {
  user: UserProfile
  roles: Role[]
}

export default function UserForm({ user, roles }: Props) {
  return (
    <form action={updateUserAction} className="space-y-4 max-w-md">
      <input type="hidden" name="id" value={user.id} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={user.name ?? ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select id="role" name="role" defaultValue={user.role} className="border rounded h-9 px-3 w-full">
          {Object.values(SystemRoles).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="customRoleId">Custom Role</Label>
        <select id="customRoleId" name="customRoleId" defaultValue={user.customRoleId ?? ''} className="border rounded h-9 px-3 w-full">
          <option value="">None</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" defaultValue={user.status} className="border rounded h-9 px-3 w-full">
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}

