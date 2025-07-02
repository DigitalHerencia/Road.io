'use server';

import { db } from '@/lib/db';
import { loads, drivers } from '@/lib/schema';
import { loadFormSchema } from '@/lib/validation/load';
import { AUDIT_ACTIONS, AUDIT_RESOURCES, createAuditLog } from '@/lib/audit';
import { requirePermission, getCurrentUser } from '@/lib/rbac';
import { loadStatusEnum } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import { eq, and, inArray } from 'drizzle-orm';
import { SystemRoles } from '@/types/rbac';

export async function createLoad(formData: FormData) {
  const user = await requirePermission('org:dispatcher:create_edit_loads');
  const input = loadFormSchema.parse({
    loadNumber: formData.get('loadNumber'),
    pickupAddress: formData.get('pickupAddress'),
    pickupTime: formData.get('pickupTime'),
    deliveryAddress: formData.get('deliveryAddress'),
    deliveryTime: formData.get('deliveryTime'),
    weight: formData.get('weight'),
    rate: formData.get('rate'),
    notes: formData.get('notes'),
  });

  const [load] = await db.insert(loads).values({
    orgId: user.orgId,
    loadNumber: input.loadNumber,
    pickupLocation: {
      address: input.pickupAddress,
      lat: 0,
      lng: 0,
      datetime: input.pickupTime,
    },
    deliveryLocation: {
      address: input.deliveryAddress,
      lat: 0,
      lng: 0,
      datetime: input.deliveryTime,
    },
    weight: input.weight,
    rate: input.rate,
    notes: input.notes,
    createdById: parseInt(user.id),
  }).returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.LOAD_CREATE,
    resource: AUDIT_RESOURCES.LOAD,
    resourceId: load.id.toString(),
    details: { createdBy: user.id },
  });

  revalidatePath('/dashboard/loads');
  return { success: true, load };
}

export async function updateLoad(id: number, formData: FormData) {
  const user = await requirePermission('org:dispatcher:create_edit_loads');
  const input = loadFormSchema.parse({
    loadNumber: formData.get('loadNumber'),
    pickupAddress: formData.get('pickupAddress'),
    pickupTime: formData.get('pickupTime'),
    deliveryAddress: formData.get('deliveryAddress'),
    deliveryTime: formData.get('deliveryTime'),
    weight: formData.get('weight'),
    rate: formData.get('rate'),
    notes: formData.get('notes'),
  });

  const [load] = await db
    .update(loads)
    .set({
      loadNumber: input.loadNumber,
      pickupLocation: {
        address: input.pickupAddress,
        lat: 0,
        lng: 0,
        datetime: input.pickupTime,
      },
      deliveryLocation: {
        address: input.deliveryAddress,
        lat: 0,
        lng: 0,
        datetime: input.deliveryTime,
      },
      weight: input.weight,
      rate: input.rate,
      notes: input.notes,
      updatedAt: new Date(),
    })
    .where(eq(loads.id, id))
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.LOAD_UPDATE,
    resource: AUDIT_RESOURCES.LOAD,
    resourceId: id.toString(),
    details: { updatedBy: user.id },
  });

  revalidatePath('/dashboard/loads');
  revalidatePath(`/dashboard/loads/${id}`);
  return { success: true, load };
}

export async function updateLoadStatus(loadId: number, status: typeof loadStatusEnum.enumValues[number]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const [load] = await db
    .select()
    .from(loads)
    .where(and(eq(loads.id, loadId), eq(loads.orgId, user.orgId)));

  if (!load) {
    return { success: false, error: 'Load not found' };
  }

  if (user.role === SystemRoles.DRIVER) {
    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.userId, parseInt(user.id)));
    if (!driver || load.assignedDriverId !== driver.id) {
      return { success: false, error: 'Not authorized to update this load' };
    }
  }

  const [updatedLoad] = await db
    .update(loads)
    .set({ status, updatedAt: new Date() })
    .where(eq(loads.id, loadId))
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.LOAD_STATUS_CHANGE,
    resource: AUDIT_RESOURCES.LOAD,
    resourceId: loadId.toString(),
    details: { oldStatus: load.status, newStatus: status, updatedBy: user.id },
  });

  revalidatePath('/dashboard/loads');
  return { success: true, load: updatedLoad };
}

export async function bulkExportLoads(ids: number[]) {
  await requirePermission('org:dispatcher:create_edit_loads');
  if (ids.length === 0) {
    return new Response('No loads selected', { status: 400 });
  }
  const rows = await db.select().from(loads).where(inArray(loads.id, ids));
  const lines = [
    'LoadNumber,Status,PickupAddress,DeliveryAddress,Rate',
    ...rows.map(l => `${l.loadNumber},${l.status},"${l.pickupLocation.address}","${l.deliveryLocation.address}",${l.rate ?? ''}`)
  ];
  const csv = lines.join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=loads.csv',
    },
  });
}
