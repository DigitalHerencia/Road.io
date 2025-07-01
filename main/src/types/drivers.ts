export interface DriverProfile {
  id: number;
  userId: number;
  name: string | null;
  email: string;
  licenseNumber: string | null;
  licenseExpiry: Date | null;
  dotNumber: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
