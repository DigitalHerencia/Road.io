import { getVehicleList } from '@/lib/fetchers/vehicles'
import { bulkUpdateVehicleStatus } from '@/lib/actions/vehicles'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Props {
  orgId: number;
}

// Define the Vehicle type based on table usage
type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  status: string;
};

export default async function VehicleList({ }: Props) {
  // Await the async fetch and provide a fallback type
  const vehicles: Vehicle[] = (await getVehicleList()) ?? []

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
