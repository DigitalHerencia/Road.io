import { getUserById } from '@/lib/fetchers/users'
import UserForm from '@/features/admin/components/UserForm'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

export default async function EditUserPage({ params }: Props) {
  const user = await getUserById(Number(params.id))
  if (!user) notFound()
  return (
    <div className="p-8">
      <UserForm user={user} />
    </div>
  )
}

