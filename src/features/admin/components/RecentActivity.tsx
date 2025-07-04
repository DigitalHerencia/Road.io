import { getRecentAuditLogsAction } from '@/lib/actions/admin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function RecentActivity() {
  const logs = await getRecentAuditLogsAction({ limit: 5 })
  return (
    <Card>
      <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
      <CardContent className="text-sm">
        <ul className="space-y-1">
          {logs.map(l => (
            <li key={l.id} className="flex justify-between">
              <span>{l.action}</span>
              <span>{new Date(l.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
