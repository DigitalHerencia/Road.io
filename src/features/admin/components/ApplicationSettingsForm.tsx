import { getApplicationSettings } from '@/lib/fetchers/admin'
import { updateApplicationSettingsAction } from '@/lib/actions/admin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props { orgId: number }

export default async function ApplicationSettingsForm({ orgId }: Props) {
  const settings = await getApplicationSettings(orgId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (formData) => {
            await updateApplicationSettingsAction(formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="featureToggles">Feature Toggles (JSON)</Label>
            <Textarea
              id="featureToggles"
              name="featureToggles"
              defaultValue={
                settings?.featureToggles
                  ? JSON.stringify(settings.featureToggles)
                  : ''
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            <select
              id="maintenanceMode"
              name="maintenanceMode"
              className="border rounded-md h-9 px-3 w-full"
              defaultValue={settings?.maintenanceMode ? 'true' : 'false'}
            >
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rateLimit">API Rate Limit</Label>
            <Input
              id="rateLimit"
              name="rateLimit"
              type="number"
              defaultValue={settings?.rateLimit ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (min)</Label>
            <Input
              id="sessionTimeout"
              name="sessionTimeout"
              type="number"
              defaultValue={settings?.sessionTimeout ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="securityPolicies">Security Policies (JSON)</Label>
            <Textarea
              id="securityPolicies"
              name="securityPolicies"
              defaultValue={
                settings?.securityPolicies
                  ? JSON.stringify(settings.securityPolicies)
                  : ''
              }
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  )
}
