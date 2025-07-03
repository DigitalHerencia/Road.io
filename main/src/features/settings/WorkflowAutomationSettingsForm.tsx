import { getWorkflowAutomationSettings } from '@/lib/fetchers/settings';
import { updateWorkflowAutomationSettingsAction } from '@/lib/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default async function WorkflowAutomationSettingsForm() {
  const workflow = await getWorkflowAutomationSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Automation</CardTitle>
        <CardDescription>Automation designer and approvals</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateWorkflowAutomationSettingsAction} className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              id="enabled"
              name="enabled"
              type="checkbox"
              defaultChecked={workflow?.enabled}
              className="border rounded"
            />
            <Label htmlFor="enabled">Enable Automation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="approvalsRequired"
              name="approvalsRequired"
              type="checkbox"
              defaultChecked={workflow?.approvalsRequired}
              className="border rounded"
            />
            <Label htmlFor="approvalsRequired">Approvals Required</Label>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
