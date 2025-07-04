import { db } from '@/lib/db'
import {
  drivers,
  users,
  driverViolations,
  driverCertifications,
  performanceReviews,
  safetyPrograms,
  driverSafetyPrograms,
  driverMessages,
} from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { DriverProfile } from '@/features/drivers/types'
import { requirePermission } from '@/lib/rbac'

export async function getAllDrivers(): Promise<DriverProfile[]> {
  const rows = await db
    .select({
      id: drivers.id,
      userId: drivers.userId,
      name: users.name,
      email: users.email,
      licenseNumber: drivers.licenseNumber,
      licenseClass: drivers.licenseClass,
      endorsements: drivers.endorsements,
      licenseExpiry: drivers.licenseExpiry,
      dotNumber: drivers.dotNumber,
      status: drivers.status,
      isAvailable: drivers.isAvailable,
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id));

  return rows;
}

export async function getDriverById(id: number): Promise<DriverProfile | undefined> {
  const [row] = await db
    .select({
      id: drivers.id,
      userId: drivers.userId,
      name: users.name,
      email: users.email,
      licenseNumber: drivers.licenseNumber,
      licenseClass: drivers.licenseClass,
      endorsements: drivers.endorsements,
      licenseExpiry: drivers.licenseExpiry,
      dotNumber: drivers.dotNumber,
      status: drivers.status,
      isAvailable: drivers.isAvailable,
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(eq(drivers.id, id));

  return row;
}

export async function getAvailableDrivers(): Promise<DriverProfile[]> {
  return db
    .select({
      id: drivers.id,
      userId: drivers.userId,
      name: users.name,
      email: users.email,
      licenseNumber: drivers.licenseNumber,
      licenseClass: drivers.licenseClass,
      endorsements: drivers.endorsements,
      licenseExpiry: drivers.licenseExpiry,
      dotNumber: drivers.dotNumber,
      status: drivers.status,
      isAvailable: drivers.isAvailable,
      createdAt: drivers.createdAt,
      updatedAt: drivers.updatedAt,
    })
    .from(drivers)
    .innerJoin(users, eq(drivers.userId, users.id))
    .where(eq(drivers.status, 'AVAILABLE'));
}

export interface DriverAssignmentStats {
  current: number;
  completed: number;
  completionRate: number;
}

export async function getDriverAssignmentStats(
  driverId: number,
): Promise<DriverAssignmentStats> {
  const result = await db.execute<{ current: number; completed: number }>(sql`
    SELECT
      count(*) FILTER (WHERE status NOT IN ('delivered','cancelled'))::int AS current,
      count(*) FILTER (WHERE status = 'delivered')::int AS completed
    FROM loads
    WHERE assigned_driver_id = ${driverId}
  `);

  const current = result.rows[0]?.current ?? 0;
  const completed = result.rows[0]?.completed ?? 0;
  const total = current + completed;

  return {
    current,
    completed,
    completionRate: total === 0 ? 0 : Number((completed / total).toFixed(2)),
  };
}

export interface DriverMessage {
  id: number
  driverId: number
  sender: 'DRIVER' | 'DISPATCH'
  message: string
  createdAt: Date
}

export async function fetchDriverMessages(
  driverId: number,
  limit = 50,
): Promise<DriverMessage[]> {
  return db
    .select({
      id: driverMessages.id,
      driverId: driverMessages.driverId,
      sender: driverMessages.sender,
      message: driverMessages.message,
      createdAt: driverMessages.createdAt,
    })
    .from(driverMessages)
    .where(eq(driverMessages.driverId, driverId))
    .orderBy(sql`${driverMessages.createdAt} desc`)
    .limit(limit)
}

export async function createDriverMessage(params: {
  orgId: number
  driverId: number
  sender: 'DRIVER' | 'DISPATCH'
  message: string
}): Promise<DriverMessage> {
  const [msg] = await db
    .insert(driverMessages)
    .values({
      orgId: params.orgId,
      driverId: params.driverId,
      sender: params.sender,
      message: params.message,
    })
    .returning()
  return msg
}

export async function getDriverViolations(driverId: number) {
  return db
    .select()
    .from(driverViolations)
    .where(eq(driverViolations.driverId, driverId))
    .orderBy(sql`${driverViolations.occurredAt} desc`)
}

export async function getDriverCertifications(driverId: number) {
  return db
    .select()
    .from(driverCertifications)
    .where(eq(driverCertifications.driverId, driverId))
    .orderBy(sql`${driverCertifications.issuedAt} desc`)
}

export interface DriverPerformanceMetrics {
  totalMiles: number
  fuelEfficiency: number
  accidentCount: number
  violationCount: number
  completionRate: number
}

export async function getDriverPerformanceMetrics(
  driverId: number,
): Promise<DriverPerformanceMetrics> {
  const [milesRes, fuelRes, accidentsRes, violationsRes, stats] = await Promise.all([
    db.execute<{ sum: number }>(sql`SELECT coalesce(sum(distance),0)::int AS sum FROM trips WHERE driver_id = ${driverId}`),
    db.execute<{ sum: number }>(sql`SELECT coalesce(sum(quantity),0)::int AS sum FROM fuel_purchases WHERE driver_id = ${driverId}`),
    db.execute<{ count: number }>(sql`SELECT count(*)::int AS count FROM accident_reports WHERE driver_id = ${driverId}`),
    db.execute<{ count: number }>(sql`SELECT count(*)::int AS count FROM driver_violations WHERE driver_id = ${driverId}`),
    getDriverAssignmentStats(driverId),
  ])

  const miles = milesRes.rows[0]?.sum ?? 0
  const gallons = fuelRes.rows[0]?.sum ?? 0
  const fuelEfficiency = gallons === 0 ? 0 : Number((miles / gallons).toFixed(2))

  return {
    totalMiles: miles,
    fuelEfficiency,
    accidentCount: accidentsRes.rows[0]?.count ?? 0,
    violationCount: violationsRes.rows[0]?.count ?? 0,
    completionRate: stats.completionRate,
  }
}

export async function getDriverPerformanceReviews(driverId: number) {
  return db
    .select()
    .from(performanceReviews)
    .where(eq(performanceReviews.driverId, driverId))
    .orderBy(sql`${performanceReviews.reviewDate} desc`)
}

export async function listSafetyPrograms(orgId: number) {
  return db
    .select()
    .from(safetyPrograms)
    .where(eq(safetyPrograms.orgId, orgId))
}

export async function getDriverSafetyPrograms(driverId: number) {
  return db
    .select({
      id: driverSafetyPrograms.id,
      status: driverSafetyPrograms.status,
      assignedAt: driverSafetyPrograms.assignedAt,
      completedAt: driverSafetyPrograms.completedAt,
      title: safetyPrograms.title,
    })
    .from(driverSafetyPrograms)
    .innerJoin(safetyPrograms, eq(driverSafetyPrograms.programId, safetyPrograms.id))
    .where(eq(driverSafetyPrograms.driverId, driverId))
}

export async function getTrainingRecommendations(driverId: number) {
  const metrics = await getDriverPerformanceMetrics(driverId)
  const recs: string[] = []
  if (metrics.violationCount > 0 || metrics.accidentCount > 0) {
    recs.push('Safety Refresher Course')
  }
  if (metrics.completionRate < 0.9) {
    recs.push('Efficiency Training')
  }
  return recs
}

export interface DriverDashboardStats {
  totalDrivers: number
  availableDrivers: number
  onDutyDrivers: number
  scheduledLoads: number
  upcomingTrainings: number
  pendingComplianceTasks: number
  recentPayStatements: number
}

export async function getDriverDashboardStats(
  orgId: number,
): Promise<DriverDashboardStats> {
  await requirePermission('org:admin:access_all_reports')

  const [driverCounts, loadsRes, trainingRes, tasksRes, payrollRes] =
    await Promise.all([
      db.execute<{ total: number; available: number; on_duty: number }>(sql`
        SELECT
          count(*)::int AS total,
          count(*) FILTER (WHERE d.status = 'AVAILABLE')::int AS available,
          count(*) FILTER (WHERE d.status = 'ON_DUTY')::int AS on_duty
        FROM drivers d
        JOIN users u ON d.user_id = u.id
        WHERE u.org_id = ${orgId}
      `),
      db.execute<{ count: number }>(sql`
        SELECT count(*)::int AS count
        FROM loads l
        WHERE l.org_id = ${orgId}
          AND l.assigned_driver_id IS NOT NULL
          AND l.status NOT IN ('delivered','cancelled')
          AND (l.pickup_location->>'datetime')::timestamp >= now()
      `),
      db.execute<{ count: number }>(sql`
        SELECT count(*)::int AS count
        FROM driver_trainings
        WHERE org_id = ${orgId}
          AND status = 'ASSIGNED'
          AND scheduled_at >= now()
      `),
      db.execute<{ count: number }>(sql`
        SELECT count(*)::int AS count
        FROM compliance_tasks ct
        JOIN compliance_workflows w ON ct.workflow_id = w.id
        WHERE w.org_id = ${orgId}
          AND ct.status = 'PENDING'
      `),
      db.execute<{ count: number }>(sql`
        SELECT count(*)::int AS count
        FROM pay_statements
        WHERE org_id = ${orgId}
          AND created_at >= now() - interval '30 days'
      `),
    ])

  return {
    totalDrivers: driverCounts.rows[0]?.total ?? 0,
    availableDrivers: driverCounts.rows[0]?.available ?? 0,
    onDutyDrivers: driverCounts.rows[0]?.on_duty ?? 0,
    scheduledLoads: loadsRes.rows[0]?.count ?? 0,
    upcomingTrainings: trainingRes.rows[0]?.count ?? 0,
    pendingComplianceTasks: tasksRes.rows[0]?.count ?? 0,
    recentPayStatements: payrollRes.rows[0]?.count ?? 0,
  }
}
