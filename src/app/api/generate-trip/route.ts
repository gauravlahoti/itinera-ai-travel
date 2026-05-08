import { NextResponse } from 'next/server';
import { generateTrip } from '@/lib/ai';

const ALLOWED_VIBES = ["foodie", "adventure", "slow", "cultural", "nightlife", "family"];
const MAX_PROMPT_LENGTH = 500;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, vibes } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (prompt.trim().length > MAX_PROMPT_LENGTH) {
      return NextResponse.json({ error: `Prompt must be under ${MAX_PROMPT_LENGTH} characters` }, { status: 400 });
    }

    const safeVibes = Array.isArray(vibes)
      ? vibes.filter((v): v is string => typeof v === "string" && ALLOWED_VIBES.includes(v))
      : [];

    const tripData = await generateTrip(prompt.trim(), safeVibes);
    return NextResponse.json(tripData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error generating trip:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
