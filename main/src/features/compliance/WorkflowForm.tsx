import { createComplianceWorkflowAction } from '@/lib/actions/compliance'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function WorkflowForm() {
  return (
    <form action={createComplianceWorkflowAction} className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="name">Workflow Name</Label>
        <Input id="name" name="name" required />
      </div>
      <Button type="submit">Create Workflow</Button>
    </form>
  )
}
