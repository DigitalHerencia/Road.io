import { getIntegrationConfigs } from '@/lib/fetchers/admin'
import { updateIntegrationConfigAction, generateIntegrationApiKey } from '@/lib/actions/admin'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props { orgId: number; service: string }

export default async function IntegrationManagementForm({ orgId, service }: Props) {
  const configs = await getIntegrationConfigs(orgId)
  const cfg = configs.find(c => c.service === service)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service} Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (data) => {
            await updateIntegrationConfigAction(data)
          }}
          className="space-y-4"
        >
          <input type="hidden" name="service" value={service} />
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input id="apiKey" name="apiKey" defaultValue={cfg?.apiKey ?? ''} />
            <Button
              formAction={async () => {
                'use server'
                await generateIntegrationApiKey(service)
              }}
              type="button"
              className="mt-2"
            >
              Generate New Key
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input id="webhookUrl" name="webhookUrl" defaultValue={cfg?.webhookUrl ?? ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enabled">Enabled</Label>
            <select
              id="enabled"
              name="enabled"
              className="border rounded-md h-9 px-3 w-full"
              defaultValue={cfg?.enabled ? 'true' : 'false'}
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </select>
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  )
}
