import Link from 'next/link'
import { getAllDrivers } from '@/lib/fetchers/drivers'
import DriverSummary from '@/features/drivers/components/DriverSummary'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function DriversPage() {
  const drivers = await getAllDrivers()
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Link href="/drivers/new">
          <Button>Create Driver</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map(driver => (
          <Link key={driver.id} href={`/drivers/${driver.id}`}
            className="hover:opacity-80 transition-opacity">
            <DriverSummary driver={driver} />
          </Link>
        ))}
        {drivers.length === 0 && <p>No drivers found.</p>}
      </div>
    </div>
  )
}
