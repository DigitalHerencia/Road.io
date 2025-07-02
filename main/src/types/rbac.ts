// Core system roles
export enum SystemRoles {
  ADMIN = "ADMIN",
  DISPATCHER = "DISPATCHER",
  DRIVER = "DRIVER",
  COMPLIANCE = "COMPLIANCE",
  MEMBER = "MEMBER",
}

// Permission structure
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

// Organization context
export interface OrganizationContext {
  orgId: string;
  orgName: string;
  orgSlug: string;
}

// User with role and permissions
export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: SystemRoles;
  orgId: string;
  permissions: string[];
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

// Permission definitions by role
export const ROLE_PERMISSIONS: Record<SystemRoles, string[]> = {
  [SystemRoles.ADMIN]: [
    "org:sys_billing:read",
    "org:sys_billing:manage",
    "org:sys_profile:manage",
    "org:admin:configure_company_settings",
    "org:admin:manage_users_and_roles",
    "org:admin:view_edit_all_loads",
    "org:admin:view_audit_logs",
    "org:admin:access_all_reports",
    "org:sys_memberships:read",
    "org:dispatcher:view_driver_vehicle_status",
    "org:dispatcher:assign_drivers",
    "org:dispatcher:create_edit_loads",
    "org:driver:view_assigned_loads",
    "org:driver:update_load_status",
    "org:driver:upload_documents",
    "org:compliance:upload_documents",
    "org:driver:log_hos",
    "org:driver:record_trip",
    "org:driver:log_fuel_purchase",
    PERMISSION_IFTA_GENERATE_REPORT,
    "org:compliance:upload_review_compliance",
    "org:compliance:generate_compliance_req",
    "org:compliance:access_audit_logs",
  ],
  [SystemRoles.DISPATCHER]: [
    "org:sys_profile:manage",
    "org:dispatcher:view_driver_vehicle_status",
    "org:dispatcher:assign_drivers",
    "org:dispatcher:create_edit_loads",
    "org:driver:view_assigned_loads",
    "org:driver:update_load_status",
    "org:driver:record_trip",
    "org:driver:log_fuel_purchase",
  ],
  [SystemRoles.DRIVER]: [
    "org:sys_profile:manage",
    "org:driver:view_assigned_loads",
    "org:driver:update_load_status",
    "org:driver:upload_documents",
    "org:driver:log_hos",
    "org:driver:record_trip",
    "org:driver:log_fuel_purchase",
  ],
  [SystemRoles.COMPLIANCE]: [
    "org:sys_profile:manage",
    "org:compliance:upload_documents",
    "org:compliance:upload_review_compliance",
    "org:compliance:generate_compliance_req",
    "org:compliance:access_audit_logs",
    "org:driver:view_assigned_loads",
    "org:driver:upload_documents",
    "org:driver:log_fuel_purchase",
    "org:ifta:generate_report",
  ],
  [SystemRoles.MEMBER]: ["org:sys_profile:manage", "org:sys_memberships:read"],
};

// Permission parsing utilities
export function parsePermission(permission: string): {
  scope: string;
  resource: string;
  action: string;
} {
  const parts = permission.split(":");
  if (parts.length !== 3) {
    throw new Error(`Invalid permission format: ${permission}`);
  }
  return {
    scope: parts[0],
    resource: parts[1],
    action: parts[2],
  };
}

// Check if user has specific permission
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string,
): boolean {
  return userPermissions.includes(requiredPermission);
}

// Check if user has any of the required permissions
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[],
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
}

// Check if user has all required permissions
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[],
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
}

// Resource-based permission checking
export function canAccessResource(
  userPermissions: string[],
  resource: string,
  action: string,
): boolean {
  const permissionPattern = `org:${resource}:${action}`;
  return hasPermission(userPermissions, permissionPattern);
}
