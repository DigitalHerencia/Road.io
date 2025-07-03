import { getDriverViolations } from '@/lib/fetchers/drivers'

export default async function DriverViolationList({ driverId }: { driverId: number }) {
  const records = await getDriverViolations(driverId)
  if (records.length === 0) return <p>No violations.</p>
  return (
    <ul className="space-y-1 text-sm">
      {records.map(v => (
        <li key={v.id}>
          {v.type} - {v.occurredAt.toISOString().slice(0,10)}
          {v.description ? ` (${v.description})` : ''}
        </li>
      ))}
    </ul>
  )
}
