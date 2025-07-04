'use client';

import { useUser } from '@clerk/nextjs';
import { ReactNode, useEffect, useState } from 'react';
import { SystemRoles, ROLE_PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/rbac';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: SystemRoles;
  roles?: SystemRoles[];
  requireAll?: boolean; // For permissions array - require all vs any
  fallback?: ReactNode;
  loading?: ReactNode;
}

interface UserPermissions {
  role: SystemRoles;
  permissions: string[];
}

export default function PermissionGuard({
  children,
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
  loading = <div>Loading...</div>
}: PermissionGuardProps) {
  const { user, isLoaded } = useUser();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    async function fetchUserPermissions() {
      if (!user) return;

      try {
        // Fetch user's role from your API
        const response = await fetch('/api/user/permissions');
        if (response.ok) {
          const data = await response.json();
          setUserPermissions({
            role: data.role,
            permissions: data.permissions || ROLE_PERMISSIONS[data.role as SystemRoles] || []
          });
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      }
    }

    if (isLoaded && user) {
      fetchUserPermissions();
    }
  }, [user, isLoaded]);

  // Loading state
  if (!isLoaded || (user && !userPermissions)) {
    return <>{loading}</>;
  }

  // Not authenticated
  if (!user || !userPermissions) {
    return <>{fallback}</>;
  }

  // Check role requirements
  if (role && userPermissions.role !== role) {
    return <>{fallback}</>;
  }

  if (roles && !roles.includes(userPermissions.role)) {
    return <>{fallback}</>;
  }

  // Check permission requirements
  if (permission && !hasPermission(userPermissions.permissions, permission)) {
    return <>{fallback}</>;
  }

  if (permissions) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(userPermissions.permissions, permissions)
      : hasAnyPermission(userPermissions.permissions, permissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  // All checks passed
  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role={SystemRoles.ADMIN} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function DispatcherOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role={SystemRoles.DISPATCHER} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function DriverOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role={SystemRoles.DRIVER} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function ComplianceOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard role={SystemRoles.COMPLIANCE} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function ManagementOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard 
      roles={[SystemRoles.ADMIN, SystemRoles.DISPATCHER]} 
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}
