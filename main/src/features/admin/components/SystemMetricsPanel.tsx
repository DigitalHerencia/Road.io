import { getSystemMetricsAction } from '@/lib/actions/admin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function SystemMetricsPanel() {
  const metrics = await getSystemMetricsAction()
  return (
    <Card>
      <CardHeader><CardTitle>System Metrics</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Uptime</span><span>{Math.round(metrics.uptime/60)}m</span></div>
        <div className="flex justify-between"><span>Load Avg</span><span>{metrics.load.toFixed(2)}</span></div>
        <div className="flex justify-between">
          <span>Memory</span>
          <span>{(metrics.freeMem / 1024 / 1024).toFixed(0)} MB / {(metrics.totalMem / 1024 / 1024).toFixed(0)} MB</span>
        </div>
        <div className="flex justify-between"><span>DB Connections</span><span>{metrics.dbConnections}</span></div>
      </CardContent>
    </Card>
  )
}
