import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Itinera — AI Travel Planner",
  description: "Describe your ideal trip in plain language. Itinera generates a bespoke day-by-day itinerary with activities, dining, logistics, and an interactive map — powered by Gemini 2.5 Flash.",
  keywords: ["travel planner", "AI itinerary", "trip generator", "Gemini AI"],
  openGraph: {
    title: "Itinera — AI Travel Planner",
    description: "Bespoke journeys crafted by AI. Describe your trip and get a full itinerary in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, fraunces.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
