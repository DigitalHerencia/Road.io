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

export async function getExpiringDocuments(orgId: number, withinDays = 30): Promise<Document[]> {
  await requirePermission('org:compliance:upload_documents');
  const res = await db.execute<Document>(sql`
    SELECT * FROM documents
    WHERE org_id = ${orgId}
      AND expires_at IS NOT NULL
      AND expires_at <= now() + (${withinDays} * interval '1 day')
      AND expires_at >= now()
    ORDER BY expires_at ASC
  `);
  return res.rows;
}

export interface DocumentStatusCounts {
  active: number;
  underReview: number;
}

export async function getDocumentStatusCounts(orgId: number): Promise<DocumentStatusCounts> {
  await requirePermission('org:compliance:upload_documents');
  const res = await db.execute<{ reviewed: boolean; compliant: boolean; count: number }>(sql`
    SELECT
      (reviewed_by_id IS NOT NULL) AS reviewed,
      is_compliant AS compliant,
      count(*)::int AS count
    FROM documents
    WHERE org_id = ${orgId}
    GROUP BY reviewed, compliant
  `);
  let active = 0;
  let underReview = 0;
  for (const row of res.rows) {
    if (row.reviewed && row.compliant) {
      active += row.count;
    } else if (!row.reviewed) {
      underReview += row.count;
    }
  }
  return { active, underReview };
}

export interface DocumentTrend {
  month: string;
  uploads: number;
}

export async function getDocumentTrends(orgId: number, months = 6): Promise<DocumentTrend[]> {
  await requirePermission('org:compliance:upload_documents');
  const res = await db.execute<{ month: string; count: number }>(sql`
    SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
           count(*)::int AS count
    FROM documents
    WHERE org_id = ${orgId}
      AND created_at >= date_trunc('month', now()) - (${months} * interval '1 month')
    GROUP BY month
    ORDER BY month
  `);
  return res.rows.map(r => ({ month: r.month, uploads: r.count }));
}
