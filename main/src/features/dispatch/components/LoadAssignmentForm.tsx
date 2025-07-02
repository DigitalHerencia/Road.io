import { getAllDrivers } from '@/lib/fetchers/drivers'
import { getCurrentUser } from '@/lib/rbac'
import { getAllVehicles } from '@/lib/fetchers/vehicles'
import { assignLoad } from '@/lib/actions/assignments'

interface Props {
  loadId: number
  driverId: number | null
  vehicleId: number | null
}

export default async function LoadAssignmentForm({ loadId, driverId, vehicleId }: Props) {
  const user = await getCurrentUser()
  if (!user) return null
  const drivers = await getAllDrivers()
  const vehicles = await getAllVehicles(user.orgId)

  return (
    <form
      action={assignLoad.bind(null, loadId) as (formData: FormData) => Promise<void>}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="driverId" className="block text-sm font-medium">Driver</label>
        <select id="driverId" name="driverId" defaultValue={driverId ?? ''} className="border rounded h-9 px-3 w-full">
          <option value="">Unassigned</option>
          {drivers.map(d => (
            <option key={d.id} value={d.id}>{d.name || d.email}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="vehicleId" className="block text-sm font-medium">Vehicle</label>
        <select id="vehicleId" name="vehicleId" defaultValue={vehicleId ?? ''} className="border rounded h-9 px-3 w-full">
          <option value="">Unassigned</option>
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>{v.make} {v.model}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="bg-primary text-primary-foreground rounded px-4 py-2">Save Assignment</button>
    </form>
  )
}
