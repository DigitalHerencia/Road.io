"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  trips,
  fuelPurchases,
  iftaReports,
  iftaTaxRates,
  iftaAuditResponses,
} from "@/lib/schema";
import { promises as fsPromises, createWriteStream } from "fs";
import { gzipSync } from "zlib";
import path from "path";
import { requirePermission } from "@/lib/rbac";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import PDFDocument from "pdfkit";
import { and, between, eq } from "drizzle-orm";
import { uploadDocumentsAction } from "@/lib/actions/compliance";
import { getTripsForPeriod, getFuelPurchasesForPeriod } from "@/lib/fetchers/ifta";

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
    await fsPromises.mkdir(dir, { recursive: true });
    await fsPromises.writeFile(path.join(dir, unique), buffer);
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
  // Return nothing for form action compatibility
}

export async function importFuelCardCsvAction(formData: FormData) {
  const currentUser = await requirePermission("org:driver:log_fuel_purchase");
  const file = formData.get("csv");
  if (!(file instanceof File)) {
    throw new Error("No file provided");
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
  // Return nothing for form action compatibility
}

const ReportSchema = z.object({
  year: z.coerce.number(),
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
});

export async function generateIftaReportAction(formData: FormData) {
  const user = await requirePermission("org:ifta:generate_report");
  const parsed = ReportSchema.parse({
    year: formData.get("year"),
    quarter: formData.get("quarter"),
  });

  const quarter = `${parsed.year}${parsed.quarter}`;
  const startMonth = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 }[parsed.quarter];
  const start = new Date(Date.UTC(parsed.year, startMonth, 1));
  const end = new Date(Date.UTC(parsed.year, startMonth + 3, 0, 23, 59, 59));

  const [purchases, rates] = await Promise.all([
    db
      .select()
      .from(fuelPurchases)
      .where(
        and(
          eq(fuelPurchases.orgId, user.orgId),
          between(fuelPurchases.purchaseDate, start, end),
        ),
      ),
    db.select().from(iftaTaxRates).where(eq(iftaTaxRates.quarter, quarter)),
  ]);

  const gallonsByState = purchases.reduce<Record<string, number>>((acc, p) => {
    const st = p.state ?? "";
    acc[st] = (acc[st] || 0) + (p.quantity || 0);
    return acc;
  }, {});

  let totalTax = 0;
  for (const rate of rates) {
    const gallons = gallonsByState[rate.state] || 0;
    totalTax += gallons * rate.rate;
  }

  const dueMonth = (startMonth + 3) % 12;
  const dueYear = parsed.year + Math.floor((startMonth + 3) / 12);
  const due = new Date(Date.UTC(dueYear, dueMonth, 30));
  let interest = 0;
  if (Date.now() > due.getTime()) {
    const days = Math.floor((Date.now() - due.getTime()) / 86400000);
    interest = Math.round(totalTax * 0.0001 * days);
  }

  const doc = new PDFDocument();
  const dir = path.join(process.cwd(), "main/public/uploads");
  await fsPromises.mkdir(dir, { recursive: true });
  const filename = `${quarter}-${Date.now()}.pdf`;
  const filePath = path.join(dir, filename);
  const stream = createWriteStream(filePath);
  doc.pipe(stream);
  doc.fontSize(18).text(`IFTA Report ${quarter}`, { align: "center" });
  doc.moveDown();
  doc.text(`Total Tax: $${(totalTax / 100).toFixed(2)}`);
  doc.text(`Interest: $${(interest / 100).toFixed(2)}`);
  doc.end();
  await new Promise<void>((resolve) => stream.on("finish", resolve));

  const [report] = await db
    .insert(iftaReports)
    .values({
      orgId: user.orgId,
      quarter,
      totalTax,
      interest,
      pdfUrl: `/uploads/${filename}`,
      createdById: parseInt(user.id),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.IFTA_REPORT_GENERATE,
    resource: AUDIT_RESOURCES.IFTA_REPORT,
    resourceId: report.id.toString(),
    details: { quarter },
  });

  revalidatePath("/dashboard/ifta/reports");
  return { success: true, report };
}

const AuditResponseSchema = z.object({
  question: z.string().min(1),
  response: z.string().optional(),
});

export async function uploadIftaDocumentsAction(formData: FormData) {
  formData.set('category', 'ifta');
  return uploadDocumentsAction(formData);
}

