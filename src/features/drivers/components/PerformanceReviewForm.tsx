import { createPerformanceReviewAction } from '@/lib/actions/drivers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function PerformanceReviewForm({ driverId }: { driverId: number }) {
  return (
    <form
      action={async (formData) => {
        formData.set('driverId', String(driverId))
        await createPerformanceReviewAction(formData)
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="score">Score (1-5)</Label>
        <Input id="score" name="score" type="number" min={1} max={5} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>
      <Button type="submit">Add Review</Button>
    </form>
  )
}
