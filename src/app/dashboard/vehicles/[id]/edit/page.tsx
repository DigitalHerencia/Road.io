import { getVehicleById } from '@/lib/fetchers/vehicles'
import VehicleForm from '@/features/vehicles/VehicleForm'
import { notFound } from 'next/navigation'

interface Props { params: { id: string } }

export default async function EditVehiclePage({ params }: Props) {
  const vehicle = await getVehicleById(Number(params.id))
  if (!vehicle) notFound()

  return (
    <div className="p-8">
      <VehicleForm vehicle={vehicle} />
    </div>
  )
}
