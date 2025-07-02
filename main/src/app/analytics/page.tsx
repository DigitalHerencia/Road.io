import React from 'react';
import { getCurrentUser } from '@/lib/rbac';
import FleetUtilization from '@/features/analytics/components/FleetUtilization';
import OperationalKPIs from '@/features/analytics/components/OperationalKPIs';
import LiveFleetDashboard from '@/features/analytics/components/LiveFleetDashboard';
import ProfitMetrics from '@/features/analytics/components/ProfitMetrics';
import { redirect } from 'next/navigation';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/');

  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <LiveFleetDashboard orgId={user.orgId} />
        <FleetUtilization orgId={user.orgId} />
        <OperationalKPIs orgId={user.orgId} />
        <ProfitMetrics orgId={user.orgId} />
      </div>
    </div>
  );
}
