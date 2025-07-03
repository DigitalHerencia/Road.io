'use server'

import {
  fetchDispatchKPIs,
  fetchLoadCompletionMetrics,
  fetchDriverProductivity,
  fetchExceptionRate,
} from '@/lib/fetchers/dispatch'
import { z } from 'zod'

const orgIdSchema = z.object({ orgId: z.coerce.number().int().positive() })

export async function getDispatchKPIsAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params)
  return fetchDispatchKPIs(orgId)
}

export async function getLoadCompletionMetricsAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params)
  return fetchLoadCompletionMetrics(orgId)
}

export async function getDriverProductivityAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params)
  return fetchDriverProductivity(orgId)
}

export async function getExceptionRateAction(params: { orgId: number }) {
  const { orgId } = orgIdSchema.parse(params)
  return fetchExceptionRate(orgId)
}

