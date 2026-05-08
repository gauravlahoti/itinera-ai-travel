import { GoogleGenAI } from "@google/genai";
import { Trip } from "@/types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_API_KEY,
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

export async function generateTrip(prompt: string, vibes: string[]): Promise<Trip> {
  const fullPrompt = `Generate a trip based on this request: "${prompt}".\nDesired vibes: ${vibes.join(", ")}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: fullPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema as unknown as import("@google/genai").Schema,
    }
  });

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
