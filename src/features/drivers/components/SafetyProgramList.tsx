import { getDriverSafetyPrograms } from '@/lib/fetchers/drivers'

export default async function SafetyProgramList({ driverId }: { driverId: number }) {
  const programs = await getDriverSafetyPrograms(driverId)
  if (programs.length === 0) return <p>No safety programs.</p>
  return (
    <ul className="space-y-1 text-sm">
      {programs.map(p => (
        <li key={p.id}>
          {p.title} - {p.status}
          {p.completedAt ? ` (${p.completedAt.toISOString().slice(0,10)})` : ''}
        </li>
      ))}
    </ul>
  )
}
