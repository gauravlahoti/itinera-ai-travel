"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useAppStore } from "@/store";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableActivity } from "@/components/trip/SortableActivity";
import { ActivityDetailPanel } from "@/components/trip/ActivityDetailPanel";

const TripMap = dynamic(
  () => import("@/components/trip/TripMap").then((m) => m.TripMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse" /> }
);
import { BudgetBar } from "@/components/trip/BudgetBar";
import { GeneratingOverlay } from "@/components/GeneratingOverlay";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Wind, Info, Briefcase, Download,
  ChevronLeft, Map as MapIcon, List, Wand2, MessageSquarePlus
} from "lucide-react";
import { Activity } from "@/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  use(params);

  const currentTrip = useAppStore((state) => state.currentTrip);
  const reorderActivities = useAppStore((state) => state.reorderActivities);
  const [mounted, setMounted] = useState(false);
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "budget" | "logistics">("timeline");
  const [showMap, setShowMap] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dayFeedback, setDayFeedback] = useState<Record<string, string>>({});
  const [isRefining, setIsRefining] = useState(false);

  const setCurrentTrip = useAppStore((state) => state.setCurrentTrip);

  const activeFeedbackCount = Object.values(dayFeedback).filter((v) => v.trim()).length;

  const handleRefineTrip = async () => {
    if (!currentTrip || activeFeedbackCount === 0) return;
    setIsRefining(true);
    try {
      const response = await fetch("/api/refine-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip: currentTrip, feedback: dayFeedback }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to refine trip");
      }
      const refined = await response.json();
      setCurrentTrip(refined);
      setDayFeedback({});
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong.";
      console.error("Refine failed:", msg);
      alert(msg);
    } finally {
      setIsRefining(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleDragEnd = (event: DragEndEvent, dayId: string) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderActivities(dayId, active.id as string, over.id as string);
    }
  };

  const mapLocations = useMemo(() => {
    if (!currentTrip) return [];
    return currentTrip.days.flatMap((d, dayIndex) =>
      d.activities.map(a => ({
        id: a.id,
        name: a.name,
        lat: a.location.lat,
        lng: a.location.lng,
        dayIndex,
        activity: a,
      }))
    );
  }, [currentTrip]);

  const dayPaths = useMemo(() => {
    if (!currentTrip) return [];
    const DAY_COLORS = ["#7C9E87", "#C9622B", "#C8A84B", "#6B90A8", "#8B6B9E", "#708090"];
    return currentTrip.days.map((d, i) => ({
      positions: d.activities.map(a => [a.location.lat, a.location.lng] as [number, number]),
      color: DAY_COLORS[i % DAY_COLORS.length],
    }));
  }, [currentTrip]);

  const center = useMemo(() => {
    if (mapLocations.length > 0) {
      return { lat: mapLocations[0].lat, lng: mapLocations[0].lng };
    }
    return { lat: 35.6762, lng: 139.6503 };
  }, [mapLocations]);

  const handleExportPDF = async () => {
    if (!currentTrip) return;
    setIsExporting(true);
    try {
      const { exportTripToPDF } = await import("@/lib/pdf");
      await exportTripToPDF(currentTrip);
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Trip not found.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-primary hover:underline"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  const feedbackSummary = activeFeedbackCount === 1
    ? `Feedback on ${currentTrip.days.find(d => dayFeedback[d.id]?.trim())?.city ?? "1 day"}`
    : `Feedback on ${activeFeedbackCount} days`;

  return (
    <>
      <AnimatePresence>
        {isRefining && <GeneratingOverlay mode="refine" feedbackSummary={feedbackSummary} />}
      </AnimatePresence>

    <ErrorBoundary>
    <div className="flex h-screen w-full overflow-hidden bg-background relative">
      {/* Activity Detail Side Panel */}
      <ActivityDetailPanel
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />

      {/* ── Left Pane ─────────────────────────────── */}
      <div className="w-full lg:w-1/2 h-full flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{currentTrip.destination.join(" → ")}</p>
            <h1 className="font-serif text-base text-primary truncate leading-tight">{currentTrip.title}</h1>
          </div>

          {/* Mobile map toggle */}
          <button
            onClick={() => setShowMap((v) => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground"
            aria-label="Toggle map"
          >
            {showMap ? <List size={18} /> : <MapIcon size={18} />}
          </button>

          {/* PDF Export */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {isExporting ? (
              <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </header>

        {/* Tab Nav */}
        <div className="flex-shrink-0 border-b px-5 flex gap-1 bg-background" role="tablist" aria-label="Trip sections">
          {(["timeline", "budget", "logistics"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-4 text-xs font-medium capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* ── TIMELINE TAB ── */}
            {activeTab === "timeline" && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-10 pb-28"
              >
                {/* Hero Summary */}
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    <span>{currentTrip.startDate} — {currentTrip.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Wind size={14} />
                    <span className="capitalize">{currentTrip.pace} pace</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {currentTrip.vibes.map((vibe) => (
                      <span key={vibe} className="text-xs bg-primary/8 border border-primary/15 px-2.5 py-0.5 rounded-full text-primary font-medium">
                        #{vibe}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Days */}
                {currentTrip.days.map((day) => (
                  <section key={day.id} id={`day-${day.id}`}>
                    {/* Day Header */}
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="sticky top-0 bg-background/97 backdrop-blur-sm py-3 z-10 border-b mb-4 flex justify-between items-end"
                    >
                      <div>
                        <h2 className="font-serif text-2xl text-primary">
                          Day {day.dayNumber}
                          <span className="text-muted-foreground font-sans text-lg font-normal"> · {day.city}</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">{day.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl">{day.weather.icon || "🌤"}</span>
                        <p className="text-sm font-medium">{day.weather.tempC}°C</p>
                        <p className="text-[10px] text-muted-foreground">{day.weather.condition}</p>
                      </div>
                    </motion.div>

                    {/* Activities */}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, day.id)}
                    >
                      <SortableContext
                        items={day.activities.map(a => a.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {day.activities.map((activity) => (
                            <div
                              key={activity.id}
                              onMouseEnter={() => setHoveredActivityId(activity.id)}
                              onMouseLeave={() => setHoveredActivityId(null)}
                            >
                              <SortableActivity
                                activity={activity}
                                onClick={() => setSelectedActivity(activity)}
                              />
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {day.notes && (
                      <div className="mt-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-sm italic text-muted-foreground border-l-2 border-amber-400">
                        💡 {day.notes}
                      </div>
                    )}

                    {/* Per-day feedback */}
                    <div className="mt-4 px-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquarePlus size={13} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Feedback for Day {day.dayNumber}</span>
                      </div>
                      <textarea
                        value={dayFeedback[day.id] || ""}
                        onChange={(e) => setDayFeedback((prev) => ({ ...prev, [day.id]: e.target.value }))}
                        placeholder={`e.g. "Replace the museum with something outdoors" or "I prefer budget-friendly options"`}
                        rows={2}
                        aria-label={`Feedback for Day ${day.dayNumber} in ${day.city}`}
                        className="w-full px-4 py-3 text-sm bg-secondary/20 border border-secondary/30 rounded-xl resize-none outline-none focus:border-primary/40 placeholder:text-muted-foreground/40 transition-colors"
                      />
                    </div>
                  </section>
                ))}
              </motion.div>
            )}

            {/* ── BUDGET TAB ── */}
            {activeTab === "budget" && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-5 pb-28"
              >
                <BudgetBar trip={currentTrip} />
              </motion.div>
            )}

            {/* ── LOGISTICS TAB ── */}
            {activeTab === "logistics" && (
              <motion.div
                key="logistics"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-8 pb-28"
              >
                {/* Info grid */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="text-primary" size={16} />
                    <h2 className="font-serif text-xl text-primary">Travel Info</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Visa & Entry", value: currentTrip.logistics.visa },
                      { label: "Currency", value: `${currentTrip.logistics.currency.code} · 1 USD ≈ ${currentTrip.logistics.currency.rateToUSD}` },
                      { label: "Power Adapter", value: currentTrip.logistics.powerPlug },
                      { label: "Tipping", value: currentTrip.logistics.tipping },
                      { label: "Transport", value: currentTrip.logistics.transport },
                      { label: "SIM Card", value: currentTrip.logistics.simCard },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-4 rounded-xl bg-secondary/20 border border-secondary/30">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">{label}</h4>
                        <p className="text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phrases */}
                {currentTrip.logistics.phrases.length > 0 && (
                  <div>
                    <h3 className="font-serif text-xl text-primary mb-4">Useful Phrases</h3>
                    <div className="space-y-2">
                      {currentTrip.logistics.phrases.map((phrase, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                          <span className="text-sm text-muted-foreground">{phrase.en}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">{phrase.local}</p>
                            <p className="text-xs text-muted-foreground italic">{phrase.phonetic}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Numbers */}
                <div>
                  <h3 className="font-serif text-xl text-primary mb-4">Emergency Contacts</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {currentTrip.logistics.emergencyNumbers.map((num) => (
                      <div key={num.label} className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-center">
                        <p className="text-xs text-muted-foreground">{num.label}</p>
                        <p className="text-lg font-bold font-mono text-red-600">{num.number}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Packing List */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase size={16} className="text-primary" />
                    <h3 className="font-serif text-xl text-primary">Packing List</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    {currentTrip.packingList.map((item) => (
                      <label key={item.id} className="flex items-center gap-3 py-2.5 border-b border-muted/50 cursor-pointer group">
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="rounded border-muted-foreground/30 text-primary focus:ring-primary focus:ring-1 flex-shrink-0"
                        />
                        <span className="text-sm group-has-[:checked]:line-through group-has-[:checked]:text-muted-foreground transition-all flex-1">
                          {item.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded flex-shrink-0">
                          {item.category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Refine Bar — in-flow so it never overlaps the textarea */}
        <AnimatePresence>
          {activeFeedbackCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-shrink-0 px-4 py-2 border-t bg-background/95 backdrop-blur-sm"
            >
              <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl">
                <p className="text-sm font-medium">
                  {activeFeedbackCount} day{activeFeedbackCount > 1 ? "s" : ""} with feedback
                </p>
                <button
                  onClick={handleRefineTrip}
                  disabled={isRefining}
                  className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-60"
                >
                  <Wand2 size={14} />
                  Regenerate with AI
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Day Nav */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:left-1/4 z-30 flex gap-1.5 bg-background/85 backdrop-blur-md px-3 py-2 rounded-full border shadow-xl overflow-x-auto max-w-[calc(50vw-2rem)] scrollbar-hide">
          {currentTrip.days.map((day) => (
            <button
              key={day.id}
              onClick={() => {
                setActiveTab("timeline");
                setTimeout(() => {
                  document.getElementById(`day-${day.id}`)?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/30 hover:bg-primary hover:text-primary-foreground transition-all whitespace-nowrap"
            >
              D{day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right Pane: Map ─────────────────────────────── */}
      <div className={`${showMap ? "flex" : "hidden"} lg:flex lg:w-1/2 h-full bg-muted relative flex-col`}>
        <TripMap
          locations={mapLocations}
          dayPaths={dayPaths}
          hoveredActivityId={hoveredActivityId}
          onActivitySelect={setSelectedActivity}
          center={center}
        />
      </div>
    </div>
    </ErrorBoundary>
    </>
  );
}
