import { db } from '@/lib/db';
import type { Document } from '@/lib/schema';
import { requirePermission } from '@/lib/rbac';
import { sql } from 'drizzle-orm';

export async function searchDocuments(orgId: number, query: string): Promise<Document[]> {
  await requirePermission('org:compliance:upload_documents');
  const term = `%${query}%`;
  const res = await db.execute<Document>(sql`
    SELECT * FROM documents
    WHERE org_id = ${orgId} AND file_name ILIKE ${term}
    ORDER BY created_at DESC
  `);
  return res.rows;
}
