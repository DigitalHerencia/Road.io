import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDriverById } from '@/lib/fetchers/drivers'
import DriverForm from '@/features/drivers/components/DriverForm'
import { Button } from '@/components/ui/button'

interface Params { params: { id: string } }

export default async function EditDriverPage({ params }: Params) {
  const id = Number(params.id)
  const driver = await getDriverById(id)
  if (!driver) return notFound()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Driver</h1>
        <Link href={`/drivers/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
      <DriverForm driver={driver} />
    </div>
  )
}
