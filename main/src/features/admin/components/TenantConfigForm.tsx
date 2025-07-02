import { getTenantConfig } from "@/lib/fetchers/admin";
import { updateTenantConfigAction } from "@/lib/actions/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  orgId: number;
}

export default async function TenantConfigForm({ orgId }: Props) {
  const config = await getTenantConfig(orgId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateTenantConfigAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataRetentionDays">Data Retention Days</Label>
            <Input
              id="dataRetentionDays"
              name="dataRetentionDays"
              type="number"
              defaultValue={config?.dataRetentionDays ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resourceLimit">Resource Limit</Label>
            <Input
              id="resourceLimit"
              name="resourceLimit"
              type="number"
              defaultValue={config?.resourceLimit ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" name="notes" defaultValue={config?.notes ?? ""} />
          </div>
          <Button type="submit">Save Config</Button>
        </form>
      </CardContent>
    </Card>
  );
}
