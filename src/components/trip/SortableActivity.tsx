"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Activity } from '@/types';
import { GripVertical, ChevronRight, Utensils, Eye, Sparkles, Truck, Hotel, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  activity: Activity;
  onClick?: () => void;
}

const TYPE_ICONS: Record<Activity["type"], React.ReactNode> = {
  food: <Utensils size={13} />,
  sight: <Eye size={13} />,
  experience: <Sparkles size={13} />,
  transport: <Truck size={13} />,
  lodging: <Hotel size={13} />,
  rest: <Coffee size={13} />,
};

const TYPE_DOT: Record<Activity["type"], string> = {
  food: "bg-amber-500",
  sight: "bg-blue-500",
  experience: "bg-purple-500",
  transport: "bg-slate-400",
  lodging: "bg-emerald-500",
  rest: "bg-rose-400",
};

export function SortableActivity({ activity, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-card rounded-xl border group transition-all duration-200 ${
        isDragging ? "shadow-2xl scale-[1.02] border-primary/30" : "hover:border-primary/20 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-0">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-3 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        {/* Time Column */}
        <div className="flex-shrink-0 w-14 pt-3.5 text-center">
          <p className="text-xs font-mono font-medium text-muted-foreground leading-none">{activity.startTime}</p>
          <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-2 ${TYPE_DOT[activity.type]}`} />
        </div>

        {/* Content */}
        <div className="flex-1 py-3.5 pr-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`text-muted-foreground/60 ${TYPE_DOT[activity.type].replace("bg-", "text-").replace("-500", "-600").replace("-400", "-500")}`}>
                  {TYPE_ICONS[activity.type]}
                </span>
                <h3 className="font-medium text-sm text-primary truncate leading-snug">{activity.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{activity.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span>⏱ {activity.durationMin}m</span>
            {activity.cost.amount > 0 && (
              <span>💰 {activity.cost.amount} {activity.cost.currency}{activity.cost.perPerson ? "/pp" : ""}</span>
            )}
            {activity.cost.amount === 0 && <span className="text-emerald-600 font-medium">Free</span>}
            <span className="truncate">📍 {activity.location.neighborhood || activity.location.address.split(",")[0]}</span>
          </div>
        </div>

        {/* Click to expand */}
        {onClick && (
          <button
            onClick={onClick}
            className="flex-shrink-0 p-3 text-muted-foreground/30 hover:text-primary transition-colors group-hover:text-muted-foreground/60 self-center"
            aria-label="View details"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
