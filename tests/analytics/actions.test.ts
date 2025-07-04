import { describe, it, expect, vi } from "vitest";
import {
  getLiveFleetStatusAction,
  getPerformanceAlertsAction,
} from "@/lib/actions/analytics";
import * as fetchers from "@/lib/fetchers/analytics";

vi.mock("@/lib/fetchers/analytics");

describe("analytics actions", () => {
  it("gets live fleet status", async () => {
    vi.mocked(fetchers.fetchLiveFleetStatus).mockResolvedValue({
      activeLoads: 1,
      availableDrivers: 2,
      activeVehicles: 1,
    });
    const result = await getLiveFleetStatusAction({ orgId: 1 });
    expect(result.activeLoads).toBe(1);
    expect(fetchers.fetchLiveFleetStatus).toHaveBeenCalledWith(1);
  });

  it("gets performance alerts", async () => {
    vi.mocked(fetchers.fetchPerformanceAlerts).mockResolvedValue([]);
    const res = await getPerformanceAlertsAction({ orgId: 1 });
    expect(Array.isArray(res)).toBe(true);
    expect(fetchers.fetchPerformanceAlerts).toHaveBeenCalledWith(1);
  });

  it("validates orgId", async () => {
    await expect(getLiveFleetStatusAction({ orgId: 0 } as any)).rejects.toThrow();
  });
});
