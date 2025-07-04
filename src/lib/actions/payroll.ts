'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { payStatements, driverBenefits } from '@/lib/schema'
import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { eq, sum } from 'drizzle-orm'

const statementSchema = z.object({
  driverId: z.coerce.number(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  miles: z.coerce.number(),
  ratePerMile: z.coerce.number(),
  perDiem: z.coerce.number().optional(),
})

export async function generatePayStatementAction(formData: FormData) {
  const data = statementSchema.parse({
    driverId: formData.get('driverId'),
    periodStart: formData.get('periodStart'),
    periodEnd: formData.get('periodEnd'),
    miles: formData.get('miles'),
    ratePerMile: formData.get('ratePerMile'),
    perDiem: formData.get('perDiem') || undefined,
  })

  const user = await requirePermission('org:admin:manage_users_and_roles')

  const benefitsRes = await db
    .select({ total: sum(driverBenefits.amount).as('total') })
    .from(driverBenefits)
    .where(eq(driverBenefits.driverId, data.driverId))

  const benefitsDeduction = Number(benefitsRes[0]?.total ?? 0)
  const grossPay = data.miles * data.ratePerMile + (data.perDiem ?? 0)
  const netPay = grossPay - benefitsDeduction

  const [statement] = await db
    .insert(payStatements)
    .values({
      orgId: user.orgId,
      driverId: data.driverId,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      miles: data.miles,
      ratePerMile: data.ratePerMile,
      perDiem: data.perDiem ?? 0,
      benefitsDeduction,
      grossPay,
      netPay,
    })
    .returning()

  await createAuditLog({
    action: AUDIT_ACTIONS.PAY_STATEMENT_CREATE,
    resource: AUDIT_RESOURCES.PAY_STATEMENT,
    resourceId: statement.id.toString(),
  })

  revalidatePath(`/drivers/${data.driverId}/pay`)
  return { success: true, id: statement.id }
}
