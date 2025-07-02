import { getRoleById } from '@/lib/fetchers/roles'
import { requirePermission } from '@/lib/rbac'
import RoleForm from '@/features/admin/components/RoleForm'
import { ROLE_PERMISSIONS } from '@/types/rbac'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

export default async function EditRolePage({ params }: Props) {
  await requirePermission('org:admin:manage_users_and_roles')
  const role = await getRoleById(Number(params.id))
  if (!role) notFound()
  const permissions = Array.from(new Set(Object.values(ROLE_PERMISSIONS).flat()))
  return (
    <div className="p-8">
      <RoleForm role={role} permissions={permissions} />
    </div>
  )
}
