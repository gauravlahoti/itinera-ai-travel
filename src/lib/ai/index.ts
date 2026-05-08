import { GoogleGenAI } from "@google/genai";
import { Trip } from "@/types";

const ai = process.env.GOOGLE_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
  : new GoogleGenAI({ 
      vertexai: true, 
      project: process.env.GOOGLE_CLOUD_PROJECT || "gcp-experiments-490306", 
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1" 
    });

const systemInstruction = `
You are an expert, opinionated travel planner.
Your goal is to generate a comprehensive, highly-structured itinerary based on the user's prompt and selected vibes.
You must return ONLY a JSON object that perfectly matches the provided schema for a "Trip".
Do not include any conversational text or markdown formatting outside of the JSON block.

Guidelines:
- Create distinct, realistic days with reasonable pacing.
- Incorporate the selected vibes deeply into the activity choices.
- Do not create a "punishing" schedule unless explicitly asked for.
- Provide a brief, persuasive "reasoning" for each activity.
- Allocate realistic durations and start times (e.g., 09:00).
- Estimate costs reasonably in the requested currency (or USD by default).
- For logistics, provide accurate, actionable information (e.g., specific plug types, useful local phrases).
`;

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    destination: { type: "array", items: { type: "string" } },
    startDate: { type: "string" },
    endDate: { type: "string" },
    travelers: { type: "number" },
    vibes: { type: "array", items: { type: "string" } },
    budget: { 
      type: "object", 
      properties: { total: { type: "number" }, currency: { type: "string" } } 
    },
    pace: { type: "string", enum: ["relaxed", "balanced", "packed"] },
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          dayNumber: { type: "number" },
          date: { type: "string" },
          city: { type: "string" },
          weather: { 
            type: "object", 
            properties: { tempC: { type: "number" }, condition: { type: "string" }, icon: { type: "string" } } 
          },
          energyScore: { type: "string", enum: ["light", "balanced", "packed", "punishing"] },
          notes: { type: "string" },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["food", "sight", "experience", "transport", "lodging", "rest"] },
                name: { type: "string" },
                description: { type: "string" },
                reasoning: { type: "string" },
                startTime: { type: "string" },
                durationMin: { type: "number" },
                location: { 
                  type: "object", 
                  properties: { lat: { type: "number" }, lng: { type: "number" }, address: { type: "string" }, neighborhood: { type: "string" } } 
                },
                cost: { 
                  type: "object", 
                  properties: { amount: { type: "number" }, currency: { type: "string" }, perPerson: { type: "boolean" } } 
                },
                bookingUrl: { type: "string" },
                photos: { type: "array", items: { type: "string" } },
                tags: { type: "array", items: { type: "string" } }
              },
              required: ["id", "type", "name", "description", "reasoning", "startTime", "durationMin", "location", "cost", "photos", "tags"]
            }
          }
        },
        required: ["id", "dayNumber", "date", "city", "weather", "energyScore", "activities"]
      }
    },
    logistics: {
      type: "object",
      properties: {
        visa: { type: "string" },
        currency: { type: "object", properties: { code: { type: "string" }, rateToUSD: { type: "number" } } },
        powerPlug: { type: "string" },
        tipping: { type: "string" },
        transport: { type: "string" },
        simCard: { type: "string" },
        phrases: { 
          type: "array", 
          items: { type: "object", properties: { en: { type: "string" }, local: { type: "string" }, phonetic: { type: "string" } } } 
        },
        vaccinations: { type: "array", items: { type: "string" } },
        emergencyNumbers: { 
          type: "array", 
          items: { type: "object", properties: { label: { type: "string" }, number: { type: "string" } } } 
        },
        embassy: { type: "object", properties: { address: { type: "string" }, phone: { type: "string" } } }
      },
      required: ["visa", "currency", "powerPlug", "tipping", "transport", "simCard", "phrases", "vaccinations", "emergencyNumbers", "embassy"]
    },
    packingList: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          category: { type: "string", enum: ["Documents", "Clothing", "Tech", "Toiletries", "Medication", "Activity-specific"] },
          checked: { type: "boolean" }
        },
        required: ["id", "name", "category", "checked"]
      }
    }
  },
  required: ["id", "title", "destination", "startDate", "endDate", "travelers", "vibes", "budget", "pace", "days", "logistics", "packingList"]
};

/**
 * Refines an existing trip by applying per-day traveller feedback.
 *
 * Only days referenced in `feedback` are regenerated; all other days are
 * preserved verbatim. Trip-level fields (title, logistics, packing list)
 * are also preserved unless feedback explicitly requests a change.
 *
 * @param existingTrip - The current Trip to refine.
 * @param feedback - Map of `{ dayId: userComment }`. Empty or whitespace values are ignored.
 * @returns A new Trip object with the requested days updated.
 */
export async function refineTrip(
  existingTrip: Trip,
  feedback: Record<string, string>
): Promise<Trip> {
  const feedbackLines = existingTrip.days
    .filter((d) => feedback[d.id]?.trim())
    .map((d) => `  • Day ${d.dayNumber} – ${d.city}: "${feedback[d.id].trim()}"`)
    .join("\n");

  const fullPrompt = `You are refining an existing trip plan based on specific traveller feedback.

EXISTING TRIP (JSON):
${JSON.stringify(existingTrip)}

TRAVELLER FEEDBACK (per day):
${feedbackLines}

Instructions:
- Apply each piece of feedback to the relevant day only.
- Keep all days that have NO feedback exactly as they are.
- Preserve the trip's overall structure, title, dates, logistics, and packing list unless feedback explicitly requests a change.
- Return the complete updated Trip as a single JSON object matching the original schema.`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema as unknown as import("@google/genai").Schema,
      },
    });
  } catch (error) {
    console.error("AI Refine Error:", JSON.stringify(error, null, 2));
    throw error;
  }

  if (!response.text) throw new Error("Failed to refine trip content");

  const cleanJson = response.text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  const tripData = JSON.parse(cleanJson);
  tripData.collaborators = existingTrip.collaborators ?? [];
  tripData.createdAt = existingTrip.createdAt;
  tripData.updatedAt = Date.now();

  return tripData as Trip;
}

/**
 * Generates a complete trip itinerary from a natural-language prompt.
 *
 * Calls Gemini 2.5 Flash with a strict `responseSchema` that maps 1:1 to the
 * `Trip` TypeScript type, guaranteeing structured output without post-processing.
 *
 * @param prompt - Free-text trip description (e.g. "7 days in Japan, mix of Tokyo and Kyoto").
 * @param vibes - Selected travel personas (e.g. ["foodie", "cultural"]).
 * @returns A fully-populated Trip object ready to render.
 */
export async function generateTrip(prompt: string, vibes: string[]): Promise<Trip> {
  const fullPrompt = `Generate a trip based on this request: "${prompt}".\nDesired vibes: ${vibes.join(", ")}`;
  
  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema as unknown as import("@google/genai").Schema,
      }
    });
  } catch (error) {
    console.error("AI Generation Error Details:", JSON.stringify(error, null, 2));
    throw error;
  }

  if (!response.text) {
    throw new Error("Failed to generate trip content");
  }

  // Clean response text in case the model included markdown code blocks
  const cleanJson = response.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  const tripData = JSON.parse(cleanJson);
  
  // Initialize some client-only fields
  tripData.collaborators = [];
  tripData.createdAt = Date.now();
  tripData.updatedAt = Date.now();

  return tripData as Trip;
}
