import { notFound } from 'next/navigation';
import { getLoadById } from '@/lib/fetchers/loads';
import LoadForm from '@/features/dispatch/components/LoadForm';

interface Params { params: { id: string } }

export default async function EditLoadPage({ params }: Params) {
  const id = Number(params.id);
  const load = await getLoadById(id);
  if (!load) return notFound();

  return (
    <div className="p-8">
      <LoadForm load={load} />
    </div>
  );
}
