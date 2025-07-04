import { getCurrentUser } from '@/lib/rbac'
import DriverDashboard from '@/features/drivers/components/DriverDashboard'
import { getAllDrivers } from '@/lib/fetchers/drivers'
import DriverSummary from '@/features/drivers/components/DriverSummary'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DriversDashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const drivers = await getAllDrivers()
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Drivers Dashboard</h1>
        <Link href="/drivers/new">
          <Button>Create Driver</Button>
        </Link>
      </div>
      <DriverDashboard orgId={user.orgId} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map(d => (
          <Link key={d.id} href={`/drivers/${d.id}`} className="hover:opacity-80 transition-opacity">
            <DriverSummary driver={d} />
          </Link>
        ))}
      </div>
    </div>
  )
}
