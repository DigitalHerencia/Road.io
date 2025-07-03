import { getLatestTelematics } from "@/lib/fetchers/vehicles";

interface Props {
  vehicleId: number;
}

export default async function TelematicsStatus({ vehicleId }: Props) {
  const record = await getLatestTelematics(vehicleId);
  if (!record) {
    return <p className="text-sm text-muted-foreground">No telematics data</p>;
  }
  return (
    <div className="space-y-1">
      <div>
        Location:{" "}
        {record.location
          ? `${record.location.lat}, ${record.location.lng}`
          : "N/A"}
      </div>
      <div>Odometer: {record.odometer ?? "N/A"} mi</div>
      <div>Engine Hours: {record.engineHours ?? "N/A"}</div>
    </div>
  );
}
