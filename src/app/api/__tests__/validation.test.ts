import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Shared validation logic extracted from the route handlers ──

const ALLOWED_VIBES = ["foodie", "adventure", "slow", "cultural", "nightlife", "family"];
const MAX_PROMPT_LENGTH = 500;
const MAX_FEEDBACK_LENGTH = 500;

function validateGenerateTripInput(prompt: unknown, vibes: unknown) {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return { error: "Prompt is required", status: 400 };
  }
  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    return { error: `Prompt must be under ${MAX_PROMPT_LENGTH} characters`, status: 400 };
  }
  const safeVibes = Array.isArray(vibes)
    ? vibes.filter((v): v is string => typeof v === "string" && ALLOWED_VIBES.includes(v))
    : [];
  return { prompt: prompt.trim(), vibes: safeVibes };
}

function sanitizeFeedback(feedback: unknown): Record<string, string> | null {
  if (!feedback || typeof feedback !== "object" || Object.keys(feedback as object).length === 0) {
    return null;
  }
  const safe: Record<string, string> = {};
  for (const [k, v] of Object.entries(feedback as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) {
      safe[k] = v.trim().slice(0, MAX_FEEDBACK_LENGTH);
    }
  }
  return Object.keys(safe).length > 0 ? safe : null;
}

describe("generate-trip input validation", () => {
  it("rejects empty prompt", () => {
    const result = validateGenerateTripInput("", []);
    expect(result).toMatchObject({ error: "Prompt is required", status: 400 });
  });

  it("rejects whitespace-only prompt", () => {
    const result = validateGenerateTripInput("   ", []);
    expect(result).toMatchObject({ error: "Prompt is required", status: 400 });
  });

  it("rejects prompt over 500 chars", () => {
    const long = "a".repeat(501);
    const result = validateGenerateTripInput(long, []);
    expect(result).toMatchObject({ status: 400 });
  });

  it("accepts valid prompt", () => {
    const result = validateGenerateTripInput("7 days in Japan", ["foodie"]) as { prompt: string; vibes: string[] };
    expect(result.prompt).toBe("7 days in Japan");
    expect(result.vibes).toContain("foodie");
  });

  it("filters out unknown vibes", () => {
    const result = validateGenerateTripInput("Paris trip", ["foodie", "hacking", "unknown"]) as { vibes: string[] };
    expect(result.vibes).toEqual(["foodie"]);
  });

  it("trims prompt whitespace", () => {
    const result = validateGenerateTripInput("  Tokyo trip  ", []) as { prompt: string };
    expect(result.prompt).toBe("Tokyo trip");
  });
});

describe("feedback sanitization", () => {
  it("returns null for empty feedback", () => {
    expect(sanitizeFeedback({})).toBeNull();
  });

  it("trims and caps feedback values", () => {
    const long = "x".repeat(600);
    const result = sanitizeFeedback({ "day-1": long });
    expect(result!["day-1"].length).toBe(MAX_FEEDBACK_LENGTH);
  });

  it("strips whitespace-only entries", () => {
    const result = sanitizeFeedback({ "day-1": "   " });
    expect(result).toBeNull();
  });

  it("preserves valid feedback", () => {
    const result = sanitizeFeedback({ "day-1": "More outdoor activities" });
    expect(result).toEqual({ "day-1": "More outdoor activities" });
  });

  it("rejects non-object input", () => {
    expect(sanitizeFeedback("not an object")).toBeNull();
    expect(sanitizeFeedback(null)).toBeNull();
  });
});
