import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getVehicleList } from '@/lib/fetchers/vehicles'
import { bulkUpdateVehicleStatus } from '@/lib/actions/vehicles'

interface Props {
  orgId: number
  status?: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED'
  sort?: 'make' | 'model' | 'year' | 'status' | 'vin'
}

export default async function VehicleList({ orgId, status, sort }: Props) {
  const vehicles = await getVehicleList(orgId, sort ?? 'id', status)

  async function retireSelected(formData: FormData) {
    'use server'
    const ids = formData.getAll('vehicleId').map(id => Number(id))
    await bulkUpdateVehicleStatus(ids, 'RETIRED')
  }

  return (
    <form action={retireSelected} className="space-y-4">
      <table className="w-full text-sm">
        <thead className="text-left">
          <tr>
            <th></th>
            <th>Make</th>
            <th>Model</th>
            <th>Year</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id} className="border-t">
              <td>
                <input type="checkbox" name="vehicleId" value={v.id} />
              </td>
              <td>{v.make}</td>
              <td>{v.model}</td>
              <td>{v.year}</td>
              <td>{v.status}</td>
              <td>
                <Link href={`/dashboard/vehicles/${v.id}/edit`} className="text-blue-600">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button type="submit" variant="destructive">Retire Selected</Button>
    </form>
  )
}
