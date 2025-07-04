import { getDriverTrainingRecords } from '@/lib/fetchers/training'

export default async function DriverTrainingList({ driverId }: { driverId: number }) {
  const records = await getDriverTrainingRecords(driverId)
  if (records.length === 0) return <p>No training records.</p>
  return (
    <ul className="space-y-1 text-sm">
      {records.map(r => (
        <li key={r.id}>
          {r.title} - {r.status}
          {r.completedAt ? ` (${r.completedAt.toISOString().slice(0,10)})` : ''}
        </li>
      ))}
    </ul>
  )
}
