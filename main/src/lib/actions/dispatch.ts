'use server'

import {
  fetchDispatchKPIs,
  fetchLoadCompletionMetrics,
  fetchDriverProductivity,
  fetchExceptionRate,
} from '@/lib/fetchers/dispatch'

export async function getDispatchKPIsAction({ orgId }: { orgId: number }) {
  return fetchDispatchKPIs(orgId)
}

export async function getLoadCompletionMetricsAction({ orgId }: { orgId: number }) {
  return fetchLoadCompletionMetrics(orgId)
}

export async function getDriverProductivityAction({ orgId }: { orgId: number }) {
  return fetchDriverProductivity(orgId)
}

export async function getExceptionRateAction({ orgId }: { orgId: number }) {
  return fetchExceptionRate(orgId)
}

