import type { AuditLog } from '@/lib/schema'

export default function VehicleAssignmentHistory({ history }: { history: AuditLog[] }) {
  return (
    <div className="space-y-2 text-sm">
      {history.map(entry => {
        const details = entry.details as Record<string, unknown> | null
        return (
          <div key={entry.id} className="border rounded p-2">
            <div className="font-medium">{new Date(entry.createdAt).toLocaleString()}</div>
            <div>Load: {String(details?.loadId ?? 'N/A')}</div>
            <div>Driver: {String(details?.driverId ?? 'N/A')}</div>
          </div>
        )
      })}
      {history.length === 0 && <p>No assignments yet.</p>}
    </div>
  )
}
