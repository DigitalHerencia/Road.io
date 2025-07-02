export interface DriverProfile {
  id: number;
  userId: number;
  name: string | null;
  email: string;
  licenseNumber: string | null;
  licenseExpiry: Date | null;
  dotNumber: string | null;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY';
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
