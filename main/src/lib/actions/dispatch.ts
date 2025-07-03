"use server";

import {
  fetchDispatchKPIs,
  fetchLoadCompletionMetrics,
  fetchDriverProductivity,
  fetchExceptionRate,
  calculateOptimalRoute,
  updateDriverLocation,
  isWithinGeofence,
} from "@/lib/fetchers/dispatch";
import { z } from "zod";

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
