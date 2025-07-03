import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { recordTripAction } from "@/lib/actions/ifta";
import { Label } from "@/components/ui/label";

interface Props {
  driverId: number;
}

export default function TripLogger({ driverId }: Props) {
  return (
    <form action={recordTripAction} className="space-y-4">
      <input type="hidden" name="driverId" value={driverId} />
      <div className="space-y-2">
        <Label htmlFor="loadId">Load ID</Label>
        <Input id="loadId" name="loadId" type="number" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startLat">Start Latitude</Label>
        <Input id="startLat" name="startLat" type="number" step="any" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startLng">Start Longitude</Label>
        <Input id="startLng" name="startLng" type="number" step="any" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startState">Start State</Label>
        <Input id="startState" name="startState" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endLat">End Latitude</Label>
        <Input id="endLat" name="endLat" type="number" step="any" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endLng">End Longitude</Label>
        <Input id="endLng" name="endLng" type="number" step="any" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endState">End State</Label>
        <Input id="endState" name="endState" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="startedAt">Start Time</Label>
        <Input id="startedAt" name="startedAt" type="datetime-local" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endedAt">End Time</Label>
        <Input id="endedAt" name="endedAt" type="datetime-local" required />
      </div>
      <Button type="submit">Record Trip</Button>
    </form>
  );
}
