import Link from 'next/link';
import type { Load } from '@/features/dispatch/types';

export default function LoadSummary({ load }: { load: Load }) {
  return (
    <div className="border rounded p-4 space-y-1">
      <div className="font-medium">#{load.loadNumber}</div>
      <div className="text-sm text-muted-foreground">Status: {load.status}</div>
      <Link href={`/dashboard/loads/${load.id}`} className="text-blue-600 text-sm">Details</Link>
    </div>
  );
}
