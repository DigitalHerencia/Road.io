import { getCurrentUser } from '@/lib/rbac'
import { getAllVehicles } from '@/lib/fetchers/vehicles'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function VehiclesPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const vehicles = await getAllVehicles(user.orgId)

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <Link href="/dashboard/vehicles/new">
          <Button>Add Vehicle</Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {vehicles.map(v => (
          <div key={v.id} className="border rounded p-4 space-y-1">
            <div className="font-medium">{v.make} {v.model} ({v.year})</div>
            <div className="text-sm text-muted-foreground">VIN: {v.vin}</div>
            <div className="text-sm text-muted-foreground">Status: {v.status}</div>
            <Link href={`/dashboard/vehicles/${v.id}/edit`} className="text-blue-600 text-sm">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
