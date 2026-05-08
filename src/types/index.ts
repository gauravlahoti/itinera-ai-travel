/** Complete trip itinerary as returned by the Gemini AI layer. */
export type Trip = {
  id: string;
  title: string;
  /** One or more cities/regions covered by the trip. */
  destination: string[];
  /** ISO date string, e.g. "2024-04-01". */
  startDate: string;
  /** ISO date string, e.g. "2024-04-07". */
  endDate: string;
  travelers: number;
  vibes: Vibe[];
  budget: { total: number; currency: string };
  pace: "relaxed" | "balanced" | "packed";
  days: Day[];
  logistics: Logistics;
  packingList: PackingItem[];
  collaborators: Collaborator[];
  /** Unix timestamp (ms) set on creation. */
  createdAt: number;
  /** Unix timestamp (ms) updated on every refinement. */
  updatedAt: number;
};

/** A single day within a trip itinerary. */
export type Day = {
  id: string;
  dayNumber: number;
  date: string;
  city: string;
  weather: { tempC: number; condition: string; icon: string };
  activities: Activity[];
  energyScore: "light" | "balanced" | "packed" | "punishing";
  notes?: string;
};

/** A scheduled activity, meal, transport leg, or rest period within a day. */
export type Activity = {
  id: string;
  type: "food" | "sight" | "experience" | "transport" | "lodging" | "rest";
  name: string;
  description: string;
  reasoning: string;
  startTime: string;
  durationMin: number;
  location: { lat: number; lng: number; address: string; neighborhood: string };
  cost: { amount: number; currency: string; perPerson: boolean };
  bookingUrl?: string;
  photos: string[];
  tags: string[];
  votes: { userId: string; vote: "up" | "down" }[];
  comments: CommentType[];
  alternatives?: Activity[];
};

export type CommentType = {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
};

/** Travel persona that shapes activity and dining recommendations. */
export type Vibe = "foodie" | "adventure" | "slow" | "cultural" | "nightlife" | "family";

/** Destination-specific travel information generated alongside the itinerary. */
export type Logistics = {
  visa: string;
  currency: { code: string; rateToUSD: number };
  powerPlug: string;
  tipping: string;
  transport: string;
  simCard: string;
  phrases: { en: string; local: string; phonetic: string }[];
  vaccinations: string[];
  emergencyNumbers: { label: string; number: string }[];
  embassy: { address: string; phone: string };
};

export type PackingItem = {
  id: string;
  name: string;
  category: "Documents" | "Clothing" | "Tech" | "Toiletries" | "Medication" | "Activity-specific";
  checked: boolean;
};

export type Collaborator = {
  id: string;
  name: string;
  emoji: string;
  cursorColor: string;
};
