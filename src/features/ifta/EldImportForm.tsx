import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { importEldCsvAction } from "@/lib/actions/ifta";

export default function EldImportForm() {
  return (
    <form action={importEldCsvAction} className="space-y-4" encType="multipart/form-data">
      <div className="space-y-2">
        <Label htmlFor="csv">ELD Data CSV</Label>
        <Input id="csv" name="csv" type="file" accept=".csv" required />
      </div>
      <Button type="submit">Import ELD Data</Button>
    </form>
  );
}
