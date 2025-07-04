import { requirePermission } from '@/lib/rbac'
import FuelRouteAnalytics from '@/features/ifta/FuelRouteAnalytics'
import TaxOptimizationTools from '@/features/ifta/TaxOptimizationTools'

export default async function IftaAnalyticsPage() {
  const user = await requirePermission('org:ifta:generate_report')
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <FuelRouteAnalytics orgId={user.orgId} />
        <TaxOptimizationTools orgId={user.orgId} />
      </div>
    </div>
  )
}
