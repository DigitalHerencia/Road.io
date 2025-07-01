import { describe, it, expect, vi, beforeEach } from "vitest";
import { createVehicleAction } from "../fleet";
import type { VehicleInput } from "../../validation/vehicle";

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
  AUDIT_ACTIONS: { VEHICLE_CREATE: "vehicle.create" },
  AUDIT_RESOURCES: { VEHICLE: "vehicle" },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const validVehicle = {
  vin: "1HGBH41JXMN109186",
  licensePlate: "ABC123",
  make: "Ford",
  model: "F-150",
  year: 2020,
};

describe("createVehicleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates vehicle when data is valid", async () => {
    const result = await createVehicleAction(validVehicle);
    expect(result.success).toBe(true);
  });

  it("fails with invalid data", async () => {
    const invalid: VehicleInput = {
      ...validVehicle,
      year: 1800,
    } as VehicleInput;
    const result = await createVehicleAction(invalid);
    expect(result.success).toBe(false);
  });
});
