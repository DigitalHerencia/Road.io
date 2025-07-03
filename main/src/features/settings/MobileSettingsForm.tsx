import { getMobileSettings } from '@/lib/fetchers/settings';
import { updateMobileSettingsAction } from '@/lib/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default async function MobileSettingsForm() {
  const mobile = await getMobileSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Settings</CardTitle>
        <CardDescription>Offline and push notification options</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateMobileSettingsAction} className="space-y-4">
          <div className="flex items-center space-x-2">
            <input id="offlineMode" name="offlineMode" type="checkbox" defaultChecked={mobile?.offlineMode} className="border rounded" />
            <Label htmlFor="offlineMode">Offline Mode</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="pushNotifications" name="pushNotifications" type="checkbox" defaultChecked={mobile?.pushNotifications} className="border rounded" />
            <Label htmlFor="pushNotifications">Push Notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="gpsTracking" name="gpsTracking" type="checkbox" defaultChecked={mobile?.gpsTracking} className="border rounded" />
            <Label htmlFor="gpsTracking">GPS Tracking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="batterySaver" name="batterySaver" type="checkbox" defaultChecked={mobile?.batterySaver} className="border rounded" />
            <Label htmlFor="batterySaver">Battery Saver</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="dataSaver" name="dataSaver" type="checkbox" defaultChecked={mobile?.dataSaver} className="border rounded" />
            <Label htmlFor="dataSaver">Data Saver</Label>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
