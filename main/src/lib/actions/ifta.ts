"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { trips, fuelPurchases } from "@/lib/schema";
import { promises as fs } from "fs";
import path from "path";
import { requirePermission } from "@/lib/rbac";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const TripFormSchema = z.object({
  driverId: z.coerce.number().optional(),
  loadId: z.coerce.number().optional(),
  startLat: z.coerce.number(),
  startLng: z.coerce.number(),
  startState: z.string().min(2),
  endLat: z.coerce.number(),
  endLng: z.coerce.number(),
  endState: z.string().min(2),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
});

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8; // miles
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function recordTripAction(formData: FormData) {
  const parseResult = TripFormSchema.safeParse({
    driverId: formData.get("driverId"),
    loadId: formData.get("loadId"),
    startLat: formData.get("startLat"),
    startLng: formData.get("startLng"),
    startState: formData.get("startState"),
    endLat: formData.get("endLat"),
    endLng: formData.get("endLng"),
    endState: formData.get("endState"),
    startedAt: formData.get("startedAt"),
    endedAt: formData.get("endedAt"),
  });

  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid input",
      issues: parseResult.error.flatten(),
    };
  }

  const currentUser = await requirePermission("org:driver:record_trip");
  const data = parseResult.data;

  const distance = haversine(
    data.startLat,
    data.startLng,
    data.endLat,
    data.endLng,
  );
  const isInterstate = data.startState !== data.endState;

  const [trip] = await db
    .insert(trips)
    .values({
      orgId: currentUser.orgId,
      driverId: data.driverId || parseInt(currentUser.id),
      loadId: data.loadId,
      startLocation: {
        lat: data.startLat,
        lng: data.startLng,
        state: data.startState,
      },
      endLocation: { lat: data.endLat, lng: data.endLng, state: data.endState },
      distance,
      jurisdictions: [{ state: data.startState, miles: distance }],
      isInterstate,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      createdById: parseInt(currentUser.id),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.TRIP_CREATE,
    resource: AUDIT_RESOURCES.TRIP,
    resourceId: trip.id.toString(),
    details: { distance, isInterstate },
  });

  revalidatePath("/dashboard/ifta/trips");
  return { success: true };
}

const FuelPurchaseSchema = z.object({
  driverId: z.coerce.number(),
  vehicleId: z.coerce.number(),
  purchaseDate: z.coerce.date(),
  quantity: z.coerce.number().nonnegative(),
  pricePerUnit: z.coerce.number().nonnegative(),
  vendor: z.string().min(1),
  state: z.string().min(2),
  taxStatus: z.enum(["PAID", "FREE"]),
  paymentMethod: z.enum(["CARD", "CASH", "OTHER"]),
});

function uniqueName(original: string) {
  const ext = path.extname(original);
  const base = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}${ext}`;
}

export async function createFuelPurchaseAction(formData: FormData) {
  const currentUser = await requirePermission("org:driver:log_fuel_purchase");

  const parse = FuelPurchaseSchema.parse({
    driverId: formData.get("driverId"),
    vehicleId: formData.get("vehicleId"),
    purchaseDate: formData.get("purchaseDate"),
    quantity: formData.get("quantity"),
    pricePerUnit: formData.get("pricePerUnit"),
    vendor: formData.get("vendor"),
    state: formData.get("state"),
    taxStatus: formData.get("taxStatus"),
    paymentMethod: formData.get("paymentMethod"),
  });

  let receiptUrl: string | undefined;
  const receipt = formData.get("receipt");
  if (receipt instanceof File && receipt.size > 0) {
    const arrayBuffer = await receipt.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const unique = uniqueName(receipt.name);
    const dir = path.join(process.cwd(), "main/public/uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, unique), buffer);
    receiptUrl = `/uploads/${unique}`;
  }

  const total = Math.round(parse.quantity * parse.pricePerUnit);
  const [purchase] = await db
    .insert(fuelPurchases)
    .values({
      orgId: currentUser.orgId,
      driverId: parse.driverId,
      vehicleId: parse.vehicleId,
      purchaseDate: parse.purchaseDate,
      quantity: parse.quantity,
      pricePerUnit: parse.pricePerUnit,
      totalCost: total,
      vendor: parse.vendor,
      state: parse.state,
      taxStatus: parse.taxStatus,
      paymentMethod: parse.paymentMethod,
      receiptUrl,
      createdById: parseInt(currentUser.id),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.FUEL_PURCHASE_CREATE,
    resource: AUDIT_RESOURCES.FUEL_PURCHASE,
    resourceId: purchase.id.toString(),
  });

  revalidatePath("/dashboard/ifta/fuel");
  return { success: true };
}

export async function importFuelCardCsvAction(formData: FormData) {
  const currentUser = await requirePermission("org:driver:log_fuel_purchase");
  const file = formData.get("csv");
  if (!(file instanceof File)) {
    return { success: false, error: "No file" };
  }
  const text = await file.text();
  const rows = text.trim().split(/\r?\n/);
  rows.shift();
  let count = 0;
  for (const line of rows) {
    const [
      purchaseDate,
      driverId,
      vehicleId,
      quantity,
      pricePerUnit,
      vendor,
      state,
      taxStatus,
      paymentMethod,
    ] = line.split(",");
    const parsed = FuelPurchaseSchema.safeParse({
      purchaseDate,
      driverId,
      vehicleId,
      quantity,
      pricePerUnit,
      vendor,
      state,
      taxStatus,
      paymentMethod,
    });
    if (!parsed.success) continue;
    const data = parsed.data;
    await db.insert(fuelPurchases).values({
      orgId: currentUser.orgId,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      purchaseDate: data.purchaseDate,
      quantity: data.quantity,
      pricePerUnit: data.pricePerUnit,
      totalCost: Math.round(data.quantity * data.pricePerUnit),
      vendor: data.vendor,
      state: data.state,
      taxStatus: data.taxStatus,
      paymentMethod: data.paymentMethod,
      createdById: parseInt(currentUser.id),
    });
    count++;
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.FUEL_CARD_IMPORT,
    resource: AUDIT_RESOURCES.FUEL_PURCHASE,
    details: { count },
  });

  revalidatePath("/dashboard/ifta/fuel");
  return { success: true, count };
}
