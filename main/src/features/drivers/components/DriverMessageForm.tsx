"use client"

import { useState, useEffect } from 'react'
import { sendDriverMessage } from '@/lib/actions/drivers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  driverId: number
}

export default function DriverMessageForm({ driverId }: Props) {
  const [text, setText] = useState('')
  const [queue, setQueue] = useState<string[]>([])

  // Load any queued messages
  useEffect(() => {
    const stored = localStorage.getItem('driverOfflineMessages')
    if (stored) setQueue(JSON.parse(stored))
  }, [])

  // Flush when online
  const flush = useCallback(async () => {
    if (navigator.onLine && queue.length > 0) {
      const items = [...queue]
      setQueue([])
      localStorage.setItem('driverOfflineMessages', '[]')
      for (const msg of items) {
        const data = new FormData()
        data.set('driverId', driverId.toString())
        data.set('sender', 'DRIVER')
        data.set('message', msg)
        await sendDriverMessage(data)
      }
    }
  }, [queue, driverId])

  useEffect(() => {
    flush()
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = text.trim()
    if (!msg) return
    if (navigator.onLine) {
      const data = new FormData()
      data.set('driverId', driverId.toString())
      data.set('sender', 'DRIVER')
      data.set('message', msg)
      await sendDriverMessage(data)
    } else {
      const updated = [...queue, msg]
      setQueue(updated)
      localStorage.setItem('driverOfflineMessages', JSON.stringify(updated))
    }
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type a message"
      />
      <Button type="submit">Send</Button>
    </form>
  )
}
