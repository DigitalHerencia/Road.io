import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { processReceiptAction } from "@/lib/actions/ifta";
import { Label } from "@/components/ui/label";

export default function ReceiptProcessor() {
  return (
    <form
      action={async (formData) => {
        await processReceiptAction(formData);
      }}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <div className="space-y-2">
        <Label htmlFor="receipt">Upload Receipt</Label>
        <Input id="receipt" name="receipt" type="file" accept="image/*" required />
      </div>
      <Button type="submit">Process</Button>
    </form>
  );
}
