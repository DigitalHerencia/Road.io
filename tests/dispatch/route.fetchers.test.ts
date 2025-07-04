import { describe, it, expect } from "vitest";
import {
  haversineDistance,
  calculateOptimalRoute,
  isWithinGeofence,
} from "@/lib/fetchers/dispatch";

describe("route utilities", () => {
  it("computes haversine distance", () => {
    const d = haversineDistance({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(d).toBeGreaterThan(60);
  });

  it("optimizes route order", async () => {
    const res = await calculateOptimalRoute(
      { lat: 0, lng: 0 },
      { lat: 0, lng: 2 },
      [{ lat: 0, lng: 1 }],
    );
    expect(res.orderedStops.length).toBe(1);
    expect(res.totalDistance).toBeGreaterThan(120);
  });

  it("checks geofence containment", () => {
    const inside = isWithinGeofence(
      { lat: 0, lng: 0 },
      { center: { lat: 0, lng: 0 }, radius: 1 },
    );
    expect(inside).toBe(true);
  });
});
