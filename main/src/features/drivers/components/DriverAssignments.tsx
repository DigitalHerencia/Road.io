import { getDriverAssignmentStats } from '@/lib/fetchers/drivers'

export default async function DriverAssignments({ driverId }: { driverId: number }) {
  const stats = await getDriverAssignmentStats(driverId)
  return (
    <div className="space-y-1 text-sm">
      <p><strong>Current Loads:</strong> {stats.current}</p>
      <p><strong>Completed Loads:</strong> {stats.completed}</p>
      <p><strong>Completion Rate:</strong> {Math.round(stats.completionRate * 100)}%</p>
    </div>
  )
}
