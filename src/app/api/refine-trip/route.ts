import { NextResponse } from "next/server";
import { refineTrip } from "@/lib/ai";
import { Trip } from "@/types";

export async function POST(request: Request) {
  try {
    const { trip, feedback }: { trip: Trip; feedback: Record<string, string> } =
      await request.json();

    if (!trip) {
      return NextResponse.json({ error: "Trip is required" }, { status: 400 });
    }
    if (!feedback || Object.keys(feedback).length === 0) {
      return NextResponse.json({ error: "No feedback provided" }, { status: 400 });
    }

    const refined = await refineTrip(trip, feedback);
    return NextResponse.json(refined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error refining trip:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
