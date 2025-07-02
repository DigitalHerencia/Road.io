import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createLoad, updateLoad } from '@/lib/actions/loads';
import type { Load } from '@/types/loads';

interface Props {
  load?: Load;
}

export default function LoadForm({ load }: Props) {
  const rawAction = load ? updateLoad.bind(null, load.id) : createLoad;
  const action = async (formData: FormData) => {
    await rawAction(formData);
    // Do not return anything
  };
  return (
    <form action={action} className="space-y-4">
      {load && <input type="hidden" name="id" value={load.id} />}
      <div className="space-y-2">
        <Label htmlFor="loadNumber">Load #</Label>
        <Input id="loadNumber" name="loadNumber" defaultValue={load?.loadNumber ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pickupAddress">Pickup Address</Label>
        <Input id="pickupAddress" name="pickupAddress" defaultValue={load?.pickupLocation.address ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pickupTime">Pickup Time</Label>
        <Input id="pickupTime" name="pickupTime" type="datetime-local" defaultValue={load?.pickupLocation.datetime ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deliveryAddress">Delivery Address</Label>
        <Input id="deliveryAddress" name="deliveryAddress" defaultValue={load?.deliveryLocation.address ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="deliveryTime">Delivery Time</Label>
        <Input id="deliveryTime" name="deliveryTime" type="datetime-local" defaultValue={load?.deliveryLocation.datetime ?? ''} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight">Weight (lbs)</Label>
        <Input id="weight" name="weight" type="number" defaultValue={load?.weight ?? undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rate">Rate (cents)</Label>
        <Input id="rate" name="rate" type="number" defaultValue={load?.rate ?? undefined} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea id="notes" name="notes" defaultValue={load?.notes ?? ''} className="border rounded w-full p-2" />
      </div>
      <Button type="submit" className="w-full">{load ? 'Update Load' : 'Create Load'}</Button>
    </form>
  );
}
