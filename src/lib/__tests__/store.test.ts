import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/store";
import { DEMO_TRIP } from "@/lib/seed";
import type { Trip } from "@/types";

describe("Zustand app store", () => {
  beforeEach(() => {
    // Reset store state between tests
    useAppStore.setState({ currentTrip: null });
  });

  it("initializes with null currentTrip", () => {
    const state = useAppStore.getState();
    expect(state.currentTrip).toBeNull();
  });

  it("setCurrentTrip stores a trip", () => {
    useAppStore.getState().setCurrentTrip(DEMO_TRIP as Trip);
    expect(useAppStore.getState().currentTrip?.id).toBe("demo-tokyo-2024");
  });

  it("setCurrentTrip replaces previous trip", () => {
    useAppStore.getState().setCurrentTrip(DEMO_TRIP as Trip);
    const newTrip = { ...DEMO_TRIP, id: "new-trip", title: "New Trip" } as Trip;
    useAppStore.getState().setCurrentTrip(newTrip);
    expect(useAppStore.getState().currentTrip?.id).toBe("new-trip");
  });

  it("setCurrentTrip replaces to a different trip clears old data", () => {
    useAppStore.getState().setCurrentTrip(DEMO_TRIP as Trip);
    const empty = { ...DEMO_TRIP, id: "empty", title: "Empty", days: [] } as Trip;
    useAppStore.getState().setCurrentTrip(empty);
    expect(useAppStore.getState().currentTrip?.days).toHaveLength(0);
  });

  it("reorderActivities changes activity order within a day", () => {
    useAppStore.getState().setCurrentTrip(DEMO_TRIP as Trip);
    const trip = useAppStore.getState().currentTrip!;
    const day = trip.days[0];
    if (day.activities.length >= 2) {
      const firstId = day.activities[0].id;
      const secondId = day.activities[1].id;
      useAppStore.getState().reorderActivities(day.id, firstId, secondId);
      const updatedDay = useAppStore.getState().currentTrip!.days[0];
      expect(updatedDay.activities[0].id).toBe(secondId);
    }
  });

  it("reorderActivities is a no-op if day not found", () => {
    useAppStore.getState().setCurrentTrip(DEMO_TRIP as Trip);
    const before = JSON.stringify(useAppStore.getState().currentTrip);
    useAppStore.getState().reorderActivities("nonexistent-day", "a", "b");
    const after = JSON.stringify(useAppStore.getState().currentTrip);
    expect(before).toBe(after);
  });
});
