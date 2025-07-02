import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDriverById } from '@/lib/fetchers/drivers'
import DriverSummary from '@/features/drivers/components/DriverSummary'
import DriverStatusForm from '@/features/drivers/components/DriverStatusForm'
import DriverAssignments from '@/features/drivers/components/DriverAssignments'
import { Button } from '@/components/ui/button'

interface Params { params: { id: string } }

export default async function DriverDetailPage({ params }: Params) {
  const id = Number(params.id)
  const driver = await getDriverById(id)
  if (!driver) return notFound()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Driver Profile</h1>
        <div className="flex gap-2">
          <Link href={`/drivers/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link href="/drivers">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>
      <DriverSummary driver={driver} />
      <div className="space-y-4">
        <DriverStatusForm driverId={driver.id} status={driver.status} />
        <DriverAssignments driverId={driver.id} />
      </div>
    </div>
  )
}
