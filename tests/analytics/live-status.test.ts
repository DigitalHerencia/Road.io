import { describe, it, expect, vi } from "vitest";
vi.mock("../../src/lib/db", () => ({ db: { execute: vi.fn() } }));
vi.mock("../../src/lib/rbac", () => ({ requirePermission: vi.fn() }));

import { db } from "../../src/lib/db";
import {
  fetchLiveFleetStatus,
  fetchPerformanceAlerts,
} from "../../src/lib/fetchers/analytics";


describe("fetchLiveFleetStatus", () => {
  it("returns counts from db", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 3 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 2 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 5 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    const res = await fetchLiveFleetStatus(1);
    expect(res.activeLoads).toBe(3);
    expect(res.availableDrivers).toBe(2);
    expect(res.activeVehicles).toBe(5);
  });
});

describe("fetchPerformanceAlerts", () => {
  it("generates alerts based on status", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 4 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 1 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 2 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    const alerts = await fetchPerformanceAlerts(1);
    expect(alerts.length).toBeGreaterThan(0);
  });

  it("returns no alerts when fleet is balanced", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 2 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 2 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ count: 2 }],
      fields: [],
      command: "",
      rowCount: 1,
      rowAsArray: false,
    });
    const alerts = await fetchPerformanceAlerts(1);
    expect(alerts.length).toBe(0);
  });
});
