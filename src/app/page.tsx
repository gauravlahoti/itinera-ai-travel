"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAppStore } from "@/store";
import { DEMO_TRIP } from "@/lib/seed";

const VIBES = [
  { id: "foodie", label: "Foodie", icon: "🍜" },
  { id: "adventure", label: "Adventure", icon: "🏔" },
  { id: "slow", label: "Slow Travel", icon: "🛋" },
  { id: "cultural", label: "Cultural", icon: "🏛" },
  { id: "nightlife", label: "Nightlife", icon: "🌃" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
];

const PLACEHOLDERS = [
  "7 days in Japan — mix of Tokyo chaos and Kyoto calm",
  "Romantic weekend in Paris on a tight budget",
  "Solo backpacking through Southeast Asia for 2 weeks",
  "Family trip to Costa Rica with a 6-year-old",
  "Cultural deep-dive in Istanbul, 5 days",
];

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const setCurrentTrip = useAppStore((state) => state.setCurrentTrip);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaceholderIdx(Math.floor(Math.random() * PLACEHOLDERS.length));
  }, []);

  const toggleVibe = (id: string) => {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handlePlanTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, vibes: selectedVibes }),
      });

      if (!response.ok) throw new Error("Failed to generate trip");

      const trip = await response.json();
      setCurrentTrip(trip);
      router.push(`/trip/${trip.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleTryDemo = () => {
    setCurrentTrip(DEMO_TRIP);
    router.push(`/trip/${DEMO_TRIP.id}`);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans bg-black">
      {/* Background with subtle zoom animation */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/hero-bg.png")' }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: "easeOut" }}
      />

      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/85" />
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-10"
        >
          {/* Logo & Tagline */}
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-serif text-8xl md:text-[110px] text-white tracking-tighter leading-none">
                Itinera
              </h1>
            </motion.div>
            <motion.p
              className="text-base md:text-lg text-white/60 font-light tracking-[0.3em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Bespoke Journeys · Crafted by AI
            </motion.p>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="space-y-5"
          >
            <form
              onSubmit={handlePlanTrip}
              className="bg-white/8 backdrop-blur-2xl p-2 rounded-2xl border border-white/15 shadow-2xl flex flex-col md:flex-row gap-2 hover:border-white/25 transition-colors duration-500 focus-within:border-white/30"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  id="trip-prompt"
                  placeholder={PLACEHOLDERS[placeholderIdx]}
                  className="w-full bg-transparent border-none text-white placeholder:text-white/30 px-6 py-4 text-lg outline-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                id="plan-trip-btn"
                className={`bg-white text-black hover:bg-white/90 rounded-xl px-8 py-6 h-auto text-base font-semibold group transition-all shadow-xl ${isGenerating ? "shimmer opacity-80" : ""}`}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Architecting...
                  </div>
                ) : (
                  <>
                    Plan My Escape
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Vibe Chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {VIBES.map((vibe) => (
                <motion.button
                  key={vibe.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toggleVibe(vibe.id)}
                  className={`
                    px-5 py-2 rounded-full border transition-all duration-300 text-sm font-medium flex items-center gap-2
                    ${selectedVibes.includes(vibe.id)
                      ? "bg-white text-black border-white shadow-lg shadow-white/10"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20 hover:text-white"
                    }
                  `}
                >
                  <span>{vibe.icon}</span>
                  {vibe.label}
                </motion.button>
              ))}
            </div>

            {/* Demo CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <button
                onClick={handleTryDemo}
                id="try-demo-btn"
                className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors duration-300 group"
              >
                <Sparkles size={13} className="group-hover:text-amber-400 transition-colors" />
                Or try a demo — Tokyo in April
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/15 text-[10px] uppercase tracking-[0.5em] font-medium text-center w-full pointer-events-none">
        © 2026 Itinera Intelligence · Designed for the Modern Voyager
      </div>
    </main>
  );
}
