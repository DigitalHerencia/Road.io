import { getSystemConfig } from '@/lib/fetchers/settings';
import { updateSystemConfigAction } from '@/lib/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default async function SystemConfigForm() {
  const config = await getSystemConfig();

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Configuration</CardTitle>
        <CardDescription>Application-wide settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateSystemConfigAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenanceEnabled">Maintenance Mode</Label>
            <select
              id="maintenanceEnabled"
              name="maintenanceEnabled"
              className="border rounded-md h-9 px-3 w-full"
              defaultValue={config?.maintenance?.enabled ? 'true' : 'false'}
            >
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="backupFrequency">Backup Frequency</Label>
            <select
              id="backupFrequency"
              name="backupFrequency"
              className="border rounded-md h-9 px-3 w-full"
              defaultValue={config?.backup?.frequency ?? 'weekly'}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}

