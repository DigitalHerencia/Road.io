import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { importFuelCardCsvAction } from "@/lib/actions/ifta";

export default function FuelCardImportForm() {
  return (
    <form
      action={importFuelCardCsvAction}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <div className="space-y-2">
        <Label htmlFor="csv">Fuel Card CSV</Label>
        <Input id="csv" name="csv" type="file" accept=".csv" required />
      </div>
      <Button type="submit">Import Transactions</Button>
    </form>
  );
}
