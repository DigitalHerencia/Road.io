import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { fetchVehicleUtilization, fetchCapacityUtilization } from '@/lib/fetchers/analytics';

interface Props {
  orgId: number;
}

export default async function FleetUtilization({ orgId }: Props) {
  const vehicleUtil = await fetchVehicleUtilization(orgId);
  const capacityUtil = await fetchCapacityUtilization(orgId);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Utilization</CardTitle>
          <CardDescription>Active vehicles vs total fleet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Vehicles</span>
            <span>{vehicleUtil.totalVehicles}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Active Vehicles</span>
            <span>{vehicleUtil.activeVehicles}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Utilization Rate</span>
            <span>{(vehicleUtil.utilizationRate * 100).toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Capacity Utilization</CardTitle>
          <CardDescription>Load weight vs fleet capacity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Capacity (lb)</span>
            <span>{capacityUtil.totalCapacity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Used Capacity (lb)</span>
            <span>{capacityUtil.usedCapacity}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Utilization Rate</span>
            <span>{(capacityUtil.utilizationRate * 100).toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
