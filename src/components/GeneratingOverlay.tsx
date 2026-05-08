"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GENERATE_STEPS = [
  { icon: "🧭", phase: "Reading your intent",        detail: "Decoding pace, budget, and vibe preferences from your prompt…" },
  { icon: "🗺️", phase: "Scouting the destination",   detail: "Exploring neighbourhoods, transport links, and seasonal conditions…" },
  { icon: "🎯", phase: "Handpicking activities",      detail: "Filtering thousands of experiences down to the ones worth your time…" },
  { icon: "🍽️", phase: "Curating dining",             detail: "Finding the restaurants locals queue for, not the tourist traps…" },
  { icon: "📅", phase: "Structuring your days",       detail: "Sequencing activities so mornings feel energising, not rushed…" },
  { icon: "📍", phase: "Optimising the route",        detail: "Clustering by neighbourhood — no zigzagging across the city…" },
  { icon: "⚡", phase: "Checking the pace",           detail: "Flagging overloaded days and building breathing room into Day 1…" },
  { icon: "🧳", phase: "Compiling logistics",         detail: "Visas, currency, power adapters, local phrases, emergency numbers…" },
  { icon: "📦", phase: "Packing your bag",            detail: "Smart packing list tailored to your activities and the weather window…" },
  { icon: "✨", phase: "Adding the finishing touches", detail: "The details that turn a good trip into one you'll remember forever…" },
];

const REFINE_STEPS = [
  { icon: "📝", phase: "Reading your feedback",      detail: "Understanding exactly what you'd like to change on each day…" },
  { icon: "🔍", phase: "Analysing the current plan", detail: "Identifying which activities to swap, keep, or reorder…" },
  { icon: "🔄", phase: "Applying your changes",      detail: "Replacing activities while preserving the days you loved…" },
  { icon: "🎯", phase: "Finding better alternatives", detail: "Sourcing options that match your updated preferences…" },
  { icon: "📅", phase: "Re-sequencing the days",     detail: "Ensuring the revised schedule flows naturally…" },
  { icon: "⚡", phase: "Re-checking the pace",       detail: "Making sure no day is overloaded after the changes…" },
  { icon: "✨", phase: "Polishing the refined plan",  detail: "Final touches to make your updated itinerary feel seamless…" },
];

const STEP_COLORS = ["#7C9E87", "#C9622B", "#C8A84B", "#6B90A8", "#8B6B9E", "#708090"];

interface Props {
  mode?: "generate" | "refine";
  prompt?: string;
  feedbackSummary?: string;
}

export function GeneratingOverlay({ mode = "generate", prompt, feedbackSummary }: Props) {
  const steps = mode === "refine" ? REFINE_STEPS : GENERATE_STEPS;
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    }, 3200);

    const startTime = Date.now();
    const duration = mode === "refine" ? 24 : 30;
    const progressTimer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const p = elapsed < duration ? (elapsed / duration) * 92 : 92 + (elapsed - duration) * 0.3;
      setProgress(Math.min(p, 98));
    }, 200);

    return () => { clearInterval(stepTimer); clearInterval(progressTimer); };
  }, [mode, steps.length]);

  const step = steps[stepIdx];
  const color = STEP_COLORS[stepIdx % STEP_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-[2000] flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      {/* Blurred hero bg */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: 'url("/hero-bg.png")', filter: "blur(14px) brightness(0.3)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {/* Context pill */}
      {(prompt || feedbackSummary) && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mb-12 px-6 py-3 rounded-full bg-white/8 border border-white/15 backdrop-blur-md max-w-lg text-center"
        >
          <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">
            {mode === "refine" ? "Refining your trip" : "Your journey"}
          </p>
          <p className="text-white text-sm font-medium truncate">
            {feedbackSummary ?? prompt}
          </p>
        </motion.div>
      )}

      {/* Core */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-md">
        {/* Pulsing icon */}
        <div className="relative">
          <motion.div
            key={stepIdx + "-ring"}
            className="absolute rounded-full"
            style={{ inset: -16, border: `2px solid ${color}` }}
            initial={{ opacity: 0.8, scale: 0.85 }}
            animate={{ opacity: 0, scale: 1.55 }}
            transition={{ duration: 1.6, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
          />
          <motion.div
            key={stepIdx + "-icon"}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl"
            style={{ background: `${color}22`, border: `1.5px solid ${color}55` }}
          >
            {step.icon}
          </motion.div>
        </div>

        {/* Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <h2 className="font-serif text-3xl text-white tracking-tight">{step.phase}</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">{step.detail}</p>
          </motion.div>
        </AnimatePresence>

        {/* Step pills */}
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full"
              animate={{
                width: i === stepIdx ? 24 : 6,
                backgroundColor: i <= stepIdx ? color : "rgba(255,255,255,0.2)",
              }}
              transition={{ duration: 0.35 }}
            />
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10 mt-16 w-full max-w-sm px-6 space-y-2">
        <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest">
          <span>Step {stepIdx + 1} of {steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-px bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
        <p className="text-center text-white/20 text-[10px] uppercase tracking-[0.3em] pt-1">
          Powered by Gemini 2.5
        </p>
      </div>
    </motion.div>
  );
}
