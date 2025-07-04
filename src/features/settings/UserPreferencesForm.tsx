import { getUserPreferences } from '@/lib/fetchers/settings';
import { updateUserPreferencesAction } from '@/lib/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default async function UserPreferencesForm() {
  const prefs = await getUserPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
        <CardDescription>Manage your personal settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateUserPreferencesAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" name="displayName" defaultValue={prefs?.displayName ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" name="language" defaultValue={prefs?.language ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeZone">Time Zone</Label>
            <Input id="timeZone" name="timeZone" defaultValue={prefs?.timeZone ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select id="theme" name="theme" className="border rounded-md h-9 px-3 w-full" defaultValue={prefs?.theme ?? 'light'}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
