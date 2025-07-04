import { createComplianceTaskAction } from '@/lib/actions/compliance'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function TaskForm({ workflowId }: { workflowId: number }) {
  return (
    <form
      action={async (formData) => {
        await createComplianceTaskAction(formData)
        // Optionally handle result or reset form here
      }}
      className="space-y-4 max-w-sm"
    >
      <input type="hidden" name="workflowId" value={workflowId} />
      <div className="space-y-2">
        <Label htmlFor="title">Task</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" name="dueDate" type="date" />
      </div>
      <Button type="submit">Add Task</Button>
    </form>
  )
}
