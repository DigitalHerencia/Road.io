import { describe, it, expect, vi, beforeEach } from "vitest";
import { recordHosLog } from "../hos";

vi.mock("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([{ id: 1, driverId: 1, orgId: 1 }]),
      }),
    }),
    select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
  },
}));

vi.mock("@/lib/rbac", () => ({
  requirePermission: vi.fn(async () => ({ id: "1", orgId: 1 })),
}));

vi.mock("@/lib/audit", () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: {
    HOS_LOG_CREATE: "hos.log.create",
    HOS_VIOLATION: "hos.violation",
  },
  AUDIT_RESOURCES: { COMPLIANCE: "compliance" },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("recordHosLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates log with valid data", async () => {
    const data = new FormData();
    data.set("driverId", "1");
    data.set("status", "DRIVING");
    data.set("startTime", new Date().toISOString());
    const result = await recordHosLog(data);
    expect(result.success).toBe(true);
  });

  it("fails with invalid data", async () => {
    const data = new FormData();
    data.set("driverId", "1");
    await expect(recordHosLog(data)).rejects.toThrow();
  });
});
