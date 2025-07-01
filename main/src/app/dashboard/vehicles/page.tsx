import { getCurrentUser } from '@/lib/rbac'
import FleetDashboard from '@/features/vehicles/components/FleetDashboard'
import VehicleList from '@/features/vehicles/components/VehicleList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function VehiclesPage() {
  const user = await getCurrentUser()
  if (!user) return null
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <Link href="/dashboard/vehicles/new">
          <Button>Add Vehicle</Button>
        </Link>
      </div>
      <FleetDashboard orgId={user.orgId} />
      <VehicleList orgId={user.orgId} />
    </div>
  )
}
