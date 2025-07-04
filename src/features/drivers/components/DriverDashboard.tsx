import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDriverDashboardAction } from '@/lib/actions/drivers'

interface Props {
  orgId: number
}

export default async function DriverDashboard({ orgId }: Props) {
  const stats = await getDriverDashboardAction({ orgId })
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Drivers</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.totalDrivers}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Available</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.availableDrivers}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>On Duty</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.onDutyDrivers}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Loads</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.scheduledLoads}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Training</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.upcomingTrainings}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Compliance</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.pendingComplianceTasks}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Pay Statements</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.recentPayStatements}
        </CardContent>
      </Card>
    </div>
  )
}
