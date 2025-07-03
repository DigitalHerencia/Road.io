export interface DriverProfile {
  id: number;
  userId: number;
  name: string | null;
  email: string;
  licenseNumber: string | null;
  licenseExpiry: Date | null;
  dotNumber: string | null;
  status: 'AVAILABLE' | 'ON_DUTY' | 'OFF_DUTY';
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverMessage {
  id: number;
  driverId: number;
  sender: 'DRIVER' | 'DISPATCH';
  message: string;
  createdAt: Date;
}
