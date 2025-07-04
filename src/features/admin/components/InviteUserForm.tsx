'use client'

import { useState, useTransition } from 'react'
import { inviteUserAction } from '@/lib/actions/admin'
import { SystemRoles } from '@/types/rbac'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InviteUserForm() {
  const [message, setMessage] = useState<string | null>(null)

  const [pending, start] = useTransition()

  const invite = async (formData: FormData) => {
    const result = await inviteUserAction(formData)
    if (result.success) {
      setMessage('Invitation sent')
    } else {
      setMessage(result.error ?? 'Failed to invite user')
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    start(() => invite(formData))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select id="role" name="role" className="border rounded-md h-9 px-3 w-full">
          {Object.values(SystemRoles).map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>{pending ? 'Sending...' : 'Send Invitation'}</Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </form>
  )
}
