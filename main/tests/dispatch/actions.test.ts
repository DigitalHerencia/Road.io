import { describe, it, expect, vi } from "vitest";
import {
  getDispatchKPIsAction,
  getExceptionRateAction,
  planRouteAction,
  updateDriverLocationAction,
  checkGeofenceAction,
} from "@/lib/actions/dispatch";
import * as fetchers from "@/lib/fetchers/dispatch";

vi.mock("@/lib/fetchers/dispatch");

describe("dispatch actions validation", () => {
  it("parses orgId before calling fetchers", async () => {
    vi.mocked(fetchers.fetchDispatchKPIs).mockResolvedValue({ loads: 1 });
    await getDispatchKPIsAction({ orgId: 1 });
    expect(fetchers.fetchDispatchKPIs).toHaveBeenCalledWith(1);
  });

  it("throws on invalid orgId", async () => {
    await expect(
      getExceptionRateAction({ orgId: -1 } as any),
    ).rejects.toThrow();
  });
});

describe("route planning actions", () => {
  it("calls calculateOptimalRoute with parsed data", async () => {
    vi.mocked(fetchers.calculateOptimalRoute).mockResolvedValue({
      orderedStops: [],
      totalDistance: 0,
    });
    await planRouteAction({
      start: { lat: 0, lng: 0 },
      end: { lat: 1, lng: 1 },
      stops: [],
    });
    expect(fetchers.calculateOptimalRoute).toHaveBeenCalled();
  });

  it("updates driver location", async () => {
    vi.mocked(fetchers.updateDriverLocation).mockResolvedValue(
      undefined as any,
    );
    await updateDriverLocationAction({
      driverId: 1,
      location: { lat: 0, lng: 0 },
    });
    expect(fetchers.updateDriverLocation).toHaveBeenCalledWith(1, {
      lat: 0,
      lng: 0,
    });
  });

  it("checks geofence status", async () => {
    vi.mocked(fetchers.isWithinGeofence).mockReturnValue(true);
    const res = await checkGeofenceAction({
      location: { lat: 0, lng: 0 },
      fence: { center: { lat: 0, lng: 0 }, radius: 1 },
    });
    expect(res.inside).toBe(true);
    expect(fetchers.isWithinGeofence).toHaveBeenCalled();
  });
});
