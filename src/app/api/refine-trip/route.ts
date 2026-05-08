import { NextResponse } from "next/server";
import { refineTrip } from "@/lib/ai";
import { Trip } from "@/types";

const MAX_FEEDBACK_LENGTH = 500;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trip, feedback } = body as { trip: Trip; feedback: Record<string, string> };

    if (!trip || typeof trip !== "object" || !Array.isArray(trip.days)) {
      return NextResponse.json({ error: "Valid trip object is required" }, { status: 400 });
    }
    if (!feedback || typeof feedback !== "object" || Object.keys(feedback).length === 0) {
      return NextResponse.json({ error: "No feedback provided" }, { status: 400 });
    }

    // Sanitize feedback: only allow strings, trim, and cap length
    const safeFeedback: Record<string, string> = {};
    for (const [dayId, comment] of Object.entries(feedback)) {
      if (typeof comment === "string" && comment.trim()) {
        safeFeedback[dayId] = comment.trim().slice(0, MAX_FEEDBACK_LENGTH);
      }
    }
    if (Object.keys(safeFeedback).length === 0) {
      return NextResponse.json({ error: "No valid feedback provided" }, { status: 400 });
    }

    const refined = await refineTrip(trip, safeFeedback);
    return NextResponse.json(refined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error refining trip:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
