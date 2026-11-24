"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { BriefingPlayer } from "@/components/BriefingPlayer";
import { BudgetRing } from "@/components/BudgetRing";
import { InsightCard } from "@/components/InsightCard";
import { PrivacyModal } from "@/components/PrivacyBadge";
import { api } from "@/lib/api";
import { Briefing, BudgetSummary, Insight } from "@/lib/types";
import { BrainCircuit, Sparkles, Calendar, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [budget, setBudget] = useState<BudgetSummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [briefingRes, budgetRes, insightsRes] = await Promise.all([
        api.getBriefing(),
        api.getBudgetSummary(),
        api.getInsights(),
      ]);
      setBriefing(briefingRes);
      setBudget(budgetRes);
      setInsights(insightsRes);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenPrivacy={() => setPrivacyOpen(true)} />

      <div className="p-4 space-y-5">
        {/* Student Persona Greeting */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Bengaluru • 2nd Year CSE</span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
              Hey Arjun 👋
            </h1>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Refresh Twin"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-aura-primary" : ""}`} />
          </button>
        </div>

        {/* 60s Voice Briefing Centerpiece */}
        <BriefingPlayer briefing={briefing} loading={loading} />

        {/* Budget Burn Ring */}
        <BudgetRing budget={budget} loading={loading} />

        {/* Top Cause-and-Effect Insight Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-aura-primary" />
              <h3 className="text-sm font-bold text-white">Active Predictive Insights</h3>
            </div>
            <Link
              href="/insights"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>See all ({insights.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : insights.length === 0 ? (
            <div className="p-8 rounded-3xl bg-aura-card border border-aura-border text-center text-xs text-zinc-500">
              No predictive patterns detected yet.
            </div>
          ) : (
            insights.slice(0, 3).map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))
          )}
        </div>

        {/* Quick Shortcut Banners */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Link
            href="/whatif"
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-aura-card border border-aura-border hover:border-aura-primary/50 transition-all flex flex-col justify-between"
          >
            <Sparkles className="w-4 h-4 text-aura-accent mb-2" />
            <div>
              <p className="text-xs font-bold text-white">What-If Lab</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Test scenario impacts</p>
            </div>
          </Link>

          <Link
            href="/upload"
            className="p-3 rounded-2xl bg-gradient-to-br from-violet-950/40 to-aura-card border border-aura-border hover:border-aura-primary/50 transition-all flex flex-col justify-between"
          >
            <Calendar className="w-4 h-4 text-indigo-400 mb-2" />
            <div>
              <p className="text-xs font-bold text-white">Add Signals</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">UPI, sleep & notes</p>
            </div>
          </Link>
        </div>
      </div>

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        onDataChanged={loadData}
      />
    </div>
  );
}
