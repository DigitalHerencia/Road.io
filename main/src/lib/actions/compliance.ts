'use server';

import { db } from '@/lib/db';
import {
  documents,
  driverAnnualReviews,
  vehicleInspections,
  accidentReports,
  type Document,
} from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { getExpiringDocuments } from '@/lib/fetchers/compliance';
import { AUDIT_ACTIONS, AUDIT_RESOURCES, createAuditLog } from '@/lib/audit';
import { requirePermission } from '@/lib/rbac';
import { sendEmail } from '@/lib/email';
import { DOCUMENT_CATEGORIES, type DocumentCategory } from '@/features/compliance/types';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export const uploadFormSchema = z.object({
  category: z.enum(DOCUMENT_CATEGORIES),
  driverId: z.string().optional(),
  expiresAt: z.string().optional(),
});

const reviewSchema = z.object({
  driverId: z.coerce.number(),
  reviewDate: z.coerce.date(),
  isQualified: z.coerce.boolean().optional(),
  notes: z.string().optional(),
});

const inspectionSchema = z.object({
  vehicleId: z.coerce.number(),
  inspectionDate: z.coerce.date(),
  passed: z.coerce.boolean().optional(),
  notes: z.string().optional(),
});

const accidentSchema = z.object({
  driverId: z.coerce.number().optional(),
  vehicleId: z.coerce.number().optional(),
  occurredAt: z.coerce.date(),
  description: z.string().optional(),
  injuries: z.coerce.boolean().optional(),
  fatalities: z.coerce.boolean().optional(),
});

