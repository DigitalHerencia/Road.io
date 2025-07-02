import { db } from "@/lib/db";
import { trips, fuelPurchases, iftaTaxRates } from "@/lib/schema";
import { eq, between, and } from "drizzle-orm";

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
