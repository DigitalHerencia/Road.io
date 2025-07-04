import { listVehicleDocuments } from "@/lib/fetchers/vehicles";

interface Props {
  vehicleId: number;
}

export default async function VehicleDocumentsList({ vehicleId }: Props) {
  const docs = await listVehicleDocuments(vehicleId);
  if (docs.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {docs.map((doc) => (
        <li key={doc.id}>
          <a href={doc.fileUrl} className="underline">
            {doc.fileName}
          </a>
        </li>
      ))}
    </ul>
  );
}
