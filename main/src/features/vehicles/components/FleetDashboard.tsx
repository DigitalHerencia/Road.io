import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getFleetOverview } from '@/lib/fetchers/vehicles'

interface Props {
  orgId: number
}

export default async function FleetDashboard({ orgId }: Props) {
  const metrics = await getFleetOverview(orgId)
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Fleet Size</CardTitle>
          <CardDescription>Total vehicles in your organization</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{metrics.total}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active</CardTitle>
          <CardDescription>Vehicles currently operational</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{metrics.active}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>In Maintenance</CardTitle>
          <CardDescription>Vehicles under maintenance</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{metrics.maintenance}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Retired</CardTitle>
          <CardDescription>Inactive vehicles</CardDescription>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{metrics.retired}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Due</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{metrics.maintenanceDue}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inspection Due</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{metrics.inspectionDue}</CardContent>
      </Card>
    </div>
  )
}
