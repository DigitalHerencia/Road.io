import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { recordHosLog } from "@/lib/actions/hos";

export default function HosLogForm({ driverId }: { driverId: number }) {
  // Wrap the action to ensure it returns void
  const action = async (formData: FormData) => {
    await recordHosLog(formData);
    // Do not return anything
  };
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="driverId" value={driverId} />
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" name="status" className="border rounded h-9 px-3">
          <option value="OFF_DUTY">Off Duty</option>
          <option value="SLEEPER">Sleeper</option>
          <option value="DRIVING">Driving</option>
          <option value="ON_DUTY">On Duty</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="startTime">Start Time</Label>
        <Input id="startTime" name="startTime" type="datetime-local" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endTime">End Time</Label>
        <Input id="endTime" name="endTime" type="datetime-local" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          className="border rounded w-full p-2"
        />
      </div>
      <Button type="submit" className="w-full">
        Log Hours
      </Button>
    </form>
  );
}
