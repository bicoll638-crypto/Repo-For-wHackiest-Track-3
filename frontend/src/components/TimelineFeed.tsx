"use client";

import { useState } from "react";
import { LifeEvent, EventType } from "@/lib/types";
import {
  CreditCard,
  GraduationCap,
  Moon,
  Timer,
  AlertCircle,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface TimelineFeedProps {
  events: LifeEvent[];
  loading?: boolean;
}

export function TimelineFeed({ events, loading }: TimelineFeedProps) {
  const [filter, setFilter] = useState<string>("all");

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "expense", label: "Spends" },
    { id: "class", label: "Classes" },
    { id: "sleep", label: "Sleep" },
    { id: "study", label: "Study" },
    { id: "deadline", label: "Deadlines" },
  ];

  const filtered = filter === "all" ? events : events.filter((e) => e.event_type === filter);

  if (loading) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const getEventIcon = (event: LifeEvent) => {
    switch (event.event_type) {
      case "expense":
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      case "class":
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case "sleep":
        return <Moon className="w-4 h-4 text-violet-400" />;
      case "study":
        return <Timer className="w-4 h-4 text-emerald-400" />;
      case "deadline":
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <GraduationCap className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === tab.id
                ? "bg-aura-primary text-white shadow-md shadow-aura-primary/30"
                : "bg-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-xs">
            No events found for this category.
          </div>
        ) : (
          filtered.map((item) => {
            const isMissed = item.status === "missed";
            const isLate = item.status === "late";
            const isLowSleep = item.status === "low_sleep";
            const isAbandoned = item.status === "abandoned";

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl bg-aura-card border transition-all flex items-start justify-between gap-3 ${
                  isMissed || isAbandoned
                    ? "border-red-500/30 bg-red-950/10"
                    : isLate || isLowSleep
                    ? "border-amber-500/25 bg-amber-950/10"
                    : "border-aura-border hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5 shrink-0 mt-0.5">
                    {getEventIcon(item)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white leading-tight truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {formatTimestamp(item.timestamp)}
                      {item.merchant && ` • ${item.merchant}`}
                      {item.subject && ` • ${item.subject}`}
                      {item.duration_minutes && ` • ${Math.round(item.duration_minutes / 60 * 10) / 10}h`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  {item.amount && (
                    <span className="text-xs font-bold text-white tracking-tight">
                      ₹{item.amount.toLocaleString()}
                    </span>
                  )}

                  {item.status && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 ${
                        isMissed || isAbandoned
                          ? "bg-red-950 text-red-300 border border-red-500/30"
                          : isLate || isLowSleep
                          ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
