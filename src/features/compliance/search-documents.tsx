import { searchDocuments } from '@/lib/fetchers/compliance';

interface Props {
  orgId: number;
  query: string;
}

export default async function SearchDocuments({ orgId, query }: Props) {
  const results = await searchDocuments(orgId, query);
  if (results.length === 0) {
    return <p>No documents found.</p>;
  }
  return (
    <ul className="space-y-1">
      {results.map(doc => (
        <li key={doc.id} className="text-sm">
          {doc.fileName}
        </li>
      ))}
    </ul>
  );
}
