import { getCurrentUser } from '@/lib/rbac'
import MobileDispatchPanel from '@/features/dispatch/components/MobileDispatchPanel'

export const dynamic = 'force-dynamic'

export default async function MobileDispatchPage() {
  const user = await getCurrentUser()
  if (!user) return null
  return <MobileDispatchPanel orgId={user.orgId} />
}
