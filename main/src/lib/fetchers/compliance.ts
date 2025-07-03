import { db } from '@/lib/db';
import type { Document, AuditLog } from '@/lib/schema';
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

export async function getExpiringDocuments(orgId: number, withinDays = 30): Promise<(Document & { email: string })[]> {
  await requirePermission('org:compliance:upload_documents');
  const res = await db.execute<Document & { email: string }>(sql`
    SELECT d.*, u.email 
    FROM documents d
    JOIN users u ON d.uploaded_by_id = u.id
    WHERE d.org_id = ${orgId}
      AND d.expires_at IS NOT NULL
      AND d.expires_at <= now() + (${withinDays} * interval '1 day')
      AND d.expires_at >= now()
    ORDER BY d.expires_at ASC
  `);
  return res.rows;
}

export interface DocumentStatusCounts {
  active: number;
  underReview: number;
}

export async function getDocumentStatusCounts(orgId: number, category?: string): Promise<DocumentStatusCounts> {
  await requirePermission('org:compliance:upload_documents');
  const where = category ? sql`AND document_type = ${category}` : sql``;
  const res = await db.execute<{ reviewed: boolean; compliant: boolean; count: number }>(sql`
    SELECT
      (reviewed_by_id IS NOT NULL) AS reviewed,
      is_compliant AS compliant,
      count(*)::int AS count
    FROM documents
    WHERE org_id = ${orgId} ${where}
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

export async function listAnnualReviews(orgId: number, driverId?: number) {
  await requirePermission('org:compliance:upload_review_compliance');
  const where = driverId ? sql`AND driver_id = ${driverId}` : sql``;
  const res = await db.execute<DriverAnnualReview>(sql`
    SELECT * FROM driver_annual_reviews
    WHERE org_id = ${orgId} ${where}
    ORDER BY review_date DESC
  `);
  return res.rows;
}

export async function listVehicleInspections(orgId: number, vehicleId?: number) {
  await requirePermission('org:compliance:upload_review_compliance');
  const where = vehicleId ? sql`AND vehicle_id = ${vehicleId}` : sql``;
  const res = await db.execute(sql`
    SELECT * FROM vehicle_inspections
    WHERE org_id = ${orgId} ${where}
    ORDER BY inspection_date DESC
  `);
  return res.rows;
}

export async function listAccidentReports(orgId: number) {
  await requirePermission('org:compliance:upload_review_compliance');
  const res = await db.execute(sql`
    SELECT * FROM accident_reports
    WHERE org_id = ${orgId}
    ORDER BY occurred_at DESC
  `);
  return res.rows;
}

export async function listComplianceAuditLogs(orgId: number, limit = 10): Promise<AuditLog[]> {
  await requirePermission('org:compliance:access_audit_logs')
  const res = await db.execute(sql`
    SELECT id, action, resource, resource_id AS "resourceId", details,
           created_at AS "createdAt"
    FROM audit_logs
    WHERE org_id = ${orgId}
      AND resource IN ('document', 'compliance')
    ORDER BY created_at DESC
    LIMIT ${limit}
  `)
  return res.rows
}

type ComplianceReportData = {
  status: DocumentStatusCounts
  annualReviews: number
  vehicleInspections: number
  accidents: number
}

export async function getComplianceReportData(orgId: number, category?: string): Promise<ComplianceReportData> {
  await requirePermission('org:compliance:generate_compliance_req')
  const [status, annual, inspections, accidents] = await Promise.all([
    getDocumentStatusCounts(orgId, category),
    db.execute<{ count: number }>(sql`
      SELECT count(*)::int AS count FROM driver_annual_reviews WHERE org_id = ${orgId}
    `),
    db.execute<{ count: number }>(sql`
      SELECT count(*)::int AS count FROM vehicle_inspections WHERE org_id = ${orgId}
    `),
    db.execute<{ count: number }>(sql`
      SELECT count(*)::int AS count FROM accident_reports WHERE org_id = ${orgId}
    `)
  ])
  return {
    status,
    annualReviews: annual.rows[0]?.count ?? 0,
    vehicleInspections: inspections.rows[0]?.count ?? 0,
    accidents: accidents.rows[0]?.count ?? 0
  }
}
