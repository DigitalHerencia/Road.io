import { describe, it, expect, vi } from "vitest";
import {
  updateTenantConfigAction,
  verifyTenantIsolationAction,
} from "../../src/lib/actions/admin";

vi.mock("../../src/lib/db", () => ({
  db: {
    execute: vi.fn(),
    select: vi.fn(() => ({ where: vi.fn(() => ({})) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
  },
}));
vi.mock("../../src/lib/rbac", () => ({
  requireRole: vi.fn(async () => ({ id: "1", orgId: 1 })),
  requirePermission: vi.fn(async () => ({ id: "1", orgId: 1 })),
}));
vi.mock("../../src/lib/audit", () => ({
  createAuditLog: vi.fn(),
  AUDIT_ACTIONS: { ORG_SETTINGS_UPDATE: "org.update" },
  AUDIT_RESOURCES: { ORGANIZATION: "org" },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const mockedDb = require("../../src/lib/db").db;

describe("verifyTenantIsolationAction", () => {
  it("returns isolation results", async () => {
    vi.mocked(mockedDb.execute).mockResolvedValueOnce({
      rows: [{ count: 0 }],
    } as any);
    const res = await verifyTenantIsolationAction();
    expect(res.success).toBe(true);
    expect(res.crossOrgLoadAssignments).toBe(0);
  });
});

describe("updateTenantConfigAction", () => {
  it("updates settings", async () => {
    const form = new FormData();
    form.set("dataRetentionDays", "30");
    vi.mocked(mockedDb.select).mockReturnValueOnce({
      where: vi.fn(() => Promise.resolve([{ settings: {} }])),
    } as any);
    const result = await updateTenantConfigAction(form);
    expect(result.success).toBe(true);
  });
});

describe("checkTenantIsolation", () => {
  it("counts cross org assignments", async () => {
    vi.mocked(mockedDb.execute).mockResolvedValueOnce({
      rows: [{ count: 2 }],
    } as any);
    const { checkTenantIsolation } = await import(
      "../../src/lib/fetchers/admin"
    );
    const res = await checkTenantIsolation(1);
    expect(res.crossOrgLoadAssignments).toBe(2);
  });
});