export function generateUniqueFilename(original: string): string {
  const ext = path.extname(original);
  const base = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}${ext}`;
}

export async function uploadDocumentsAction(formData: FormData) {
  const user = await requirePermission('org:compliance:upload_documents');

  const parsed = uploadFormSchema.parse({
    category: formData.get('category'),
    driverId: formData.get('driverId')?.toString(),
    expiresAt: formData.get('expiresAt')?.toString(),
  });
  const category: DocumentCategory = parsed.category;
  const { driverId, expiresAt } = parsed;

  const files = formData.getAll('documents');
  const saved: unknown[] = [];

  for (const file of files) {
    if (!(file instanceof File)) continue;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const unique = generateUniqueFilename(file.name);
    const uploadDir = path.join(process.cwd(), 'main/public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, unique);
    await fs.writeFile(filePath, buffer);

    const [doc] = await db.insert(documents).values({
      orgId: user.orgId,
      uploadedById: parseInt(user.id),
      driverId: driverId ? parseInt(driverId) : undefined,
      fileName: file.name,
      fileUrl: `/uploads/${unique}`,
      fileType: file.type,
      fileSize: file.size,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      documentType: category,
    }).returning();

    await createAuditLog({
      action: AUDIT_ACTIONS.DOCUMENT_UPLOAD,
      resource: AUDIT_RESOURCES.DOCUMENT,
      resourceId: doc.id.toString(),
      details: { fileName: file.name, category },
    });

    saved.push(doc);
  }

  revalidatePath('/dashboard/compliance/documents');
  return { success: true, documents: saved };
}

const searchSchema = z.object({
  query: z.string().min(1),
});

export async function searchDocumentsAction(formData: FormData) {
  const user = await requirePermission('org:compliance:upload_documents');
  const { query } = searchSchema.parse({ query: formData.get('query') });
  const term = `%${query}%`;
  const res = await fetchDocumentsBySearchTerm(user.orgId, term);
  return { success: true, documents: res.rows };
}

async function fetchDocumentsBySearchTerm(orgId: number, term: string) {
  return await db.execute(sql`
    SELECT * FROM documents
    WHERE org_id = ${orgId} AND file_name ILIKE ${term}
    ORDER BY created_at DESC
  `);
}

export async function sendExpirationAlerts(withinDays = 30) {
  const user = await requirePermission('org:compliance:upload_documents');
  const docs = await getExpiringDocuments(user.orgId, withinDays);

  for (const doc of docs) {
    await sendEmail({
      to: doc.email,
      subject: `Document ${doc.fileName} expiring soon`,
      html: `<p>${doc.fileName} expires on ${doc.expiresAt?.toISOString().slice(0,10)}</p>`
    });
    await createAuditLog({
      action: 'document.expiration.alert',
      resource: AUDIT_RESOURCES.DOCUMENT,
      resourceId: doc.id.toString(),
      details: { expiresAt: doc.expiresAt }
    });
  }

  return { success: true, count: docs.length };
}

export async function sendRenewalReminders(withinDays = 30) {
  const user = await requirePermission('org:compliance:upload_documents');
  const docs = await getExpiringDocuments(user.orgId, withinDays);

  for (const doc of docs) {
    await sendEmail({
      to: doc.email,
      subject: `Renewal reminder for ${doc.fileName}`,
      html: `<p>The document ${doc.fileName} will expire on ${doc.expiresAt?.toISOString().slice(0,10)}. Please renew it.</p>`
    });
    await createAuditLog({
      action: 'document.renewal.reminder',
      resource: AUDIT_RESOURCES.DOCUMENT,
      resourceId: doc.id.toString(),
      details: { expiresAt: doc.expiresAt }
    });
  }

  return { success: true, count: docs.length };
}

export async function markDocumentReviewed(id: number) {
  const user = await requirePermission('org:compliance:upload_documents');
  const [doc] = await db
    .update(documents)
    .set({ reviewedById: parseInt(user.id), reviewedAt: new Date(), isCompliant: true })
    .where(sql`id = ${id}`)
    .returning();

  await createAuditLog({
    action: 'document.reviewed',
    resource: AUDIT_RESOURCES.DOCUMENT,
    resourceId: id.toString(),
    details: { reviewedBy: user.id }
  });

  revalidatePath('/dashboard/compliance');
  return { success: true, document: doc as Document };
}

export async function recordAnnualReview(formData: FormData) {
  const user = await requirePermission('org:compliance:upload_review_compliance');
  const input = reviewSchema.parse(Object.fromEntries(formData));

  const [review] = await db
    .insert(driverAnnualReviews)
    .values({
      orgId: user.orgId,
      driverId: input.driverId,
      reviewDate: input.reviewDate,
      isQualified: input.isQualified ?? true,
      notes: input.notes,
      createdById: parseInt(user.id),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.COMPLIANCE_REVIEW,
    resource: AUDIT_RESOURCES.COMPLIANCE,
    resourceId: review.id.toString(),
  });

  revalidatePath('/dashboard/compliance/dqf');
  return { success: true, review };
}

export async function recordVehicleInspection(formData: FormData) {
  const user = await requirePermission('org:compliance:upload_review_compliance');
  const input = inspectionSchema.parse(Object.fromEntries(formData));

  const [inspection] = await db
    .insert(vehicleInspections)
    .values({
      orgId: user.orgId,
      vehicleId: input.vehicleId,
      inspectorId: parseInt(user.id),
      inspectionDate: input.inspectionDate,
      passed: input.passed ?? true,
      notes: input.notes,
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.COMPLIANCE_REVIEW,
    resource: AUDIT_RESOURCES.COMPLIANCE,
    resourceId: inspection.id.toString(),
  });

  revalidatePath('/dashboard/compliance/inspections');
  return { success: true, inspection };
}

export async function recordAccident(formData: FormData) {
  const user = await requirePermission('org:compliance:upload_review_compliance');
  const input = accidentSchema.parse(Object.fromEntries(formData));

  const [accident] = await db
    .insert(accidentReports)
    .values({
      orgId: user.orgId,
      driverId: input.driverId ?? null,
      vehicleId: input.vehicleId ?? null,
      occurredAt: input.occurredAt,
      description: input.description,
      injuries: input.injuries ?? false,
      fatalities: input.fatalities ?? false,
      createdById: parseInt(user.id),
    })
    .returning();

  await createAuditLog({
    action: AUDIT_ACTIONS.COMPLIANCE_REVIEW,
    resource: AUDIT_RESOURCES.COMPLIANCE,
    resourceId: accident.id.toString(),
  });

  revalidatePath('/dashboard/compliance/accidents');
  return { success: true, accident };
}

export async function calculateSmsScore(orgId: number) {
  await requirePermission('org:compliance:generate_compliance_req');
  const accidentRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM accident_reports WHERE org_id = ${orgId}
  `);
  const violationRes = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count FROM hos_violations WHERE org_id = ${orgId}
  `);

  const accidents = accidentRes.rows[0]?.count ?? 0;
  const violations = violationRes.rows[0]?.count ?? 0;
  const score = accidents * 2 + violations;

  return { accidents, violations, score };
}
