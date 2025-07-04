import { getNotificationSettings } from '@/lib/fetchers/settings'
import { updateNotificationSettingsAction } from '@/lib/actions/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default async function NotificationSettingsForm() {
  const settings = await getNotificationSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage notification preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateNotificationSettingsAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailEnabled">Enable Email</Label>
            <select id="emailEnabled" name="emailEnabled" className="border rounded-md h-9 px-3 w-full" defaultValue={settings?.emailEnabled ? 'true' : 'false'}>
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smsEnabled">Enable SMS</Label>
            <select id="smsEnabled" name="smsEnabled" className="border rounded-md h-9 px-3 w-full" defaultValue={settings?.smsEnabled ? 'true' : 'false'}>
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pushEnabled">Enable Push</Label>
            <select id="pushEnabled" name="pushEnabled" className="border rounded-md h-9 px-3 w-full" defaultValue={settings?.pushEnabled ? 'true' : 'false'}>
              <option value="false">Off</option>
              <option value="true">On</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="escalationEmail">Escalation Email</Label>
            <Input id="escalationEmail" name="escalationEmail" defaultValue={settings?.escalationEmail ?? ''} />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  )
}
