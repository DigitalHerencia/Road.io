import { getTenantMetrics, getResourceAllocation } from "@/lib/fetchers/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  orgId: number;
}

export default async function TenantMetrics({ orgId }: Props) {
  const metrics = await getTenantMetrics(orgId);
  const resources = await getResourceAllocation(orgId);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Organization Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Users</span>
            <span>{metrics.totalUsers}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Users</span>
            <span>{metrics.activeUsers}</span>
          </div>
          <div className="flex justify-between">
            <span>Max Users</span>
            <span>{metrics.maxUsers}</span>
          </div>
          <div className="flex justify-between">
            <span>Subscription</span>
            <span>
              {metrics.subscriptionPlan} / {metrics.subscriptionStatus}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cross-org Load Assignments</span>
            <span>{metrics.crossOrgLoadAssignments}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Users</span>
            <span>{resources.users}</span>
          </div>
          <div className="flex justify-between">
            <span>Drivers</span>
            <span>{resources.drivers}</span>
          </div>
          <div className="flex justify-between">
            <span>Vehicles</span>
            <span>{resources.vehicles}</span>
          </div>
          <div className="flex justify-between">
            <span>Loads</span>
            <span>{resources.loads}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
