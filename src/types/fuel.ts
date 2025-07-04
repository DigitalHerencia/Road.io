export interface FuelPurchase {
  id: number;
  orgId: number;
  driverId: number;
  vehicleId: number;
  purchaseDate: Date;
  quantity: number | null;
  pricePerUnit: number | null;
  totalCost: number | null;
  vendor: string | null;
  state: string | null;
  taxStatus: "PAID" | "FREE";
  paymentMethod: "CARD" | "CASH" | "OTHER";
  receiptUrl: string | null;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}
