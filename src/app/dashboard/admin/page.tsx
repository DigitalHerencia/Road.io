import { requireRole } from '@/lib/rbac'
import { SystemRoles } from '@/types/rbac'
import OverviewCards from '@/features/admin/components/OverviewCards'
import SystemMetricsPanel from '@/features/admin/components/SystemMetricsPanel'
import RecentActivity from '@/features/admin/components/RecentActivity'

export default async function AdminDashboardPage() {
  await requireRole(SystemRoles.ADMIN)
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <OverviewCards />
      <div className="grid gap-6 md:grid-cols-2">
        <SystemMetricsPanel />
        <RecentActivity />
      </div>
    </div>
  )
}
