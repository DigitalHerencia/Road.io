import { getUserById } from '@/lib/fetchers/users'
import { getOrgRoles } from '@/lib/fetchers/roles'
import UserForm from '@/features/admin/components/UserForm'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

export default async function EditUserPage({ params }: Props) {
  const user = await getUserById(Number(params.id))
  if (!user) notFound()
  const roles = await getOrgRoles(user.orgId)
  return (
    <div className="p-8">
      <UserForm user={user} roles={roles} />
    </div>
  )
}
