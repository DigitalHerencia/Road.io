'use server'

import {
  fetchDispatchKPIs,
  fetchLoadCompletionMetrics,
  fetchDriverProductivity,
  fetchExceptionRate,
} from '@/lib/fetchers/dispatch'
import { getIntegrationSettings } from '@/lib/fetchers/settings'
import { db } from '@/lib/db'
import { drivers, dispatchMessages, customerNotifications } from '@/lib/schema'
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCES,
  createAuditLog,
} from '@/lib/audit'
import { requirePermission } from '@/lib/rbac'
import { sendEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'
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
    details: { count: driversList.length },
  })

  return { success: true, count: driversList.length }
}

export async function sendCustomerNotificationAction(data: z.infer<typeof customerNotificationSchema>) {
  const user = await requirePermission('org:dispatcher:communicate')
  const values = customerNotificationSchema.parse(data)

  const [note] = await db
    .insert(customerNotifications)
    .values({
      orgId: user.orgId,
      loadId: values.loadId,
      email: values.email,
      type: values.type,
      message: values.message,
      sentAt: new Date(),
    })
    .returning()

  await sendEmail({
    to: values.email,
    subject: `Load ${values.loadId} ${values.type === 'status' ? 'Update' : 'Exception'}`,
    html: `<p>${values.message}</p>`,
  })

  await createAuditLog({
    action: AUDIT_ACTIONS.CUSTOMER_NOTIFICATION,
    resource: AUDIT_RESOURCES.LOAD,
    resourceId: values.loadId.toString(),
    details: { email: values.email, type: values.type },
  })

  return { success: true, notification: note }
}


