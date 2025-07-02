import { requirePermission } from '@/lib/rbac'
import NotificationSettingsForm from '@/features/settings/NotificationSettingsForm'

export default async function NotificationSettingsPage() {
  await requirePermission('org:admin:configure_company_settings')
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <NotificationSettingsForm />
    </div>
  )
}
