"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { InsightCard } from "@/components/InsightCard";
import { PrivacyModal } from "@/components/PrivacyBadge";
import { api } from "@/lib/api";
import { Insight } from "@/lib/types";
import { BrainCircuit, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getInsights();
      setInsights(res);
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenPrivacy={() => setPrivacyOpen(true)} />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
              <BrainCircuit className="w-4 h-4 text-aura-primary" />
              <span>Cause-and-Effect Engine</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
              Cross-Domain Intelligence
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Discovering non-obvious correlations between budget, sleep, and grades
            </p>
          </div>

          <button
            onClick={loadInsights}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-aura-primary" : ""}`} />
          </button>
        </div>

        {/* USP Callout */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-aura-card border border-violet-500/30 text-xs text-zinc-300">
          <p className="font-semibold text-white mb-0.5">
            USP: Proactive & Predictive, not a passive PDF chat.
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Pure function detectors analyze multi-variable time series to identify behavioral loops
            before they turn into missed exams or financial crunches.
          </p>
        </div>

        {/* Insight Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="p-10 rounded-3xl bg-aura-card border border-aura-border text-center text-xs text-zinc-500">
            No active correlation chains found.
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        )}
      </div>

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onDataChanged={loadInsights}
      />
    </div>
  );
}
