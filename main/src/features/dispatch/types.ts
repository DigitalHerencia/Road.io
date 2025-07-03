export interface Load {
  id: number;
  orgId: number;
  loadNumber: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  assignedDriverId: number | null;
  assignedVehicleId: number | null;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
    datetime: string;
  };
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
    datetime: string;
  };
  weight: number | null;
  distance: number | null;
  rate: number | null;
  notes: string | null;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}
