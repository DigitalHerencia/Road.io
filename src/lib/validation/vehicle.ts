import { z } from "zod";

export const vehicleSchema = z.object({
  vin: z.string().min(1).max(17),
  licensePlate: z.string().min(1).max(20),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().gte(1886),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
