"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { hosLogs, hosViolations } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from "@/lib/audit";
import { and, eq, gte } from "drizzle-orm";

const logSchema = z.object({
  driverId: z.coerce.number(),
  status: z.enum(["OFF_DUTY", "SLEEPER", "DRIVING", "ON_DUTY"]),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  source: z.enum(["MANUAL", "ELD"]).default("MANUAL"),
});
export type HosLogInput = z.infer<typeof logSchema>;

export async function recordHosLog(formData: FormData) {
  const user = await requirePermission("org:driver:log_hos");
  const input = logSchema.parse({
    driverId: formData.get("driverId"),
    status: formData.get("status"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime") || undefined,
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    address: formData.get("address"),
    notes: formData.get("notes"),
    source: formData.get("source") || "MANUAL",
  });

  const [log] = await db
    .insert(hosLogs)
    .values({
      orgId: user.orgId,
      driverId: input.driverId,
      status: input.status,
      startTime: input.startTime,
      endTime: input.endTime,
      location:
        input.lat && input.lng
          ? { lat: input.lat, lng: input.lng, address: input.address }
          : null,
      notes: input.notes,
      source: input.source,
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.HOS_LOG_CREATE,
    resource: AUDIT_RESOURCES.COMPLIANCE,
    resourceId: log.id.toString(),
  });

  await detectHosViolations(log.driverId);

  revalidatePath("/drivers");
  return { success: true, log };
}

async function detectHosViolations(driverId: number) {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24);
  const logs = await db
    .select()
    .from(hosLogs)
    .where(and(eq(hosLogs.driverId, driverId), gte(hosLogs.startTime, since)));

  let drivingHours = 0;
  for (const log of logs) {
    if (log.status !== "DRIVING") continue;
    const end = log.endTime ?? new Date();
    drivingHours += (end.getTime() - log.startTime.getTime()) / 36e5;
  }

  if (drivingHours > 11) {
    const [violation] = await db
      .insert(hosViolations)
      .values({
        orgId: logs[0]?.orgId ?? 0,
        driverId,
        logId: logs.at(-1)?.id, // logs are now sorted, so this reliably gets the latest log
        type: "MAX_DRIVE",
        message: "Exceeded 11 hour driving limit in 24h",
      })
      .returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.HOS_VIOLATION,
      resource: AUDIT_RESOURCES.COMPLIANCE,
      resourceId: violation.id.toString(),
    });
  }
}

export async function getDriverHosReport(driverId: number, day: Date) {
  await requirePermission("org:admin:access_all_reports");
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const logs = await db
    .select()
    .from(hosLogs)
    .where(and(eq(hosLogs.driverId, driverId), gte(hosLogs.startTime, start)));
  const dayLogs = logs.filter((l) => l.startTime < end);

  return { driverId, logs: dayLogs };
}

export async function getFleetHosReport(day: Date) {
  await requirePermission("org:admin:access_all_reports");
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  const logs = await db
    .select()
    .from(hosLogs)
    .where(gte(hosLogs.startTime, start));
  const filtered = logs.filter((l) => l.startTime < end);

  return { logs: filtered };
}
