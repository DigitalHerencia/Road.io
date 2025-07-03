import { getDriverCertifications } from '@/lib/fetchers/drivers'

export default async function DriverCertificationList({ driverId }: { driverId: number }) {
  const certs = await getDriverCertifications(driverId)
  if (certs.length === 0) return <p>No certifications.</p>
  return (
    <ul className="space-y-1 text-sm">
      {certs.map(c => (
        <li key={c.id}>
          {c.type}
          {c.expiresAt ? ` (expires ${c.expiresAt.toISOString().slice(0,10)})` : ''}
        </li>
      ))}
    </ul>
  )
}
