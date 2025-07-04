import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createFuelPurchaseAction } from "@/lib/actions/ifta";

export default function FuelPurchaseForm() {
  return (
    <form
      action={createFuelPurchaseAction}
      className="space-y-4"
      encType="multipart/form-data"
    >
      <div className="space-y-2">
        <Label htmlFor="driverId">Driver ID</Label>
        <Input id="driverId" name="driverId" type="number" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vehicleId">Vehicle ID</Label>
        <Input id="vehicleId" name="vehicleId" type="number" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="purchaseDate">Date</Label>
        <Input id="purchaseDate" name="purchaseDate" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity (gal)</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          step="any"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pricePerUnit">Price/gal (cents)</Label>
        <Input id="pricePerUnit" name="pricePerUnit" type="number" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="vendor">Vendor</Label>
        <Input id="vendor" name="vendor" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="state">State</Label>
        <Input id="state" name="state" maxLength={2} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="taxStatus">Tax Status</Label>
        <select
          id="taxStatus"
          name="taxStatus"
          className="border rounded h-9 px-3"
        >
          <option value="PAID">Tax Paid</option>
          <option value="FREE">Tax Free</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          className="border rounded h-9 px-3"
        >
          <option value="CARD">Card</option>
          <option value="CASH">Cash</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt</Label>
        <Input id="receipt" name="receipt" type="file" />
      </div>
      <Button type="submit">Log Purchase</Button>
    </form>
  );
}
