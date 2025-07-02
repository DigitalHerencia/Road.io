import { db } from "@/lib/db";
import { trips, fuelPurchases, iftaTaxRates, documents, iftaAuditResponses } from "@/lib/schema";
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
