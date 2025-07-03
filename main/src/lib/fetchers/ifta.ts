import { db } from "@/lib/db";
import { trips, fuelPurchases, iftaTaxRates, documents, iftaAuditResponses } from "@/lib/schema";
import { eq, between, and, sql } from "drizzle-orm";

export async function getTripsByOrg(orgId: number) {
  return await db.select().from(trips).where(eq(trips.orgId, orgId));
}

export async function getFuelPurchasesByOrg(orgId: number) {
  return await db
    .select()
    .from(fuelPurchases)
    .where(eq(fuelPurchases.orgId, orgId));
}

export async function getTripsForPeriod(
  orgId: number,
  start: Date,
  end: Date,
) {
  return await db
    .select()
    .from(trips)
    .where(
      and(eq(trips.orgId, orgId), between(trips.startedAt, start, end)),
    );
}

export async function getFuelPurchasesForPeriod(
  orgId: number,
  start: Date,
  end: Date,
) {
  return await db
    .select()
    .from(fuelPurchases)
    .where(
      and(
        eq(fuelPurchases.orgId, orgId),
        between(fuelPurchases.purchaseDate, start, end),
      ),
    );
}

export async function getTaxRatesByQuarter(quarter: string) {
  return await db
    .select()
    .from(iftaTaxRates)
    .where(eq(iftaTaxRates.quarter, quarter));
}

export async function getIftaDocuments(orgId: number) {
  return await db
    .select()
    .from(documents)
    .where(and(eq(documents.orgId, orgId), eq(documents.documentType, 'ifta')));
}

export async function listIftaAuditResponses(orgId: number) {
  return await db
    .select()
    .from(iftaAuditResponses)
    .where(eq(iftaAuditResponses.orgId, orgId));
}

export interface IftaOverview {
  totalTrips: number;
  totalFuel: number;
  totalCost: number;
  reports: number;
}

export async function getIftaOverview(orgId: number): Promise<IftaOverview> {
  const [tripsRes, fuelRes, costRes, reportRes] = await Promise.all([
    db.execute<{ count: number }>(
      sql`SELECT count(*)::int AS count FROM trips WHERE org_id = ${orgId}`,
    ),
    db.execute<{ gallons: number }>(
      sql`SELECT coalesce(sum(quantity),0)::int AS gallons FROM fuel_purchases WHERE org_id = ${orgId}`,
    ),
    db.execute<{ cost: number }>(
      sql`SELECT coalesce(sum(total_cost),0)::int AS cost FROM fuel_purchases WHERE org_id = ${orgId}`,
    ),
    db.execute<{ count: number }>(
      sql`SELECT count(*)::int AS count FROM ifta_reports WHERE org_id = ${orgId}`,
    ),
  ]);

  return {
    totalTrips: tripsRes.rows[0]?.count ?? 0,
    totalFuel: fuelRes.rows[0]?.gallons ?? 0,
    totalCost: costRes.rows[0]?.cost ?? 0,
    reports: reportRes.rows[0]?.count ?? 0,
  };
}
