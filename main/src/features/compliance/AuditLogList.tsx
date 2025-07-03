import { listComplianceAuditLogs } from '@/lib/fetchers/compliance'

interface Props {
  orgId: number
  limit?: number
}

export default async function AuditLogList({ orgId, limit = 5 }: Props) {
  const logs = await listComplianceAuditLogs(orgId, limit)
  if (logs.length === 0) {
    return <p>No recent activity.</p>
  }
  return (
    <ul className="text-sm space-y-1">
      {logs.map(log => (
        <li key={String(log.id)}>
          {new Date(log.createdAt as Date).toLocaleDateString()} - {log.action}
        </li>
      ))}
    </ul>
  )
}
