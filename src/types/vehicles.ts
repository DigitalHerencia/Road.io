export interface Vehicle {
  id: number;
  orgId: number;
  vin: string;
  licensePlate: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  type: 'TRACTOR' | 'TRAILER' | 'VAN' | 'CAR' | 'OTHER' | null;
  capacity: number | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  ownerInfo: string | null;
  photoUrl: string | null;
  nextMaintenanceDate: Date | null;
  nextInspectionDate: Date | null;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
  isActive: boolean;
  currentDriverId: number | null;
  createdAt: Date;
  updatedAt: Date;
}
