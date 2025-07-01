import { db } from '@/lib/db'
import type { AuditLog } from '@/lib/schema'
import { AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit'
import { sql } from 'drizzle-orm'

export async function getLoadAssignmentHistory(loadId: number): Promise<AuditLog[]> {
  const res = await db.execute<AuditLog>(sql`
    SELECT * FROM audit_logs
    WHERE resource = ${AUDIT_RESOURCES.LOAD}
      AND action = ${AUDIT_ACTIONS.LOAD_ASSIGN}
      AND resource_id = ${loadId}
    ORDER BY created_at DESC
  `)
  return res.rows
}
