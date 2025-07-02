import { getOrganizationStatsAction } from '@/lib/actions/admin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function OverviewCards() {
  const { stats } = await getOrganizationStatsAction()
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader><CardTitle>Total Users</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats?.totalUsers ?? '-'}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Active Users</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats?.activeUsers ?? '-'}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Max Users</CardTitle></CardHeader>
        <CardContent className="text-2xl font-bold">{stats?.maxUsers ?? '-'}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Subscription</CardTitle></CardHeader>
        <CardContent className="text-sm">
          {stats ? `${stats.subscriptionPlan} / ${stats.subscriptionStatus}` : '-'}
        </CardContent>
      </Card>
    </div>
  )
}
