import { NextResponse } from 'next/server';
import { generateTrip } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { prompt, vibes } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const tripData = await generateTrip(prompt, vibes || []);
    return NextResponse.json(tripData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error generating trip:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
