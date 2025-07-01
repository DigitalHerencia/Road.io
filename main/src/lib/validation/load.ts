import { z } from 'zod';

export const loadFormSchema = z.object({
  loadNumber: z.string().min(1),
  pickupAddress: z.string().min(1),
  pickupTime: z.string().min(1),
  deliveryAddress: z.string().min(1),
  deliveryTime: z.string().min(1),
  weight: z.coerce.number().int().positive().optional(),
  rate: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
});

export type LoadFormInput = z.infer<typeof loadFormSchema>;
