"use client"

import { useState, useEffect, useCallback } from 'react'
import { sendDriverMessageAction } from '@/lib/actions/dispatch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  driverId: number
}

export default function MobileDriverMessageForm({ driverId }: Props) {
  const [text, setText] = useState('')
  const [queue, setQueue] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('dispatchOfflineMessages')
    if (stored) setQueue(JSON.parse(stored))
  }, [])

  const flush = useCallback(async () => {
    if (navigator.onLine && queue.length > 0) {
      const items = [...queue]
      setQueue([])
      localStorage.setItem('dispatchOfflineMessages', '[]')
      for (const msg of items) {
        await sendDriverMessageAction({ driverId, message: msg })
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
      await sendDriverMessageAction({ driverId, message: msg })
    } else {
      const updated = [...queue, msg]
      setQueue(updated)
      localStorage.setItem('dispatchOfflineMessages', JSON.stringify(updated))
    }
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input value={text} onChange={e => setText(e.target.value)} placeholder="Message" />
      <Button type="submit">Send</Button>
    </form>
  )
}
