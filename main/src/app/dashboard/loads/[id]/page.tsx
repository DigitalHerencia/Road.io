import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLoadById } from '@/lib/fetchers/loads'
import { getLoadAssignmentHistory } from '@/lib/fetchers/assignments'
import LoadAssignmentForm from '@/features/dispatch/components/LoadAssignmentForm'
import AssignmentHistory from '@/features/dispatch/components/AssignmentHistory'
import { Button } from '@/components/ui/button'
import { updateLoadStatus } from '@/lib/actions/loads'
import { loadStatusEnum } from '@/lib/schema'

interface Params { params: { id: string } }

export default async function LoadDetailPage({ params }: Params) {
  const id = Number(params.id);
  const load = await getLoadById(id);
  if (!load) return notFound();
  const history = await getLoadAssignmentHistory(id)

  async function setStatus(formData: FormData) {
    'use server';
    const status = formData.get('status') as typeof loadStatusEnum.enumValues[number];
    return updateLoadStatus(id, status);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Load #{load.loadNumber}</h1>
        <Link href={`/dashboard/loads/${id}/edit`}>
          <Button variant="outline">Edit</Button>
        </Link>
      </div>
      <div className="space-y-2 text-sm">
        <p><strong>Status:</strong> {load.status}</p>
        <p><strong>Pickup:</strong> {load.pickupLocation.address}</p>
        <p><strong>Delivery:</strong> {load.deliveryLocation.address}</p>
      </div>
      <form action={setStatus} className="space-x-2">
        <select name="status" defaultValue={load.status} className="border rounded h-9 px-3">
          {['pending','assigned','in_transit','delivered','cancelled'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <Button type="submit">Update Status</Button>
      </form>
      <div className="border-t pt-6 space-y-4">
        <LoadAssignmentForm loadId={id} driverId={load.assignedDriverId} vehicleId={load.assignedVehicleId} />
        <AssignmentHistory history={history} />
      </div>
    </div>
  );
}
