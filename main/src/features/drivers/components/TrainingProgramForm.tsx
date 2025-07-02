import { createTrainingProgramAction } from '@/lib/actions/training'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function TrainingProgramForm() {
  return (
    <form action={createTrainingProgramAction} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea id="description" name="description" className="border rounded w-full p-2" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input id="startDate" name="startDate" type="date" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input id="endDate" name="endDate" type="date" />
      </div>
      <Button type="submit">Create Program</Button>
    </form>
  )
}
