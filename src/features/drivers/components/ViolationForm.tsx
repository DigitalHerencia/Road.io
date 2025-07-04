import { recordDriverViolation } from '@/lib/actions/drivers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ViolationForm({ driverId }: { driverId: number }) {
  return (
    <form
      action={async (formData) => {
        formData.set('driverId', String(driverId))
        await recordDriverViolation(formData)
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Input id="type" name="type" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="occurredAt">Date</Label>
        <Input id="occurredAt" name="occurredAt" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" />
      </div>
      <Button type="submit">Record Violation</Button>
    </form>
  )
}
