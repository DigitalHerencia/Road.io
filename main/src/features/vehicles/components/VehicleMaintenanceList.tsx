import { listVehicleMaintenance } from '@/lib/fetchers/vehicles'

interface Props {
  orgId: number
  vehicleId?: number
}

export default async function VehicleMaintenanceList({ orgId, vehicleId }: Props) {
  const records = await listVehicleMaintenance(orgId, vehicleId)
  if (records.length === 0) {
    return <p>No maintenance records found.</p>
  }
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Vehicle Maintenance Records</caption>
      <thead className="text-left">
        <tr>
          <th>Date</th>
          <th>Mileage</th>
          <th>Vendor</th>
          <th>Description</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        {records.map(r => (
          <tr key={r.id} className="border-t">
            <td>{r.maintenanceDate.toLocaleDateString()}</td>
            <td>{r.mileage ?? '—'}</td>
            <td>{r.vendor ?? '—'}</td>
            <td>{r.description ?? '—'}</td>
            <td>{r.cost != null ? `$${(r.cost / 100).toFixed(2)}` : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
