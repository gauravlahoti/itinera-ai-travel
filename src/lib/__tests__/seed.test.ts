import { describe, it, expect } from "vitest";
import { DEMO_TRIP } from "@/lib/seed";

describe("DEMO_TRIP data integrity", () => {
  it("has required top-level fields", () => {
    expect(DEMO_TRIP.id).toBeTruthy();
    expect(DEMO_TRIP.title).toBeTruthy();
    expect(Array.isArray(DEMO_TRIP.destination)).toBe(true);
    expect(Array.isArray(DEMO_TRIP.days)).toBe(true);
    expect(Array.isArray(DEMO_TRIP.packingList)).toBe(true);
  });

  it("has at least one day", () => {
    expect(DEMO_TRIP.days.length).toBeGreaterThan(0);
  });

  it("each day has required fields", () => {
    for (const day of DEMO_TRIP.days) {
      expect(day.id).toBeTruthy();
      expect(typeof day.dayNumber).toBe("number");
      expect(Array.isArray(day.activities)).toBe(true);
    }
  });

  it("each activity has location coordinates", () => {
    for (const day of DEMO_TRIP.days) {
      for (const activity of day.activities) {
        expect(typeof activity.location.lat).toBe("number");
        expect(typeof activity.location.lng).toBe("number");
      }
    }
  });

  it("pace is a valid value", () => {
    expect(["relaxed", "balanced", "packed"]).toContain(DEMO_TRIP.pace);
  });

  it("budget has total and currency", () => {
    expect(typeof DEMO_TRIP.budget.total).toBe("number");
    expect(typeof DEMO_TRIP.budget.currency).toBe("string");
  });
});
