import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDriverById } from '@/lib/fetchers/drivers'
import DriverSummary from '@/features/drivers/components/DriverSummary'
import DriverStatusForm from '@/features/drivers/components/DriverStatusForm'
import DriverAssignments from '@/features/drivers/components/DriverAssignments'
import DriverViolationList from '@/features/drivers/components/DriverViolationList'
import DriverCertificationList from '@/features/drivers/components/DriverCertificationList'
import PerformanceMetrics from '@/features/drivers/components/PerformanceMetrics'
import PerformanceReviewList from '@/features/drivers/components/PerformanceReviewList'
import PerformanceReviewForm from '@/features/drivers/components/PerformanceReviewForm'
import SafetyProgramList from '@/features/drivers/components/SafetyProgramList'
import ViolationForm from '@/features/drivers/components/ViolationForm'
import CertificationForm from '@/features/drivers/components/CertificationForm'
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
        <div>
          <h2 className="font-semibold">Performance Metrics</h2>
          <PerformanceMetrics driverId={driver.id} />
        </div>
        <div>
          <h2 className="font-semibold">Performance Reviews</h2>
          <PerformanceReviewList driverId={driver.id} />
          <PerformanceReviewForm driverId={driver.id} />
        </div>
        <div>
          <h2 className="font-semibold">Safety Programs</h2>
          <SafetyProgramList driverId={driver.id} />
        </div>
        <div>
          <h2 className="font-semibold">Violations</h2>
          <DriverViolationList driverId={driver.id} />
          <ViolationForm driverId={driver.id} />
        </div>
        <div>
          <h2 className="font-semibold">Certifications</h2>
          <DriverCertificationList driverId={driver.id} />
          <CertificationForm driverId={driver.id} />
        </div>
      </div>
    </div>
  )
}
