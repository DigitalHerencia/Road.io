"use client"

import { useState } from 'react'
import { sendCustomerNotificationAction } from '@/lib/actions/dispatch'
import { Button } from '@/components/ui/button'

interface Props {
  loadId: number
  email: string
}

export default function CustomerNotificationForm({ loadId, email }: Props) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function sendNote() {
    const res = await sendCustomerNotificationAction({ loadId, email, message, type: 'status' })
    if (res.success) {
      setMessage('')
      setStatus('Notification sent')
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="border rounded w-full p-2"
      />
      <Button type="button" onClick={sendNote} size="sm">
        Send Notification
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  )
}
