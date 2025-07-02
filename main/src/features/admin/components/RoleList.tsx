import Link from 'next/link'
import type { Role } from '@/types/roles'
import { Button } from '@/components/ui/button'

async function handleDeleteRole(id: number) {
  'use server'
  await deleteRoleAction(id)
}

interface Props {
  roles: Role[]
}

export default function RoleList({ roles }: Props) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th>Name</th>
          <th>Base</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {roles.map(r => (
          <tr key={r.id} className="border-t">
            <td className="px-2 py-1">{r.name}</td>
            <td className="px-2 py-1">{r.baseRole}</td>
            <td className="px-2 py-1 flex gap-2">
              <Link href={`/dashboard/admin/roles/${r.id}/edit`} className="text-blue-600">Edit</Link>
              <form action={() => handleDeleteRole(r.id)}>
                <Button type="submit" variant="ghost" size="sm">Delete</Button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

