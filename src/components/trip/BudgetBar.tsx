"use client";

import { Trip } from "@/types";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Zap } from "lucide-react";
import { useMemo } from "react";

interface Props {
  trip: Trip;
}

const PACE_LABELS = {
  relaxed: { label: "Relaxed", icon: "🛋", color: "bg-blue-500" },
  balanced: { label: "Balanced", icon: "⚖️", color: "bg-emerald-500" },
  packed: { label: "Packed", icon: "⚡", color: "bg-orange-500" },
};

const CATEGORY_COLORS: Record<string, string> = {
  food: "#C9622B",
  sight: "#4A90A4",
  experience: "#9B59B6",
  transport: "#7F8C8D",
  lodging: "#27AE60",
  rest: "#E91E63",
};

export function BudgetBar({ trip }: Props) {
  const breakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalSpend = 0;

    for (const day of trip.days) {
      for (const act of day.activities) {
        const amount = act.cost.perPerson
          ? act.cost.amount * trip.travelers
          : act.cost.amount;
        totals[act.type] = (totals[act.type] || 0) + amount;
        totalSpend += amount;
      }
    }

    return { totals, totalSpend };
  }, [trip]);

  const { totals, totalSpend } = breakdown;
  const budget = trip.budget.total;
  const percentUsed = Math.min((totalSpend / budget) * 100, 100);
  const remaining = budget - totalSpend;
  const isOver = totalSpend > budget;



  return (
    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-primary" />
          <h3 className="font-medium text-sm">Budget Overview</h3>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          isOver ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"
        }`}>
          <TrendingUp size={11} />
          {isOver ? `Over by ${Math.abs(remaining).toFixed(0)} ${trip.budget.currency}` : `${remaining.toFixed(0)} ${trip.budget.currency} left`}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Main Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Estimated spend: <strong className="text-foreground">{totalSpend.toFixed(0)} {trip.budget.currency}</strong></span>
            <span>Budget: <strong className="text-foreground">{budget} {trip.budget.currency}</strong></span>
          </div>
          <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentUsed}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={`h-full rounded-full ${isOver ? "bg-red-500" : "bg-primary"}`}
            />
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">By Category</p>
          <div className="space-y-2">
            {Object.entries(totals)
              .sort(([, a], [, b]) => b - a)
              .map(([type, amount]) => {
                const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xs w-20 capitalize text-muted-foreground">{type}</span>
                    <div className="flex-1 h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[type] || "#888" }}
                      />
                    </div>
                    <span className="text-xs font-medium w-16 text-right">{amount.toFixed(0)} {trip.budget.currency}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Pace Optimizer */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-primary" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Trip Pace</p>
          </div>
          <div className="flex gap-2">
            {(["relaxed", "balanced", "packed"] as const).map((p) => {
              const info = PACE_LABELS[p];
              const isActive = trip.pace === p;
              return (
                <div
                  key={p}
                  className={`flex-1 text-center px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-secondary/10 text-muted-foreground border-secondary/20"
                  }`}
                >
                  <div className="text-base mb-1">{info.icon}</div>
                  {info.label}
                </div>
              );
            })}
          </div>

          {/* Energy Score per Day */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Day Energy</p>
            <div className="flex gap-1.5">
              {trip.days.map((day) => {
                const scores: Record<string, string> = {
                  light: "bg-blue-400",
                  balanced: "bg-emerald-400",
                  packed: "bg-orange-400",
                  punishing: "bg-red-500",
                };
                return (
                  <div key={day.id} className="flex-1 text-center">
                    <div
                      className={`h-6 rounded-md ${scores[day.energyScore] || "bg-secondary"}`}
                      title={`Day ${day.dayNumber}: ${day.energyScore}`}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">{day.dayNumber}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Light</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Balanced</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Packed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Punishing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
