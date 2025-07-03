import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getTaxRatesByQuarter } from "@/lib/fetchers/ifta";
import { createTaxRateAction } from "@/lib/actions/ifta";

export default async function JurisdictionManager() {
  const quarter = `${new Date().getFullYear()}Q1`;
  const rates = await getTaxRatesByQuarter(quarter);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Rates {quarter}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={createTaxRateAction} className="space-y-2">
          <Input name="state" placeholder="State" maxLength={2} required />
          <Input name="quarter" defaultValue={quarter} required />
          <Input name="rate" type="number" required />
          <Input name="effectiveDate" type="date" required />
          <Button type="submit">Add Rate</Button>
        </form>
        <ul className="text-sm space-y-1">
          {rates.map(r => (
            <li key={r.id}>{r.state} - {r.rate}c/gal</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
