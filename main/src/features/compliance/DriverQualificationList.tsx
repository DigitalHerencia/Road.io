import { listAnnualReviews } from '@/lib/fetchers/compliance';

interface Props {
  orgId: number;
  driverId?: number;
}

export default async function DriverQualificationList({ orgId, driverId }: Props) {
  const reviews = await listAnnualReviews(orgId, driverId);
  if (reviews.length === 0) {
    return <p>No reviews found.</p>;
  }
  return (
    <ul className="space-y-1 text-sm">
      {reviews.map(r => (
        <li key={r.id}>{new Date(r.reviewDate).toLocaleDateString()} - {r.isQualified ? 'Qualified' : 'Not Qualified'}</li>
      ))}
    </ul>
  );
}
