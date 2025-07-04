"use client"

import { useState, useEffect, useCallback } from 'react'
import { recordVehicleMaintenance } from '@/lib/actions/vehicles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  vehicleId: number
}

interface OfflineRecord {
  maintenanceDate: string
  mileage?: number
  vendor?: string
  description?: string
  cost?: number
}

const STORAGE_KEY = 'maintenanceQueue'

export default function MobileMaintenanceForm({ vehicleId }: Props) {
  const [queue, setQueue] = useState<OfflineRecord[]>([])

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
        await recordVehicleMaintenance(vehicleId, {
          maintenanceDate: new Date(item.maintenanceDate),
          mileage: item.mileage,
          vendor: item.vendor,
          description: item.description,
          cost: item.cost,
        })
      }
    }
  }, [queue, vehicleId])

  useEffect(() => {
    flush()
    window.addEventListener('online', flush)
    return () => window.removeEventListener('online', flush)
  }, [flush])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const record: OfflineRecord = {
      maintenanceDate: formData.get('maintenanceDate') as string,
      mileage: formData.get('mileage') ? Number(formData.get('mileage')) : undefined,
      vendor: formData.get('vendor') as string || undefined,
      description: formData.get('description') as string || undefined,
      cost: formData.get('cost') ? Number(formData.get('cost')) : undefined,
    }
    if (navigator.onLine) {
      await recordVehicleMaintenance(vehicleId, {
        maintenanceDate: new Date(record.maintenanceDate),
        mileage: record.mileage,
        vendor: record.vendor,
        description: record.description,
        cost: record.cost,
      })
    } else {
      const updated = [...queue, record]
      setQueue(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
    event.currentTarget.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="maintenanceDate">Date</Label>
        <Input id="maintenanceDate" name="maintenanceDate" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mileage">Mileage</Label>
        <Input id="mileage" name="mileage" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vendor">Vendor</Label>
        <Input id="vendor" name="vendor" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" className="w-full border rounded p-2 h-20" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cost">Cost (cents)</Label>
        <Input id="cost" name="cost" type="number" />
      </div>
      <Button type="submit" className="w-full">Record Maintenance</Button>
    </form>
  )
}
