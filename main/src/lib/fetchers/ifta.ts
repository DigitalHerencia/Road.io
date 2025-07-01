import { db } from "@/lib/db";
import { trips, fuelPurchases } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getTripsByOrg(orgId: number) {
  return await db.select().from(trips).where(eq(trips.orgId, orgId));
}

export async function getFuelPurchasesByOrg(orgId: number) {
  return await db
    .select()
    .from(fuelPurchases)
    .where(eq(fuelPurchases.orgId, orgId));
}
