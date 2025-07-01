'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { trips } from '@/lib/schema'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

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
  endedAt: z.coerce.date()
})

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8 // miles
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLon = (lon2 - lon1) * rad
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function recordTripAction(formData: FormData) {
  const parseResult = TripFormSchema.safeParse({
    driverId: formData.get('driverId'),
    loadId: formData.get('loadId'),
    startLat: formData.get('startLat'),
    startLng: formData.get('startLng'),
    startState: formData.get('startState'),
    endLat: formData.get('endLat'),
    endLng: formData.get('endLng'),
    endState: formData.get('endState'),
    startedAt: formData.get('startedAt'),
    endedAt: formData.get('endedAt')
  })

  if (!parseResult.success) {
    return { success: false, error: 'Invalid input', issues: parseResult.error.flatten() }
  }

  const currentUser = await requirePermission('org:driver:record_trip')
  const data = parseResult.data

  const distance = haversine(data.startLat, data.startLng, data.endLat, data.endLng)
  const isInterstate = data.startState !== data.endState

  const [trip] = await db.insert(trips).values({
    orgId: currentUser.orgId,
    driverId: data.driverId || parseInt(currentUser.id),
    loadId: data.loadId,
    startLocation: { lat: data.startLat, lng: data.startLng, state: data.startState },
    endLocation: { lat: data.endLat, lng: data.endLng, state: data.endState },
    distance,
    jurisdictions: [ { state: data.startState, miles: distance } ],
    isInterstate,
    startedAt: data.startedAt,
    endedAt: data.endedAt,
    createdById: parseInt(currentUser.id)
  }).returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.TRIP_CREATE,
    resource: AUDIT_RESOURCES.TRIP,
    resourceId: trip.id.toString(),
    details: { distance, isInterstate }
  })

  revalidatePath('/dashboard/ifta/trips')
  return { success: true }
}
