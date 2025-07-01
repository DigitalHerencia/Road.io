import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  fetchOnTimeDeliveryRate,
  fetchCostPerMile,
} from '@/lib/fetchers/analytics';

interface Props {
  orgId: number;
}

export default async function OperationalKPIs({ orgId }: Props) {
  const [onTime, cost] = await Promise.all([
    fetchOnTimeDeliveryRate(orgId),
    fetchCostPerMile(orgId),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>On-time Delivery</CardTitle>
          <CardDescription>Percentage of loads delivered by scheduled time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Delivered</span>
            <span>{onTime.totalDelivered}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>On-Time Deliveries</span>
            <span>{onTime.onTimeDeliveries}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>On-Time Rate</span>
            <span>{(onTime.onTimeRate * 100).toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cost per Mile</CardTitle>
          <CardDescription>Average cost incurred per mile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Miles</span>
            <span>{cost.totalMiles}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Cost ($)</span>
            <span>{(cost.totalCost / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Cost/Mile ($)</span>
            <span>{cost.costPerMile.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
