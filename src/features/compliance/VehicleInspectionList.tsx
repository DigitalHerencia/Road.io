import { listVehicleInspections } from '@/lib/fetchers/compliance';

interface Props {
  orgId: number;
  vehicleId?: number;
}

export default async function VehicleInspectionList({ orgId, vehicleId }: Props) {
  const inspections = await listVehicleInspections(orgId, vehicleId);
  if (inspections.length === 0) {
    return <p>No inspections found.</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {inspections.map(i => (
        <li key={String(i.id)}>{new Date(i.inspectionDate as string).toLocaleDateString()} - {i.passed ? 'Passed' : 'Failed'}</li>
      ))}
    </ul>
  );
}
