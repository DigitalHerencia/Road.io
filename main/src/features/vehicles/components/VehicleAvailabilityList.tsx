import { getVehicleAvailability } from '@/lib/fetchers/vehicles'

interface Props {
  orgId: number
}

export default async function VehicleAvailabilityList({ orgId }: Props) {
  const vehicles = await getVehicleAvailability(orgId)
  return (
    <table className="w-full text-sm">
      <thead className="text-left">
        <tr>
          <th>ID</th>
          <th>Make</th>
          <th>Model</th>
          <th>Status</th>
          <th>Assigned</th>
          <th>Next Maintenance</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map(v => (
          <tr key={v.id} className="border-t">
            <td>{v.id}</td>
            <td>{v.make}</td>
            <td>{v.model}</td>
            <td>{v.status}</td>
            <td>{v.isAssigned ? 'Yes' : 'No'}</td>
            <td>{v.nextMaintenanceDate ? new Date(v.nextMaintenanceDate).toLocaleDateString() : 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
