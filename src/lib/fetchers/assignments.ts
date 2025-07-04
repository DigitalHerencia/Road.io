import { db } from '@/lib/db'
import type { AuditLog } from '@/lib/schema'
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { sql } from 'drizzle-orm'

export async function getLoadAssignmentHistory(loadId: number): Promise<AuditLog[]> {
  const res = await db.execute<AuditLog>(sql`
    SELECT 
      id AS id,
      resource AS resource,
      action AS action,
      resource_id AS resourceId,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM audit_logs
    WHERE resource = ${AUDIT_RESOURCES.LOAD}
      AND action = ${AUDIT_ACTIONS.LOAD_ASSIGN}
      AND resource_id = ${loadId}
    ORDER BY createdAt DESC
  `)
  return res.rows
}
