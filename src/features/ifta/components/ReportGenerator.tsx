import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateIftaReportAction } from "@/lib/actions/ifta";
import { Label } from "@/components/ui/label";

export default function ReportGenerator() {
  return (
    <form
      action={async (formData) => {
        await generateIftaReportAction(formData);
        // Optionally handle result here (e.g., show a message or redirect)
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="year">Year</Label>
        <Input id="year" name="year" type="number" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quarter">Quarter</Label>
        <select id="quarter" name="quarter" className="border rounded h-9 px-3">
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
      </div>
      <Button type="submit">Generate Report</Button>
    </form>
  );
}
