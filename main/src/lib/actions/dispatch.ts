"use server";

import {
  fetchDispatchKPIs,
  fetchLoadCompletionMetrics,
  fetchDriverProductivity,
  fetchExceptionRate,
  calculateOptimalRoute,
  updateDriverLocation,
  fetchDriverLocations,
  isWithinGeofence,
} from "@/lib/fetchers/dispatch";
import { z } from "zod";
import { getIntegrationSettings } from '@/lib/fetchers/settings'
import { db } from '@/lib/db'
import { drivers, dispatchMessages } from '@/lib/schema'
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  createAuditLog,
} from '@/lib/audit'
import { requirePermission } from '@/lib/rbac'
import { eq } from 'drizzle-orm'


const orgIdSchema = z.object({ orgId: z.coerce.number().int().positive() });

export async function getDispatchKPIsAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params);
  return fetchDispatchKPIs(orgId);
}

export async function getLoadCompletionMetricsAction(params: {
  orgId: number;
}) {
  const { orgId } = orgIdSchema.parse(params);
  return fetchLoadCompletionMetrics(orgId);
}

export async function getDriverProductivityAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params);
  return fetchDriverProductivity(orgId);
}

export async function getExceptionRateAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params);
  return fetchExceptionRate(orgId);
}

export async function getDriverLocationsAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params)
  return fetchDriverLocations(orgId)
}

export interface MobileDispatchReport {
  kpis: Awaited<ReturnType<typeof fetchDispatchKPIs>>
  loadCompletion: Awaited<ReturnType<typeof fetchLoadCompletionMetrics>>
  productivity: Awaited<ReturnType<typeof fetchDriverProductivity>>
  exceptions: Awaited<ReturnType<typeof fetchExceptionRate>>
  fetchedAt: string
}

export async function getMobileDispatchReportAction(params: { orgId: number }): Promise<MobileDispatchReport> {
  const { orgId } = orgIdSchema.parse(params)
  const [kpis, loadCompletion, productivity, exceptions] = await Promise.all([
    fetchDispatchKPIs(orgId),
    fetchLoadCompletionMetrics(orgId),
    fetchDriverProductivity(orgId),
    fetchExceptionRate(orgId),
  ])
  return {
    kpis,
    loadCompletion,
    productivity,
    exceptions,
    fetchedAt: new Date().toISOString(),
  }
}

const coordSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().nullish(),
});

const routeSchema = z.object({
  start: coordSchema,
  end: coordSchema,
  stops: z.array(coordSchema).optional(),
});

export async function planRouteAction(data: unknown) {
  const input = routeSchema.parse(data);
  return calculateOptimalRoute(input.start, input.end, input.stops);
}

const locationSchema = z.object({
  driverId: z.number().int().positive(),
  location: coordSchema,
});

export async function updateDriverLocationAction(data: unknown) {
  const input = locationSchema.parse(data);
  await updateDriverLocation(input.driverId, input.location);
  return { success: true };
}

const geofenceSchema = z.object({
  location: coordSchema,
  fence: z.object({ center: coordSchema, radius: z.number().positive() }),
});

export async function checkGeofenceAction(data: unknown) {
  const input = geofenceSchema.parse(data);
  return { inside: isWithinGeofence(input.location, input.fence) };
}

const driverMessageSchema = z.object({
  driverId: z.coerce.number().int().positive(),
  message: z.string().min(1),
  emergency: z.boolean().optional(),
})

const emergencySchema = z.object({ message: z.string().min(1) })

const customerNotificationSchema = z.object({
  loadId: z.coerce.number().int().positive(),
  email: z.string().email(),
  type: z.enum(['status', 'exception']).default('status'),
  message: z.string().min(1),
})

export async function sendDriverMessageAction(data: z.infer<typeof driverMessageSchema>) {
  const user = await requirePermission('org:dispatcher:communicate')
  const values = driverMessageSchema.parse(data)
  const [msg] = await db
    .insert(dispatchMessages)
    .values({
      orgId: user.orgId,
      driverId: values.driverId,
      senderId: parseInt(user.id),
      message: values.message,
      emergency: values.emergency ?? false,
    })
    .returning()

  const settings = await getIntegrationSettings()
  if (settings?.commsWebhookUrl) {
    try {
      await fetch(settings.commsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: values.driverId, message: values.message, emergency: values.emergency ?? false }),
      })
    } catch (err) {
      console.error('Webhook error', err)
    }
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.MESSAGE_SEND,
    resource: AUDIT_RESOURCES.DRIVER,
    resourceId: values.driverId.toString(),
    details: { message: values.message },
  })

  return { success: true, message: msg }
}

export async function broadcastEmergencyAlertAction(data: z.infer<typeof emergencySchema>) {
  const user = await requirePermission('org:dispatcher:communicate')
  const { message } = emergencySchema.parse(data)
  const driversList = await db.select({ id: drivers.id }).from(drivers).where(eq(drivers.orgId, user.orgId))
  if (driversList.length === 0) return { success: true, count: 0 }
  await db.insert(dispatchMessages).values(
    driversList.map(d => ({
      orgId: user.orgId,
      driverId: d.id,
      senderId: parseInt(user.id),
      message,
      emergency: true,
    }))
  )

  const settings = await getIntegrationSettings()
  if (settings?.commsWebhookUrl) {
    try {
      await fetch(settings.commsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, emergency: true }),
      })
    } catch (err) {
      console.error('Webhook error', err)
    }
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.EMERGENCY_ALERT,
    resource: AUDIT_RESOURCES.DRIVER,
    resourceId: 'all-drivers',
    details: { count: driversList.length },
  })

  return { success: true, count: driversList.length }
}

export async function sendCustomerNotificationAction(data: z.infer<typeof customerNotificationSchema>) {
  customerNotificationSchema.parse(data)
  await requirePermission('org:dispatcher:communicate')
  return { success: true }
}


