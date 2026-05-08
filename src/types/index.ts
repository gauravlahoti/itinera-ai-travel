export type Trip = {
  id: string;
  title: string;
  destination: string[];
  startDate: string;
  endDate: string;
  travelers: number;
  vibes: Vibe[];
  budget: { total: number; currency: string };
  pace: "relaxed" | "balanced" | "packed";
  days: Day[];
  logistics: Logistics;
  packingList: PackingItem[];
  collaborators: Collaborator[];
  createdAt: number;
  updatedAt: number;
};

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

export type Vibe = "foodie" | "adventure" | "slow" | "cultural" | "nightlife" | "family";

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
