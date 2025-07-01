import Link from 'next/link'
import { bulkUpdateStatusAction } from '@/lib/actions/users'
import type { UserProfile } from '@/types/users'
import { Button } from '@/components/ui/button'

interface Props {
  users: UserProfile[]
}

export default function UserList({ users }: Props) {
  return (
    <form action={async (formData) => {
      'use server'
      const ids = formData.getAll('ids').map(id => Number(id))
      const status = formData.get('status') as 'ACTIVE'|'INACTIVE'|'SUSPENDED'
      await bulkUpdateStatusAction({ ids, status })
    }} className="space-y-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th></th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="px-2">
                <input type="checkbox" name="ids" value={u.id} />
              </td>
              <td className="px-2">{u.email}</td>
              <td className="px-2">{u.role}</td>
              <td className="px-2">{u.status}</td>
              <td className="px-2">
                <Link href={`/dashboard/admin/users/${u.id}/edit`} className="text-blue-600 text-sm">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2">
        <select name="status" className="border rounded h-9 px-3">
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <Button type="submit">Update Selected</Button>
      </div>
    </form>
  )
}

