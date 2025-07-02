import { getIntegrationSettings } from '@/lib/fetchers/settings'
import { updateIntegrationSettingsAction } from '@/lib/actions/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default async function IntegrationConfigForm() {
  const integrations = await getIntegrationSettings()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Settings</CardTitle>
        <CardDescription>Configure third-party services</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateIntegrationSettingsAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="eldApiKey">ELD API Key</Label>
            <Input id="eldApiKey" name="eldApiKey" defaultValue={integrations?.eldApiKey ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fuelCardProvider">Fuel Card Provider</Label>
            <Input id="fuelCardProvider" name="fuelCardProvider" defaultValue={integrations?.fuelCardProvider ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mappingApiKey">Mapping API Key</Label>
            <Input id="mappingApiKey" name="mappingApiKey" defaultValue={integrations?.mappingApiKey ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commsWebhookUrl">Communication Webhook URL</Label>
            <Input id="commsWebhookUrl" name="commsWebhookUrl" defaultValue={integrations?.commsWebhookUrl ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentProcessorKey">Payment Processor Key</Label>
            <Input id="paymentProcessorKey" name="paymentProcessorKey" defaultValue={integrations?.paymentProcessorKey ?? ''} />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  )
}
