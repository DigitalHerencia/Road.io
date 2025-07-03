"use client"

import { useState } from 'react'
import { sendDriverMessageAction } from '@/lib/actions/dispatch'
import { Button } from '@/components/ui/button'

interface Props {
  driverId: number
}

export default function DriverMessageForm({ driverId }: Props) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function sendMessage() {
    const res = await sendDriverMessageAction({ driverId, message })
    if (res.success) {
      setMessage('')
      setStatus('Message sent')
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="border rounded w-full p-2"
      />
      <Button type="button" onClick={sendMessage} size="sm">
        Send
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  )
}
