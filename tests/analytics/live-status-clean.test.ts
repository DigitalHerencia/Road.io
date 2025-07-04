import { describe, it, expect, vi } from "vitest";
vi.mock("../../src/lib/db", () => ({ db: { execute: vi.fn() } }));
vi.mock("../../src/lib/rbac", () => ({ requirePermission: vi.fn() }));

import { db } from "../../src/lib/db";
import {
  fetchLiveFleetStatus,
  fetchPerformanceAlerts,
} from "../../src/lib/fetchers/analytics";

// Patch MockDbResponses.count to provide correct FieldDef structure for tests
function mockCount(count: number) {
  return {
    rows: [{ count }],
    fields: [
      {
        name: "count",
        tableID: 0,
        columnID: 0,
        dataTypeID: 23,
        dataTypeSize: 4,
        dataTypeModifier: -1,
        format: "text",
      },
    ],
    command: "",
    rowCount: 1,
    rowAsArray: false as false,
  };
}

describe("fetchLiveFleetStatus", () => {
  it("returns counts from db", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(3));
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(2));
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(5));

    const res = await fetchLiveFleetStatus(1);
    expect(res.activeLoads).toBe(3);
    expect(res.availableDrivers).toBe(2);
    expect(res.activeVehicles).toBe(5);
  });
});

describe("fetchPerformanceAlerts", () => {
  it("generates alerts based on status", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(4));
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(1));
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(2));

    const alerts = await fetchPerformanceAlerts(1);
    expect(alerts.length).toBeGreaterThan(0);
  });

  it("returns no alerts when fleet is balanced", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(2));
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(2));
    vi.mocked(db.execute).mockResolvedValueOnce(mockCount(2));

    const alerts = await fetchPerformanceAlerts(1);
    expect(alerts.length).toBe(0);
  });
});
