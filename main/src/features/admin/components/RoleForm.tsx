'use client'

import { useState } from 'react'
import type { Role } from '@/types/roles'
import { SystemRoles } from '@/types/rbac'
import { createRoleAction, updateRoleAction } from '@/lib/actions/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  role?: Role
  permissions: string[]
}

export default function RoleForm({ role, permissions }: Props) {
  const [selected, setSelected] = useState<string[]>(role?.permissions ?? [])

  return (
    <form
      action={async (formData: FormData) => {
        const common = {
          name: formData.get('name') as string,
          description: formData.get('description') as string | undefined,
          baseRole: formData.get('baseRole') as SystemRoles,
          permissions: selected,
        }
        if (role) await updateRoleAction({ id: role.id, ...common })
        else await createRoleAction(common)
      }}
      className="space-y-4"
    >
      {role && <input type="hidden" name="id" value={role.id} />}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={role?.name ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" defaultValue={role?.description ?? ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="baseRole">Base Role</Label>
        <select id="baseRole" name="baseRole" defaultValue={role?.baseRole ?? 'MEMBER'} className="border rounded h-9 px-3 w-full">
          {Object.values(SystemRoles).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="grid grid-cols-2 gap-2">
          {permissions.map(p => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                value={p}
                checked={selected.includes(p)}
                onChange={e => {
                  const checked = e.target.checked
                  setSelected(prev => checked ? [...prev, p] : prev.filter(x => x !== p))
                }}
              />
              {p}
            </label>
          ))}
        </div>
      </div>
      <Button type="submit">{role ? 'Update' : 'Create'} Role</Button>
    </form>
  )
}

