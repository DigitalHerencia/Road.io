import { getAnalyticsSettings } from '@/lib/fetchers/settings';
import { updateAnalyticsSettingsAction } from '@/lib/actions/settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default async function AnalyticsSettingsForm() {
  const analytics = await getAnalyticsSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics & Monitoring</CardTitle>
        <CardDescription>Usage and performance tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateAnalyticsSettingsAction} className="space-y-4">
          <div className="flex items-center space-x-2">
            <input id="usageTracking" name="usageTracking" type="checkbox" defaultChecked={analytics?.usageTracking} className="border rounded" />
            <Label htmlFor="usageTracking">Usage Tracking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="optimizationInsights" name="optimizationInsights" type="checkbox" defaultChecked={analytics?.optimizationInsights} className="border rounded" />
            <Label htmlFor="optimizationInsights">Optimization Insights</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="performanceMonitoring" name="performanceMonitoring" type="checkbox" defaultChecked={analytics?.performanceMonitoring} className="border rounded" />
            <Label htmlFor="performanceMonitoring">Performance Monitoring</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input id="errorTracking" name="errorTracking" type="checkbox" defaultChecked={analytics?.errorTracking} className="border rounded" />
            <Label htmlFor="errorTracking">Error Tracking</Label>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  );
}
