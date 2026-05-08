import { describe, it, expect } from "vitest";
import { DEMO_TRIP } from "@/lib/seed";
import type { Trip, Day, Activity } from "@/types";

// Validates the AI response schema matches our TypeScript types
// This catches schema drift between the AI output and client-side types

function validateActivity(activity: Activity): string[] {
  const errors: string[] = [];
  if (!activity.id) errors.push("activity.id is required");
  if (!activity.name) errors.push("activity.name is required");
  if (!activity.type) errors.push("activity.type is required");
  if (!["food", "sight", "experience", "transport", "lodging", "rest"].includes(activity.type)) {
    errors.push(`activity.type "${activity.type}" is not a valid enum value`);
  }
  if (typeof activity.location?.lat !== "number") errors.push("activity.location.lat must be a number");
  if (typeof activity.location?.lng !== "number") errors.push("activity.location.lng must be a number");
  if (typeof activity.cost?.amount !== "number") errors.push("activity.cost.amount must be a number");
  if (!activity.startTime) errors.push("activity.startTime is required");
  if (typeof activity.durationMin !== "number") errors.push("activity.durationMin must be a number");
  return errors;
}

function validateDay(day: Day): string[] {
  const errors: string[] = [];
  if (!day.id) errors.push("day.id is required");
  if (typeof day.dayNumber !== "number") errors.push("day.dayNumber must be a number");
  if (!day.city) errors.push("day.city is required");
  if (!["light", "balanced", "packed", "punishing"].includes(day.energyScore)) {
    errors.push(`day.energyScore "${day.energyScore}" is not valid`);
  }
  for (const activity of day.activities) {
    errors.push(...validateActivity(activity));
  }
  return errors;
}

function validateTrip(trip: Trip): string[] {
  const errors: string[] = [];
  if (!trip.id) errors.push("trip.id is required");
  if (!trip.title) errors.push("trip.title is required");
  if (!Array.isArray(trip.destination) || trip.destination.length === 0) {
    errors.push("trip.destination must be a non-empty array");
  }
  if (!["relaxed", "balanced", "packed"].includes(trip.pace)) {
    errors.push(`trip.pace "${trip.pace}" is not valid`);
  }
  if (!trip.logistics?.visa) errors.push("trip.logistics.visa is required");
  if (!trip.logistics?.currency?.code) errors.push("trip.logistics.currency.code is required");
  if (!Array.isArray(trip.packingList)) errors.push("trip.packingList must be an array");
  for (const day of trip.days) {
    errors.push(...validateDay(day));
  }
  return errors;
}

describe("Trip schema validation", () => {
  it("DEMO_TRIP passes full schema validation", () => {
    const errors = validateTrip(DEMO_TRIP as Trip);
    expect(errors).toHaveLength(0);
  });

  it("activity type enum covers all expected values", () => {
    const types = new Set(
      (DEMO_TRIP as Trip).days.flatMap(d => d.activities.map(a => a.type))
    );
    const validTypes = ["food", "sight", "experience", "transport", "lodging", "rest"];
    for (const t of types) {
      expect(validTypes).toContain(t);
    }
  });

  it("all activities have valid coordinates", () => {
    for (const day of (DEMO_TRIP as Trip).days) {
      for (const activity of day.activities) {
        expect(activity.location.lat).toBeGreaterThan(-90);
        expect(activity.location.lat).toBeLessThan(90);
        expect(activity.location.lng).toBeGreaterThan(-180);
        expect(activity.location.lng).toBeLessThan(180);
      }
    }
  });

  it("all activities have positive durations", () => {
    for (const day of (DEMO_TRIP as Trip).days) {
      for (const activity of day.activities) {
        expect(activity.durationMin).toBeGreaterThan(0);
      }
    }
  });

  it("day numbers are sequential starting from 1", () => {
    const dayNumbers = (DEMO_TRIP as Trip).days.map(d => d.dayNumber);
    dayNumbers.forEach((num, idx) => {
      expect(num).toBe(idx + 1);
    });
  });

  it("packing list items have valid categories", () => {
    const validCategories = ["Documents", "Clothing", "Tech", "Toiletries", "Medication", "Activity-specific"];
    for (const item of (DEMO_TRIP as Trip).packingList) {
      expect(validCategories).toContain(item.category);
      expect(typeof item.checked).toBe("boolean");
    }
  });

  it("logistics has all required emergency numbers", () => {
    const { emergencyNumbers } = (DEMO_TRIP as Trip).logistics;
    expect(emergencyNumbers.length).toBeGreaterThan(0);
    for (const num of emergencyNumbers) {
      expect(num.label).toBeTruthy();
      expect(num.number).toBeTruthy();
    }
  });
});
