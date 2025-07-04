import { getDriverPerformanceMetrics } from '@/lib/fetchers/drivers'

export default async function PerformanceMetrics({ driverId }: { driverId: number }) {
  const metrics = await getDriverPerformanceMetrics(driverId)
  return (
    <div className="space-y-1 text-sm">
      <p><strong>Total Miles:</strong> {metrics.totalMiles}</p>
      <p><strong>Fuel Efficiency:</strong> {metrics.fuelEfficiency} MPG</p>
      <p><strong>Accidents:</strong> {metrics.accidentCount}</p>
      <p><strong>Violations:</strong> {metrics.violationCount}</p>
      <p><strong>Completion Rate:</strong> {Math.round(metrics.completionRate * 100)}%</p>
    </div>
  )
}
