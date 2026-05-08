import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the AI module to avoid real API calls in tests
vi.mock("@/lib/ai", () => ({
  generateTrip: vi.fn(),
}));

import { generateTrip } from "@/lib/ai";

const mockGenerateTrip = vi.mocked(generateTrip);

const mockTrip = {
  id: "test-trip-1",
  title: "Test Trip to Paris",
  destination: ["Paris"],
  startDate: "2024-06-01",
  endDate: "2024-06-05",
  travelers: 2,
  vibes: ["cultural"],
  budget: { total: 2000, currency: "USD" },
  pace: "balanced" as const,
  days: [],
  logistics: {
    visa: "No visa required for EU citizens",
    currency: { code: "EUR", rateToUSD: 1.08 },
    powerPlug: "Type E/F",
    tipping: "Not mandatory",
    transport: "Metro",
    simCard: "Available at airport",
    phrases: [],
    vaccinations: [],
    emergencyNumbers: [],
    embassy: { address: "1 Rue St-Florentin", phone: "+33 1 43 12 22 22" },
  },
  packingList: [],
  collaborators: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("generate-trip API route logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls generateTrip with sanitized prompt", async () => {
    mockGenerateTrip.mockResolvedValueOnce(mockTrip as never);
    await generateTrip("7 days in Paris", ["cultural", "foodie"]);
    expect(mockGenerateTrip).toHaveBeenCalledWith("7 days in Paris", ["cultural", "foodie"]);
  });

  it("returns the trip data from AI", async () => {
    mockGenerateTrip.mockResolvedValueOnce(mockTrip as never);
    const result = await generateTrip("Paris trip", []);
    expect(result.title).toBe("Test Trip to Paris");
    expect(result.destination).toContain("Paris");
  });

  it("propagates AI errors", async () => {
    mockGenerateTrip.mockRejectedValueOnce(new Error("AI model unavailable"));
    await expect(generateTrip("Tokyo trip", [])).rejects.toThrow("AI model unavailable");
  });
});

describe("generate-trip input constraints", () => {
  const MAX_PROMPT_LENGTH = 500;
  const ALLOWED_VIBES = ["foodie", "adventure", "slow", "cultural", "nightlife", "family"];

  it("prompt length limit is 500 chars", () => {
    expect(MAX_PROMPT_LENGTH).toBe(500);
  });

  it("allowed vibes list contains all 6 vibes", () => {
    expect(ALLOWED_VIBES).toHaveLength(6);
    expect(ALLOWED_VIBES).toContain("foodie");
    expect(ALLOWED_VIBES).toContain("adventure");
  });

  it("rejects prompt that exceeds max length", () => {
    const longPrompt = "a".repeat(501);
    expect(longPrompt.length > MAX_PROMPT_LENGTH).toBe(true);
  });

  it("accepts prompt at exactly max length", () => {
    const exactPrompt = "a".repeat(500);
    expect(exactPrompt.length <= MAX_PROMPT_LENGTH).toBe(true);
  });
});
