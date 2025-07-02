import { updateDriverStatus } from '@/lib/actions/drivers'

interface Props {
  driverId: number
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY'
}

export default function DriverStatusForm({ driverId, status }: Props) {
  return (
    <form action={updateDriverStatus} className="space-x-2">
      <input type="hidden" name="id" value={driverId} />
      <select
        name="status"
        defaultValue={status}
        className="border rounded h-9 px-2"
      >
        <option value="AVAILABLE">Available</option>
        <option value="ON_DUTY">On Duty</option>
        <option value="OFF_DUTY">Off Duty</option>
      </select>
      <button
        type="submit"
        className="px-3 py-1 rounded bg-primary text-primary-foreground"
      >
        Update
      </button>
    </form>
  )
}
