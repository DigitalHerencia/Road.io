import { describe, it, expect, vi } from "vitest";
vi.mock("../../src/lib/db", () => ({ db: { execute: vi.fn() } }));
import { db } from "../../src/lib/db";
import {
  getLatestTelematics,
  listVehicleDocuments,
} from "../../src/lib/fetchers/vehicles";

describe("getLatestTelematics", () => {
  it("returns record", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          vehicleId: 2,
          recordedAt: new Date(),
          location: { lat: 1, lng: 2 },
          odometer: 1000,
          engineHours: 50,
          data: null,
        },
      ],
    } as any);
    const res = await getLatestTelematics(2);
    expect(res?.vehicleId).toBe(2);
  });
});

describe("listVehicleDocuments", () => {
  it("returns docs", async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{ id: 1, fileUrl: "/a", fileName: "a", vehicleId: 2 }],
    } as any);
    const docs = await listVehicleDocuments(2);
    expect(docs).toHaveLength(1);
  });
});
