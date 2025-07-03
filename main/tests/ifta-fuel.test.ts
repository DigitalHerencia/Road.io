import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createFuelPurchaseAction,
  importFuelCardCsvAction,
} from "../src/lib/actions/ifta";

vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: () => ({ returning: () => Promise.resolve([{ id: 1 }]) }),
    }),
  },
}));

vi.mock("@/lib/rbac", () => ({
  requirePermission: vi.fn(async () => ({ id: "1", orgId: 1 })),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: {
    FUEL_PURCHASE_CREATE: "fuel.create",
    FUEL_CARD_IMPORT: "fuel.import",
  },
  AUDIT_RESOURCES: { FUEL_PURCHASE: "fuel_purchase" },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("fs", () => ({ promises: { mkdir: vi.fn(), writeFile: vi.fn() } }));

describe("createFuelPurchaseAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates purchase with valid data", async () => {
    const fd = new FormData();
    fd.set("driverId", "1");
    fd.set("vehicleId", "1");
    fd.set("purchaseDate", "2024-01-01");
    fd.set("quantity", "50");
    fd.set("pricePerUnit", "300");
    fd.set("vendor", "Shell");
    fd.set("state", "TX");
    fd.set("taxStatus", "PAID");
    fd.set("paymentMethod", "CARD");
    await expect(createFuelPurchaseAction(fd)).resolves.toBeUndefined();
  });

  it("fails with invalid data", async () => {
    const fd = new FormData();
    fd.set("driverId", "a");
    await expect(createFuelPurchaseAction(fd)).rejects.toThrow();
  });
});

describe("importFuelCardCsvAction", () => {
  it("imports rows from csv", async () => {
    const fd = new FormData();
    const csv =
      "purchaseDate,driverId,vehicleId,quantity,pricePerUnit,vendor,state,taxStatus,paymentMethod\n2024-01-01,1,1,10,300,Shell,TX,PAID,CARD";
    fd.set("csv", new File([csv], "test.csv", { type: "text/csv" }));
    await expect(importFuelCardCsvAction(fd)).resolves.toBeUndefined();
  });
});
