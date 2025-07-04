import Link from 'next/link';
import { getCurrentUser } from '@/lib/rbac';
import { getAllLoads } from '@/lib/fetchers/loads';
import LoadSummary from '@/features/dispatch/components/LoadSummary';
import { Button } from '@/components/ui/button';

export default async function LoadsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const loads = await getAllLoads(user.orgId);
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Loads</h1>
        <Link href="/dashboard/loads/new">
          <Button>Create Load</Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {loads.map(l => (
          <LoadSummary key={l.id} load={l} />
        ))}
        {loads.length === 0 && <p>No loads found.</p>}
      </div>
    </div>
  );
}
