import { getDriverPerformanceReviews } from '@/lib/fetchers/drivers'

export default async function PerformanceReviewList({ driverId }: { driverId: number }) {
  const reviews = await getDriverPerformanceReviews(driverId)
  if (reviews.length === 0) return <p>No reviews.</p>
  return (
    <ul className="space-y-1 text-sm">
      {reviews.map(r => (
        <li key={r.id}>
          {r.reviewDate.toISOString().slice(0,10)} - Score {r.score}
          {r.notes ? ` (${r.notes})` : ''}
        </li>
      ))}
    </ul>
  )
}
