"use client"

import { useState, useEffect, useCallback } from 'react'
import { recordVehicleInspection } from '@/lib/actions/compliance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  vehicleId: number
}

interface OfflineInspection {
  inspectionDate: string
  passed: boolean
  notes?: string
}

const STORAGE_KEY = 'inspectionQueue'

export default function MobileInspectionForm({ vehicleId }: Props) {
  const [queue, setQueue] = useState<OfflineInspection[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setQueue(JSON.parse(stored))
  }, [])

  const flush = useCallback(async () => {
    if (navigator.onLine && queue.length) {
      const items = [...queue]
      setQueue([])
      localStorage.setItem(STORAGE_KEY, '[]')
      for (const item of items) {
        const form = new FormData()
        form.set('vehicleId', vehicleId.toString())
        form.set('inspectionDate', item.inspectionDate)
        form.set('passed', String(item.passed))
        if (item.notes) form.set('notes', item.notes)
        await recordVehicleInspection(form)
      }
    }
  }, [queue, vehicleId])

  useEffect(() => {
    flush()
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const record: OfflineInspection = {
      inspectionDate: formData.get('inspectionDate') as string,
      passed: formData.get('passed') === 'on',
      notes: formData.get('notes') as string || undefined,
    }
    if (navigator.onLine) {
      const form = new FormData()
      form.set('vehicleId', vehicleId.toString())
      form.set('inspectionDate', record.inspectionDate)
      form.set('passed', String(record.passed))
      if (record.notes) form.set('notes', record.notes)
      await recordVehicleInspection(form)
    } else {
      const updated = [...queue, record]
      setQueue(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
    e.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="inspectionDate">Date</Label>
        <Input id="inspectionDate" name="inspectionDate" type="date" required />
      </div>
      <div className="flex items-center gap-2">
        <input id="passed" name="passed" type="checkbox" defaultChecked />
        <Label htmlFor="passed">Passed</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea id="notes" name="notes" className="w-full border rounded p-2 h-20" />
      </div>
      <Button type="submit" className="w-full">Record Inspection</Button>
    </form>
  )
}
