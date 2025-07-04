'use server'

import { fetchLiveFleetStatus, fetchPerformanceAlerts } from '@/lib/fetchers/analytics'
import { z } from 'zod'

const orgIdSchema = z.object({ orgId: z.coerce.number().int().positive() })

export async function getLiveFleetStatusAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params)
  return fetchLiveFleetStatus(orgId)
}

export async function getPerformanceAlertsAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params)
  return fetchPerformanceAlerts(orgId)
}
