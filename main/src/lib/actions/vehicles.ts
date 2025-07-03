"use server";

import { db } from '@/lib/db'
import { vehicles, vehicleMaintenance } from '@/lib/schema'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { revalidatePath, revalidateTag } from 'next/cache'
import { VEHICLE_CACHE_TAG } from '@/lib/fetchers/vehicles'
import { eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { safeParseJSON } from '@/lib/utils'


// Allowed vehicle types as per your DB schema
const ALLOWED_TYPES = ["TRACTOR", "TRAILER", "VAN", "CAR", "OTHER"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

export const vehicleInputSchema = z.object({
  vin: z.string().min(1),
  licensePlate: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().int().gte(1900),
  type: z.enum(ALLOWED_TYPES).optional(),
  capacity: z.coerce.number().int().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  ownerInfo: z.string().optional(),
  photoUrl: z.string().optional(),
  nextMaintenanceDate: z.coerce.date().optional(),
  nextInspectionDate: z.coerce.date().optional(),
  status: z.enum(["ACTIVE", "MAINTENANCE", "RETIRED"]).optional(),
});
export type VehicleInput = z.infer<typeof vehicleInputSchema>;

export async function createVehicle(data: VehicleInput) {
  const user = await requirePermission("org:admin:manage_users_and_roles");
  const values = vehicleInputSchema.parse({
    ...data,
    // Optionally map/validate type here if needed
    type:
      data.type && ALLOWED_TYPES.includes(data.type as AllowedType)
        ? data.type
        : undefined,
  });

  // Only include fields that exist in the DB schema
  const insertData = {
    orgId: user.orgId,
    vin: values.vin,
    licensePlate: values.licensePlate,
    make: values.make,
    model: values.model,
    year: values.year,
    type: values.type,
    capacity: values.capacity,
    insuranceProvider: values.insuranceProvider,
    insurancePolicyNumber: values.insurancePolicyNumber,
    ownerInfo: values.ownerInfo,
    photoUrl: values.photoUrl,
    status: values.status ?? "ACTIVE",
  };

  const [vehicle] = await db.insert(vehicles).values(insertData).returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.VEHICLE_CREATE,
    resource: AUDIT_RESOURCES.VEHICLE,
    resourceId: vehicle.id.toString(),
    details: { createdBy: user.id },
  });

  revalidatePath('/dashboard/vehicles')
  revalidateTag(VEHICLE_CACHE_TAG)
  revalidateTag(`vehicles:${user.orgId}`)
  return { success: true, vehicle }
}

export async function updateVehicle(id: number, data: Partial<VehicleInput>) {
  const user = await requirePermission("org:admin:manage_users_and_roles");
  const values = vehicleInputSchema.partial().parse(data);

  const [vehicle] = await db
    .update(vehicles)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(vehicles.id, id))
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.VEHICLE_UPDATE,
    resource: AUDIT_RESOURCES.VEHICLE,
    resourceId: id.toString(),
    details: { updatedBy: user.id },
  });

  await Promise.all([
    revalidatePath('/dashboard/vehicles'),
    revalidatePath(`/dashboard/vehicles/${id}`),
    revalidateTag(VEHICLE_CACHE_TAG),
    revalidateTag(`vehicles:${user.orgId}`),
  ]);
  return { success: true, vehicle };
}

export async function bulkUpdateVehicleStatus(
  ids: number[],
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED",
) {
  const user = await requirePermission("org:admin:manage_vehicles");
  await db
    .update(vehicles)
    .set({ status, updatedAt: new Date() })
    .where(inArray(vehicles.id, ids));

  await createAuditLog({
    action: AUDIT_ACTIONS.VEHICLE_UPDATE,
    resource: AUDIT_RESOURCES.VEHICLE,
    resourceId: ids.join(","),
    details: { updatedBy: user.id, status },
  });

  revalidatePath('/dashboard/vehicles')
  revalidateTag(VEHICLE_CACHE_TAG)
  revalidateTag(`vehicles:${user.orgId}`)
  return { success: true }

}

export const maintenanceRecordSchema = z.object({
  maintenanceDate: z.coerce.date(),
  mileage: z.coerce.number().int().optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
  cost: z.coerce.number().int().optional(),
});
export type MaintenanceRecordInput = z.infer<typeof maintenanceRecordSchema>;

export async function recordVehicleMaintenance(
  vehicleId: number,
  data: MaintenanceRecordInput,
) {
  const user = await requirePermission("org:admin:manage_vehicles");
  const values = maintenanceRecordSchema.parse(data);

  const [record] = await db
    .insert(vehicleMaintenance)
    .values({
      orgId: user.orgId,
      vehicleId,
      maintenanceDate: values.maintenanceDate,
      mileage: values.mileage,
      vendor: values.vendor,
      description: values.description,
      cost: values.cost,
      createdById: parseInt(user.id),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.VEHICLE_MAINTENANCE,
    resource: AUDIT_RESOURCES.VEHICLE,
    resourceId: vehicleId.toString(),
    details: { recordId: record.id, createdBy: user.id },
  });

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  return { success: true, record };
}

export async function recordVehicleTelematics(formData: FormData) {
  const user = await requirePermission("org:admin:manage_vehicles");
  const schema = z.object({
    vehicleId: z.coerce.number(),
    recordedAt: z.coerce.date().optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    odometer: z.coerce.number().int().optional(),
    engineHours: z.coerce.number().int().optional(),
    data: z.string().optional(),
  });
  const input = schema.parse({
    vehicleId: formData.get("vehicleId"),
    recordedAt: formData.get("recordedAt"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    odometer: formData.get("odometer"),
    engineHours: formData.get("engineHours"),
    data: formData.get("data"),
  });

  const [record] = await db
    .insert(vehicleTelematics)
    .values({
      orgId: user.orgId,
      vehicleId: input.vehicleId,
      recordedAt: input.recordedAt ?? new Date(),
      location:
        input.lat && input.lng ? { lat: input.lat, lng: input.lng } : null,
      odometer: input.odometer,
      engineHours: input.engineHours,
      data: safeParseJSON(input.data),
      createdAt: new Date(),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.VEHICLE_TELEMATICS,
    resource: AUDIT_RESOURCES.VEHICLE,
    resourceId: input.vehicleId.toString(),
    details: { recordId: record.id, createdBy: user.id },
  });

  revalidatePath(`/dashboard/vehicles/${input.vehicleId}`);
  return { success: true, record };
}