export async function recordIftaAuditResponseAction(formData: FormData) {
  const user = await requirePermission('org:compliance:access_audit_logs');
  const input = AuditResponseSchema.parse(Object.fromEntries(formData));

  const [resp] = await db
    .insert(iftaAuditResponses)
    .values({
      orgId: user.orgId,
      question: input.question,
      response: input.response,
      createdById: parseInt(user.id),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.COMPLIANCE_REVIEW,
    resource: AUDIT_RESOURCES.IFTA_REPORT,
    resourceId: resp.id.toString(),
  });

  revalidatePath('/dashboard/ifta/audit');
  return { success: true, response: resp };
}

export async function exportIftaRecordsAction(year: number, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4') {
  const user = await requirePermission('org:ifta:generate_report');
  const startMonth = { Q1: 0, Q2: 3, Q3: 6, Q4: 9 }[quarter];
  const start = new Date(Date.UTC(year, startMonth, 1));
  const end = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59));

  const [tripsRows, fuelRows, reports] = await Promise.all([
    getTripsForPeriod(user.orgId, start, end),
    getFuelPurchasesForPeriod(user.orgId, start, end),
    db
      .select()
      .from(iftaReports)
      .where(
        and(eq(iftaReports.orgId, user.orgId), between(iftaReports.createdAt, start, end)),
      ),
  ]);

  const lines: string[] = [];
  lines.push('Trips');
  lines.push('id,startState,endState,distance');
  for (const t of tripsRows) {
    const startLocation = t.startLocation as { state?: string } || {};
    const endLocation = t.endLocation as { state?: string } || {};
    lines.push(`${t.id},${startLocation.state || ''},${endLocation.state || ''},${t.distance ?? 0}`);
  }
  lines.push('');
  lines.push('FuelPurchases');
  lines.push('id,driverId,vehicleId,purchaseDate,quantity,pricePerUnit,state');
  for (const f of fuelRows) {
    lines.push(
      `${f.id},${f.driverId},${f.vehicleId},${f.purchaseDate.toISOString()},${f.quantity ?? 0},${f.pricePerUnit ?? 0},${f.state ?? ''}`,
    );
  }
  lines.push('');
  lines.push('Reports');
  lines.push('id,quarter,totalTax,interest,pdfUrl');
  for (const r of reports) {
    lines.push(`${r.id},${r.quarter},${r.totalTax},${r.interest},${r.pdfUrl}`);
  }

  const csv = lines.join('\n');
  const gz = gzipSync(csv);

  await createAuditLog({
    action: AUDIT_ACTIONS.COMPLIANCE_REPORT_GENERATE,
    resource: AUDIT_RESOURCES.IFTA_REPORT,
  });

  return new Response(gz, {
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': 'attachment; filename=ifta-audit.gz',
    },
  });
}

const EldRowSchema = z.object({
  driverId: z.coerce.number(),
  vehicleId: z.coerce.number(),
  loadId: z.preprocess((val) => (val === '' ? undefined : val), z.coerce.number().optional()),
  startLat: z.coerce.number(),
  startLng: z.coerce.number(),
  startState: z.string().min(2),
  endLat: z.coerce.number(),
  endLng: z.coerce.number(),
  endState: z.string().min(2),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
});

export async function importEldCsvAction(formData: FormData): Promise<void> {
  const user = await requirePermission('org:ifta:import_data');
  const file = formData.get('csv');
  if (!(file instanceof File)) {
    throw new Error('No file provided');
  }
  const stream = file.stream();
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let count = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split(/\r?\n/);
    buffer = lines.pop()!; // Save the last partial line for the next chunk
    for (const line of lines) {
    if (!line) continue;
    const [
      driverId,
      vehicleId,
      loadId,
      startLat,
      startLng,
      startState,
      endLat,
      endLng,
      endState,
      startedAt,
      endedAt,
    ] = line.split(',');
    const parsed = EldRowSchema.safeParse({
      driverId,
      vehicleId,
      loadId,
      startLat,
      startLng,
      startState,
      endLat,
      endLng,
      endState,
      startedAt,
      endedAt,
    });
    if (!parsed.success) continue;
    const data = parsed.data;
    const distance = haversine(data.startLat, data.startLng, data.endLat, data.endLng);
    await db
      .insert(trips)
      .values({
        orgId: user.orgId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        loadId: data.loadId,
        startLocation: { lat: data.startLat, lng: data.startLng, state: data.startState },
        endLocation: { lat: data.endLat, lng: data.endLng, state: data.endState },
        distance,
        jurisdictions: [{ state: data.startState, miles: distance }],
        isInterstate: data.startState !== data.endState,
        startedAt: data.startedAt,
        endedAt: data.endedAt,
        createdById: parseInt(user.id),
      });
    count++;
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.ELD_IMPORT,
    resource: AUDIT_RESOURCES.TRIP,
    details: { count },
  });

  revalidatePath('/dashboard/ifta/trips');
}
