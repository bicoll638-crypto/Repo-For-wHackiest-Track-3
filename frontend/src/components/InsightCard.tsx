"use client";

import { useState } from "react";
import { Insight } from "@/lib/types";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ShieldAlert,
  Flame,
  Info,
} from "lucide-react";

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  const isCritical = insight.severity === "critical";
  const isWarn = insight.severity === "warn";

  return (
    <div
      className={`rounded-3xl p-5 border transition-all ${
        isCritical
          ? "bg-gradient-to-br from-red-950/25 via-[#141224] to-aura-card border-red-500/30 shadow-lg shadow-red-950/20"
          : isWarn
          ? "bg-gradient-to-br from-amber-950/20 via-[#141525] to-aura-card border-amber-500/25"
          : "bg-aura-card border-aura-border"
      }`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <Flame className="w-4 h-4 text-rose-400" />
          ) : isWarn ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400" />
          )}
          <span
            className={`text-[10px] uppercase font-bold tracking-wider ${
              isCritical
                ? "text-rose-300"
                : isWarn
                ? "text-amber-300"
                : "text-indigo-300"
            }`}
          >
            {isCritical ? "Critical Pattern Detected" : "Predictive Trend Alert"}
          </span>
        </div>

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
            isCritical
              ? "bg-rose-950/70 text-rose-300 border border-rose-500/40"
              : isWarn
              ? "bg-amber-950/70 text-amber-300 border border-amber-500/40"
              : "bg-indigo-950/70 text-indigo-300 border border-indigo-500/40"
          }`}
        >
          {insight.severity}
        </span>
      </div>

      <h3 className="text-sm font-bold text-white mb-3 tracking-tight">
        {insight.title}
      </h3>

      {/* Cause -> Effect Visual Chain */}
      <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
          <span className="text-zinc-400 font-medium text-[11px] shrink-0">Root Cause:</span>
          <span className="text-white font-medium truncate">{insight.cause}</span>
        </div>

        <div className="flex items-center justify-center py-0.5">
          <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-semibold tracking-wider">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>DIRECT CAUSAL LINK</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          <span className="text-zinc-400 font-medium text-[11px] shrink-0">Downstream:</span>
          <span className="text-white font-medium truncate">{insight.effect}</span>
        </div>
      </div>

      {/* Natural language explanation */}
      <p className="text-xs text-zinc-300 leading-relaxed mb-3.5">
        {insight.explanation}
      </p>

      {/* Action Recommendation Box */}
      <div className="p-3 rounded-2xl bg-violet-950/30 border border-violet-500/20 flex items-start gap-2.5 mb-3">
        <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-violet-200 leading-snug">
          <strong className="text-white font-semibold">Recommended Fix: </strong>
          {insight.action}
        </p>
      </div>

      {/* Expand Evidence Events */}
      {insight.evidence_events && insight.evidence_events.length > 0 && (
        <div className="pt-1">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center justify-between w-full py-1 font-medium border-t border-white/5"
          >
            <span>
              {showEvidence
                ? "Hide Historical Evidence"
                : `View Evidence (${insight.evidence_events.length} correlated events)`}
            </span>
            {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEvidence && (
            <div className="mt-2 space-y-1.5 animate-in fade-in">
              {insight.evidence_events.slice(0, 5).map((ev) => (
                <div
                  key={ev.id}
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-zinc-300 flex items-center justify-between"
                >
                  <span className="truncate">{ev.title}</span>
                  <span className="text-zinc-500 shrink-0 ml-2">
                    {ev.amount ? `₹${ev.amount}` : ev.status || ev.event_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
