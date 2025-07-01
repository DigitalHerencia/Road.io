'use server'

import { z } from 'zod'
import { db } from '../db'
import { userInvitations } from '../schema'
import { revalidatePath } from 'next/cache'
import { generateSecureToken } from '../utils'
import { sendEmail } from '../email'
import { requirePermission } from '../rbac'
import { SystemRoles } from '@/types/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../audit'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(SystemRoles)
})

export async function inviteUserAction(formData: FormData) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles')
  const values = inviteSchema.parse({
    email: formData.get('email'),
    role: formData.get('role')
  })

  try {
    const token = generateSecureToken(32)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    const [invite] = await db.insert(userInvitations).values({
      orgId: currentUser.orgId,
      email: values.email,
      role: values.role,
      token,
      expiresAt
    }).returning()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const link = `${appUrl}/register?token=${token}`

    await sendEmail({
      to: values.email,
      subject: 'You are invited to Road.io',
      html: `<p>You have been invited to join ${currentUser.organizationName}. <a href="${link}">Register here</a>.</p>`
    })

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_INVITE,
      resource: AUDIT_RESOURCES.USER,
      resourceId: invite.id.toString(),
      details: { invitedBy: currentUser.id, email: values.email, role: values.role }
    })

    revalidatePath('/dashboard/admin/users')
    return { success: true }
  } catch (err) {
    console.error('Error inviting user:', err)
    return { success: false, error: 'Failed to send invitation' }
  }
}

export async function sendWelcomeEmailAction(email: string, organization: string) {
  await sendEmail({
    to: email,
    subject: `Welcome to ${organization}`,
    html: `<p>Welcome to ${organization}! Your account is ready.</p>`
  })

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_WELCOME_EMAIL,
    resource: AUDIT_RESOURCES.USER,
    details: { email }
  })
}
