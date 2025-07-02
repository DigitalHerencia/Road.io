import type { AuditLog } from '@/lib/schema'

export default function AssignmentHistory({ history }: { history: AuditLog[] }) {
  return (
    <div className="space-y-2 text-sm">
      {history.map(entry => {
        const details = entry.details as { driverId?: number; vehicleId?: number } | null   
        return (
          <div key={entry.id} className="border rounded p-2">
            <div className="font-medium">
              {new Date(entry.createdAt).toLocaleString()}
            </div>
            <div>Driver: {details?.driverId ?? 'N/A'}</div>
            <div>Vehicle: {details?.vehicleId ?? 'N/A'}</div>
          </div>
        )
      })
      {history.length === 0 && <p>No assignments yet.</p>}
    </div>
  )
}
