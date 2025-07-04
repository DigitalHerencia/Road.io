import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { fetchLoadCompletionMetrics } from '@/lib/fetchers/dispatch'

interface Props {
  orgId: number
}

export default async function LoadCompletionReport({ orgId }: Props) {
  const metrics = await fetchLoadCompletionMetrics(orgId)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Load Completion</CardTitle>
        <CardDescription>Completed vs total loads</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Loads</span>
          <span>{metrics.totalLoads}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Completed Loads</span>
          <span>{metrics.completedLoads}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>On-Time Deliveries</span>
          <span>{metrics.onTimeDeliveries}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>On-Time Rate</span>
          <span>{(metrics.onTimeRate * 100).toFixed(0)}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
