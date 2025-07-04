import { getCurrentUser } from '@/lib/rbac'
import VehicleAvailabilityList from '@/features/vehicles/components/VehicleAvailabilityList'

export default async function VehicleAvailabilityPage() {
  const user = await getCurrentUser()
  if (!user) return null
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Vehicle Availability</h1>
      <VehicleAvailabilityList orgId={user.orgId} />
    </div>
  )
}
