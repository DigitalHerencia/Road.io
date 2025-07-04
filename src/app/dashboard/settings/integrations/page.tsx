import { requirePermission } from '@/lib/rbac'
import IntegrationConfigForm from '@/features/settings/IntegrationConfigForm'

export default async function IntegrationSettingsPage() {
  await requirePermission('org:admin:configure_company_settings')
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <IntegrationConfigForm />
    </div>
  )
}
