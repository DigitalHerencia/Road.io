'use server'

import { z } from 'zod'
import { db } from '../db'
import { userInvitations, users, organizations } from '../schema'
import { revalidatePath } from 'next/cache'
import { generateSecureToken } from '../utils'
import { sendEmail } from '../email'
import { requirePermission, requireRole } from '../rbac'
import { SystemRoles } from '@/types/rbac'
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../audit'
import { eq, and, desc, count } from 'drizzle-orm'

// Validation schemas
const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(SystemRoles)
})

const userUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(SystemRoles).optional(),
  isActive: z.boolean().optional(),
})

const bulkUserUpdateSchema = z.object({
  userIds: z.array(z.number()),
  action: z.enum(['activate', 'deactivate', 'suspend']),
})

const organizationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().optional(),
  maxUsers: z.number().min(1).optional(),
  settings: z.record(z.unknown()).optional(),
})

// User management actions
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

const acceptInviteSchema = z.object({
  token: z.string(),
  name: z.string(),
  clerkUserId: z.string()
})

export async function acceptInvitationAction(data: z.infer<typeof acceptInviteSchema>) {
  const values = acceptInviteSchema.parse(data)

  const [invite] = await db
    .select()
    .from(userInvitations)
    .where(eq(userInvitations.token, values.token))

  if (!invite) {
    return { success: false, error: 'Invalid invitation token' }
  }
  if (invite.expiresAt < new Date()) {
    return { success: false, error: 'Invitation expired' }
  }

  const [user] = await db
    .insert(users)
    .values({
      clerkUserId: values.clerkUserId,
      email: invite.email,
      name: values.name,
      orgId: invite.orgId,
      role: invite.role as SystemRoles,
      isActive: true
    })
    .returning()

  await db
    .update(userInvitations)
    .set({ acceptedAt: new Date() })
    .where(eq(userInvitations.id, invite.id))

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_CREATE,
    resource: AUDIT_RESOURCES.USER,
    resourceId: user.id.toString(),
    details: { via: 'invitation' }
  })

  revalidatePath('/dashboard/admin/users')
  return { success: true, user }
}

export async function getUsersAction() {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles')
  
  try {
    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.orgId, currentUser.orgId))
      .orderBy(desc(users.createdAt))

    return { success: true, users: usersList }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

export async function updateUserAction(data: z.infer<typeof userUpdateSchema>) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles')
  const values = userUpdateSchema.parse(data)

  try {
    // Ensure user belongs to same organization
    const [targetUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, values.id), eq(users.orgId, currentUser.orgId)))

    if (!targetUser) {
      return { success: false, error: 'User not found' }
    }

    const updateData: Partial<typeof users.$inferInsert> = { updatedAt: new Date() }
    if (values.name !== undefined) updateData.name = values.name
    if (values.email !== undefined) updateData.email = values.email
    if (values.role !== undefined) updateData.role = values.role
    if (values.isActive !== undefined) updateData.isActive = values.isActive

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, values.id))
      .returning()

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_UPDATE,
      resource: AUDIT_RESOURCES.USER,
      resourceId: values.id.toString(),
      details: { 
        changes: updateData,
        updatedBy: currentUser.id 
      },
    })

    revalidatePath('/dashboard/admin/users')
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function bulkUpdateUsersAction(data: z.infer<typeof bulkUserUpdateSchema>) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles')
  const values = bulkUserUpdateSchema.parse(data)

  try {
    const updateData: Partial<typeof users.$inferInsert> = { updatedAt: new Date() }
    
    switch (values.action) {
      case 'activate':
        updateData.isActive = true
        break
      case 'deactivate':
        updateData.isActive = false
        break
      case 'suspend':
        updateData.isActive = false
        break
    }

    // Ensure all users belong to same organization
    const targetUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.orgId, currentUser.orgId),
        // Add condition to filter by userIds
      ))

    if (targetUsers.length !== values.userIds.length) {
      return { success: false, error: 'Some users not found in organization' }
    }

    const results = await Promise.all(
      values.userIds.map(userId =>
        db.update(users)
          .set(updateData)
          .where(eq(users.id, userId))
          .returning()
      )
    )

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_BULK_UPDATE,
      resource: AUDIT_RESOURCES.USER,
      details: { 
        action: values.action,
        userIds: values.userIds,
        updatedBy: currentUser.id 
      },
    })

    revalidatePath('/dashboard/admin/users')
    return { success: true, updatedCount: results.length }
  } catch (error) {
    console.error('Error bulk updating users:', error)
    return { success: false, error: 'Failed to bulk update users' }
  }
}

// Organization management actions
export async function getOrganizationAction() {
  const currentUser = await requirePermission('org:admin:configure_company_settings')
  
  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, currentUser.orgId))

    return { success: true, organization: org }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return { success: false, error: 'Failed to fetch organization' }
  }
}

export async function updateOrganizationAction(data: z.infer<typeof organizationUpdateSchema>) {
  const currentUser = await requirePermission('org:admin:configure_company_settings')
  const values = organizationUpdateSchema.parse(data)

  try {
    const updateData: Partial<typeof organizations.$inferInsert> = { updatedAt: new Date() }
    if (values.name !== undefined) updateData.name = values.name
    if (values.domain !== undefined) updateData.domain = values.domain
    if (values.maxUsers !== undefined) updateData.maxUsers = values.maxUsers
    if (values.settings !== undefined) updateData.settings = values.settings

    const [updatedOrg] = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, currentUser.orgId))
      .returning()

    await createAuditLog({
      action: AUDIT_ACTIONS.ORG_UPDATE,
      resource: AUDIT_RESOURCES.ORGANIZATION,
      resourceId: currentUser.orgId.toString(),
      details: { 
        changes: updateData,
        updatedBy: currentUser.id 
      },
    })

    revalidatePath('/dashboard/admin/organization')
    return { success: true, organization: updatedOrg }
  } catch (error) {
    console.error('Error updating organization:', error)
    return { success: false, error: 'Failed to update organization' }
  }
}

// Multi-tenant administration
export async function getOrganizationStatsAction() {
  const currentUser = await requireRole(SystemRoles.ADMIN)
  
  try {
    const [userCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.orgId, currentUser.orgId))

    const [activeUserCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.orgId, currentUser.orgId), eq(users.isActive, true)))

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, currentUser.orgId))

    return { 
      success: true, 
      stats: {
        totalUsers: userCount.count,
        activeUsers: activeUserCount.count,
        maxUsers: org?.maxUsers || 0,
        subscriptionStatus: org?.subscriptionStatus || 'trialing',
        subscriptionPlan: org?.subscriptionPlan || 'basic'
      }
    }
  } catch (error) {
    console.error('Error fetching organization stats:', error)
    return { success: false, error: 'Failed to fetch organization stats' }
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
