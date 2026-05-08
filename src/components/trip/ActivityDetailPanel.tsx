"use client";

import { Activity } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Clock, MapPin, DollarSign, ExternalLink, RefreshCw,
  Utensils, Eye, Sparkles, Truck, Hotel, Coffee, Tag
} from "lucide-react";

interface Props {
  activity: Activity | null;
  onClose: () => void;
}

const TYPE_ICONS: Record<Activity["type"], React.ReactNode> = {
  food: <Utensils size={16} />,
  sight: <Eye size={16} />,
  experience: <Sparkles size={16} />,
  transport: <Truck size={16} />,
  lodging: <Hotel size={16} />,
  rest: <Coffee size={16} />,
};

const TYPE_COLORS: Record<Activity["type"], string> = {
  food: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  sight: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  experience: "bg-purple-500/15 text-purple-600 border-purple-500/20",
  transport: "bg-slate-500/15 text-slate-600 border-slate-500/20",
  lodging: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  rest: "bg-rose-500/15 text-rose-600 border-rose-500/20",
};

export function ActivityDetailPanel({ activity, onClose }: Props) {
  return (
    <AnimatePresence>
      {activity && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-6 py-4 flex items-start justify-between gap-4 z-10">
              <div className="flex-1 min-w-0">
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border mb-2 ${TYPE_COLORS[activity.type]}`}>
                  {TYPE_ICONS[activity.type]}
                  <span className="capitalize">{activity.type}</span>
                </div>
                <h2 className="font-serif text-xl text-primary leading-tight">{activity.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors flex-shrink-0 mt-1"
                aria-label="Close panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Time & Meta */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/20 rounded-xl p-3 text-center">
                  <Clock size={16} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Start</p>
                  <p className="font-medium text-sm">{activity.startTime}</p>
                </div>
                <div className="bg-secondary/20 rounded-xl p-3 text-center">
                  <Clock size={16} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium text-sm">{activity.durationMin}m</p>
                </div>
                <div className="bg-secondary/20 rounded-xl p-3 text-center">
                  <DollarSign size={16} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Cost</p>
                  <p className="font-medium text-sm">
                    {activity.cost.amount === 0 ? "Free" : `${activity.cost.amount} ${activity.cost.currency}${activity.cost.perPerson ? "/pp" : ""}`}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">About</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{activity.description}</p>
              </div>

              {/* AI Reasoning */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-primary" />
                  <h3 className="text-xs uppercase tracking-widest text-primary font-medium">Why This</h3>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed italic">{activity.reasoning}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Location</h3>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{activity.location.neighborhood}</p>
                    <p className="text-muted-foreground text-xs">{activity.location.address}</p>
                  </div>
                </div>
                {/* Mini map preview */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activity.location.lat},${activity.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} />
                  Open in Google Maps
                </a>
              </div>

              {/* Tags */}
              {activity.tags && activity.tags.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-secondary/30 px-2.5 py-1 rounded-full text-foreground/70 border border-secondary/40">
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking CTA */}
              {activity.bookingUrl && (
                <a
                  href={activity.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink size={15} />
                  Book Now
                </a>
              )}

              {/* Plan B Alternatives */}
              {activity.alternatives && activity.alternatives.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <RefreshCw size={14} className="text-secondary" />
                    <h3 className="text-xs uppercase tracking-widest text-secondary font-medium font-sans">Plan B — Alternatives</h3>
                  </div>
                  <div className="space-y-4">
                    {activity.alternatives.map((alt) => (
                      <div key={alt.id} className="group relative bg-secondary/5 border border-secondary/15 rounded-2xl p-5 hover:border-secondary/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-serif text-base text-primary">{alt.name}</h4>
                          <span className="text-[10px] font-mono text-muted-foreground bg-secondary/30 px-1.5 py-0.5 rounded uppercase tracking-wider">{alt.startTime}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{alt.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 text-[10px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1">⏱ {alt.durationMin}m</span>
                            <span className="flex items-center gap-1">💰 {alt.cost.amount === 0 ? "Free" : `${alt.cost.amount} ${alt.cost.currency}`}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              const day = useAppStore.getState().currentTrip?.days.find(d => 
                                d.activities.some(a => a.id === activity.id)
                              );
                              if (day) {
                                useAppStore.getState().replaceActivity(day.id, activity.id, {
                                  ...alt,
                                  id: activity.id, // Keep original ID for sorting/map stability if possible, or new ID?
                                  // Actually let's keep original ID but swap content to avoid breaking DND-kit keys immediately
                                  // But alt.id is better for fresh state. Let's swap the whole object but keep original ID if needed.
                                  // For simplicity, let's just swap.
                                });
                                onClose();
                              }
                            }}
                            className="text-[11px] font-semibold text-secondary hover:text-secondary/80 flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw size={12} />
                            Swap with this
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
