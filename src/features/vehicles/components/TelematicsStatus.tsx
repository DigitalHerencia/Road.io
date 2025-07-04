import { getLatestTelematics } from "@/lib/fetchers/vehicles";

interface Props {
  vehicleId: number;
}

interface TelematicsRecord {
  location: { lat: number; lng: number } | string | null;
  odometer?: number;
  engineHours?: number;
  // ...other fields
}

export default async function TelematicsStatus({ vehicleId }: Props) {
  const record = (await getLatestTelematics(vehicleId)) as TelematicsRecord;
  if (!record) {
    return <p className="text-sm text-muted-foreground">No telematics data</p>;
  }
  return (
    <div className="space-y-1">
      <div>
        Location:{" "}
        {record.location
          ? typeof record.location === "object" &&
            record.location !== null &&
            "lat" in record.location &&
            "lng" in record.location
            ? `${record.location.lat}, ${record.location.lng}`
            : String(record.location)
          : "N/A"}
      </div>
      <div>Odometer: {record.odometer ?? "N/A"} mi</div>
      <div>Engine Hours: {record.engineHours ?? "N/A"}</div>
    </div>
  );
}
