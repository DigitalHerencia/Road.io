"use client"

import { useState } from 'react'
import { broadcastEmergencyAlertAction } from '@/lib/actions/dispatch'
import { Button } from '@/components/ui/button'

export default function EmergencyAlertForm() {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  async function sendAlert() {
    const res = await broadcastEmergencyAlertAction({ message })
    if (res.success) {
      setMessage('')
      setStatus(`Sent to ${res.count} drivers`)
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="border rounded w-full p-2"
      />
      <Button type="button" onClick={sendAlert} size="sm" variant="destructive">
        Broadcast Alert
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  )
}
