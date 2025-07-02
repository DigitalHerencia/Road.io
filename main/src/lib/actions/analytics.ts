'use server'

import { fetchLiveFleetStatus, fetchPerformanceAlerts } from '@/lib/fetchers/analytics'

export async function getLiveFleetStatusAction({ orgId }: { orgId: number }) {
  return fetchLiveFleetStatus(orgId)
}

export async function getPerformanceAlertsAction({ orgId }: { orgId: number }) {
  return fetchPerformanceAlerts(orgId)
}
