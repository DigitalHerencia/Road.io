import { getSecuritySettings } from '@/lib/fetchers/settings';
import { updateSecuritySettingsAction } from '@/lib/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default async function SecuritySettingsForm() {
  const security = await getSecuritySettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Regulatory and document controls</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateSecuritySettingsAction} className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              id="regulatoryMode"
              name="regulatoryMode"
              type="checkbox"
              defaultChecked={security?.regulatoryMode}
              className="border rounded"
            />
            <Label htmlFor="regulatoryMode">Regulatory Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="documentManagement"
              name="documentManagement"
              type="checkbox"
              defaultChecked={security?.documentManagement}
              className="border rounded"
            />
            <Label htmlFor="documentManagement">Document Management</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="auditTrails"
              name="auditTrails"
              type="checkbox"
              defaultChecked={security?.auditTrails}
              className="border rounded"
            />
            <Label htmlFor="auditTrails">Audit Trails</Label>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
