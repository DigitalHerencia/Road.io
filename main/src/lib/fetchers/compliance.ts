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

export async function listAnnualReviews(orgId: number, driverId?: number) {
  await requirePermission('org:compliance:upload_review_compliance');
  const where = driverId ? sql`AND driver_id = ${driverId}` : sql``;
  const res = await db.execute(sql`
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
