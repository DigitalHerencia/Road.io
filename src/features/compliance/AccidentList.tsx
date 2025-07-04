import { listAccidentReports } from '@/lib/fetchers/compliance';

interface Props {
  orgId: number;
}

export default async function AccidentList({ orgId }: Props) {
  const accidents = await listAccidentReports(orgId);
  if (accidents.length === 0) {
    return <p>No accidents reported.</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {accidents.map(a => (
        <li key={String(a.id)}>
          {new Date(a.occurredAt as string).toLocaleDateString()} - {String(a.description)}
        </li>
      ))}
    </ul>
  );
}
