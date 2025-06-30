'use server';

import { db } from '@/lib/db';
import { users, drivers, vehicles, loads } from '@/lib/schema';
import { requirePermission } from '@/lib/rbac';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit';
import { SystemRoles } from '@/types/rbac';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// User Management Actions
export async function createUserAction(userData: {
  email: string;
  name: string;
  role: SystemRoles;
}) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles');
  
  try {
    const [newUser] = await db.insert(users).values({
      clerkUserId: '', // Will be updated when user signs in
      email: userData.email,
      name: userData.name,
      orgId: currentUser.orgId,
      role: userData.role,
    }).returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_CREATE,
      resource: AUDIT_RESOURCES.USER,
      resourceId: newUser.id.toString(),
      details: { userData, createdBy: currentUser.id },
    });

    revalidatePath('/dashboard/users');
    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function updateUserRoleAction(userId: number, newRole: SystemRoles) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles');
  
  try {
    // Ensure user belongs to same organization
    const [targetUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.orgId, currentUser.orgId)));

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
      resource: AUDIT_RESOURCES.USER,
      resourceId: userId.toString(),
      details: { 
        oldRole: targetUser.role, 
        newRole, 
        changedBy: currentUser.id 
      },
    });

    revalidatePath('/dashboard/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

// Load Management Actions
export async function createLoadAction(loadData: {
  loadNumber: string;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
    datetime: string;
  };
  deliveryLocation: {
    address: string;
    lat: number;
    lng: number;
    datetime: string;
  };
  weight?: number;
  rate?: number;
  notes?: string;
}) {
  const currentUser = await requirePermission('org:dispatcher:create_edit_loads');
  
  try {
    const [newLoad] = await db.insert(loads).values({
      orgId: currentUser.orgId,
      loadNumber: loadData.loadNumber,
      pickupLocation: loadData.pickupLocation,
      deliveryLocation: loadData.deliveryLocation,
      weight: loadData.weight,
      rate: loadData.rate,
      notes: loadData.notes,
      createdById: parseInt(currentUser.id),
    }).returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.LOAD_CREATE,
      resource: AUDIT_RESOURCES.LOAD,
      resourceId: newLoad.id.toString(),
      details: { loadData, createdBy: currentUser.id },
    });

    revalidatePath('/dashboard/loads');
    return { success: true, load: newLoad };
  } catch (error) {
    console.error('Error creating load:', error);
    return { success: false, error: 'Failed to create load' };
  }
}

export async function assignLoadAction(loadId: number, driverId: number, vehicleId: number) {
  const currentUser = await requirePermission('org:dispatcher:assign_drivers');
  
  try {
    // Verify load belongs to same organization
    const [load] = await db
      .select()
      .from(loads)
      .where(and(eq(loads.id, loadId), eq(loads.orgId, currentUser.orgId)));

    if (!load) {
      return { success: false, error: 'Load not found' };
    }

    const [updatedLoad] = await db
      .update(loads)
      .set({ 
        assignedDriverId: driverId,
        assignedVehicleId: vehicleId,
        status: 'assigned',
        updatedAt: new Date()
      })
      .where(eq(loads.id, loadId))
      .returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.LOAD_ASSIGN,
      resource: AUDIT_RESOURCES.LOAD,
      resourceId: loadId.toString(),
      details: { 
        driverId, 
        vehicleId, 
        assignedBy: currentUser.id 
      },
    });

    revalidatePath('/dashboard/loads');
    revalidatePath('/dashboard/drivers');
    return { success: true, load: updatedLoad };
  } catch (error) {
    console.error('Error assigning load:', error);
    return { success: false, error: 'Failed to assign load' };
  }
}

export async function updateLoadStatusAction(loadId: number, status: string) {
  const currentUser = await requirePermission('org:driver:update_load_status');
  
  try {
    // Verify user can access this load
    const [load] = await db
      .select()
      .from(loads)
      .where(and(eq(loads.id, loadId), eq(loads.orgId, currentUser.orgId)));

    if (!load) {
      return { success: false, error: 'Load not found' };
    }

    // If user is a driver, they can only update loads assigned to them
    if (currentUser.role === SystemRoles.DRIVER) {
      const [driver] = await db
        .select()
        .from(drivers)
        .where(eq(drivers.userId, parseInt(currentUser.id)));

      if (!driver || load.assignedDriverId !== driver.id) {
        return { success: false, error: 'Not authorized to update this load' };
      }
    }

    const [updatedLoad] = await db
      .update(loads)
      .set({ 
        status: status as 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled', 
        updatedAt: new Date() 
      })
      .where(eq(loads.id, loadId))
      .returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.LOAD_STATUS_CHANGE,
      resource: AUDIT_RESOURCES.LOAD,
      resourceId: loadId.toString(),
      details: { 
        oldStatus: load.status, 
        newStatus: status, 
        updatedBy: currentUser.id 
      },
    });

    revalidatePath('/dashboard/loads');
    return { success: true, load: updatedLoad };
  } catch (error) {
    console.error('Error updating load status:', error);
    return { success: false, error: 'Failed to update load status' };
  }
}

// Driver Management Actions
export async function createDriverAction(driverData: {
  userId: number;
  licenseNumber: string;
  licenseExpiry: string;
  dotNumber?: string;
}) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles');
  
  try {
    const [newDriver] = await db.insert(drivers).values({
      userId: driverData.userId,
      licenseNumber: driverData.licenseNumber,
      licenseExpiry: new Date(driverData.licenseExpiry),
      dotNumber: driverData.dotNumber,
    }).returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.DRIVER_CREATE,
      resource: AUDIT_RESOURCES.DRIVER,
      resourceId: newDriver.id.toString(),
      details: { driverData, createdBy: currentUser.id },
    });

    revalidatePath('/dashboard/drivers');
    return { success: true, driver: newDriver };
  } catch (error) {
    console.error('Error creating driver:', error);
    return { success: false, error: 'Failed to create driver' };
  }
}

// Vehicle Management Actions
import { vehicleSchema, type VehicleInput } from '@/lib/validation/vehicle'

export async function createVehicleAction(vehicleData: VehicleInput) {
  const currentUser = await requirePermission('org:admin:manage_users_and_roles');

  try {
    const data = vehicleSchema.parse(vehicleData)
    const [newVehicle] = await db.insert(vehicles).values({
      orgId: currentUser.orgId,
      vin: data.vin,
      licensePlate: data.licensePlate,
      make: data.make,
      model: data.model,
      year: data.year,
    }).returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.VEHICLE_CREATE,
      resource: AUDIT_RESOURCES.VEHICLE,
      resourceId: newVehicle.id.toString(),
      details: { vehicleData, createdBy: currentUser.id },
    });

    revalidatePath('/dashboard/vehicles');
    return { success: true, vehicle: newVehicle };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return { success: false, error: 'Failed to create vehicle' };
  }
}
