'use server';

import { db } from '@/lib/db';
import { documents } from '@/lib/schema';
import { AUDIT_ACTIONS, AUDIT_RESOURCES, createAuditLog } from '@/lib/audit';
import { requirePermission } from '@/lib/rbac';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

export const uploadFormSchema = z.object({
  category: z.enum(['driver', 'safety']),
  driverId: z.string().optional(),
});

export function generateUniqueFilename(original: string): string {
  const ext = path.extname(original);
  const base = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}${ext}`;
}

export async function uploadDocumentsAction(formData: FormData) {
  const user = await requirePermission('org:compliance:upload_documents');

  const { category, driverId } = uploadFormSchema.parse({
    category: formData.get('category'),
    driverId: formData.get('driverId')?.toString(),
  });

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
