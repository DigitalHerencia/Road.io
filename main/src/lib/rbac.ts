import { auth } from '@clerk/nextjs/server';
import { db } from './db';
import { users, organizations, roles } from './schema';
import type { UserStatus } from '@/types/users';
import { eq, and } from 'drizzle-orm';
import { SystemRoles, ROLE_PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/rbac';

export interface AuthenticatedUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  orgId: number;
  organizationName: string;
  organizationSlug: string;
  role: SystemRoles;
  customRoleId: number | null;
  customRoleName: string | null;
  permissions: string[];
  isActive: boolean;
  status: UserStatus;
}

/**
 * Get the current authenticated user with their role and permissions
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return null;
    }

    const result = await db
      .select({
        id: users.id,
        clerkUserId: users.clerkUserId,
        email: users.email,
        name: users.name,
        orgId: users.orgId,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
        role: users.role,
        customRoleId: users.customRoleId,
        customRoleName: roles.name,
        customPermissions: roles.permissions,
        status: users.status,

        isActive: users.isActive,
      })
      .from(users)
      .innerJoin(organizations, eq(users.orgId, organizations.id))
      .leftJoin(roles, eq(users.customRoleId, roles.id))
      .where(
        and(
          eq(users.clerkUserId, clerkUserId),
          eq(users.isActive, true),
          eq(organizations.isActive, true)
        )
      );

    if (result.length === 0) {
      return null;
    }

    const user = result[0];
    let permissions = ROLE_PERMISSIONS[user.role as SystemRoles] || [];
    if (user.customPermissions) {
      permissions = Array.from(new Set([...permissions, ...user.customPermissions]))
    }

    return {
      id: user.id.toString(),
      clerkUserId: user.clerkUserId,
      email: user.email,
      name: user.name,
      orgId: user.orgId,
      organizationName: user.organizationName,
      organizationSlug: user.organizationSlug,
      role: user.role as SystemRoles,
      customRoleId: user.customRoleId,
      customRoleName: user.customRoleName,
      permissions,
      isActive: user.isActive,
      status: user.status as UserStatus,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if current user has a specific permission
 */
export async function checkPermission(requiredPermission: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return hasPermission(user.permissions, requiredPermission);
}

/**
 * Check if current user has any of the required permissions
 */
export async function checkAnyPermission(requiredPermissions: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return hasAnyPermission(user.permissions, requiredPermissions);
}

/**
 * Check if current user has all required permissions
 */
export async function checkAllPermissions(requiredPermissions: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return hasAllPermissions(user.permissions, requiredPermissions);
}

/**
 * Check if current user has a specific role
 */
export async function checkRole(requiredRole: SystemRoles): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return user.role === requiredRole;
}

/**
 * Check if current user has any of the required roles
 */
export async function checkAnyRole(requiredRoles: SystemRoles[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return requiredRoles.includes(user.role);
}

/**
 * Require authentication and return user or throw error
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require specific permission or throw error
 */
export async function requirePermission(requiredPermission: string): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (!hasPermission(user.permissions, requiredPermission)) {
    throw new Error(`Permission required: ${requiredPermission}`);
  }
  
  return user;
}

/**
 * Require any of the specified permissions or throw error
 */
export async function requireAnyPermission(requiredPermissions: string[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (!hasAnyPermission(user.permissions, requiredPermissions)) {
    throw new Error(`One of these permissions required: ${requiredPermissions.join(', ')}`);
  }
  
  return user;
}

/**
 * Require specific role or throw error
 */
export async function requireRole(requiredRole: SystemRoles): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (user.role !== requiredRole) {
    throw new Error(`Role required: ${requiredRole}`);
  }
  
  return user;
}

/**
 * Require any of the specified roles or throw error
 */
export async function requireAnyRole(requiredRoles: SystemRoles[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  
  if (!requiredRoles.includes(user.role)) {
    throw new Error(`One of these roles required: ${requiredRoles.join(', ')}`);
  }
  
  return user;
}

/**
 * Get organization context for current user
 */
export async function getOrganizationContext() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  return {
    orgId: user.orgId.toString(),
    orgName: user.organizationName,
    orgSlug: user.organizationSlug,
  };
}

/**
 * Check if user can access resource within their organization
 */
export async function canAccessOrgResource(resourceOrgId: number): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  return user.orgId === resourceOrgId;
}
