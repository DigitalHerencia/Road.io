export interface HosLog {
  id: number;
  orgId: number;
  driverId: number;
  status: "OFF_DUTY" | "SLEEPER" | "DRIVING" | "ON_DUTY";
  startTime: Date;
  endTime: Date | null;
  location: { lat: number; lng: number; address?: string } | null;
  notes: string | null;
  source: "MANUAL" | "ELD";
  createdAt: Date;
  updatedAt: Date;
}

export interface HosViolation {
  id: number;
  orgId: number;
  driverId: number;
  logId: number | null;
  type: "MAX_DRIVE" | "SHIFT_LIMIT" | "CYCLE_LIMIT";
  message: string;
  occurredAt: Date;
  createdAt: Date;
}
