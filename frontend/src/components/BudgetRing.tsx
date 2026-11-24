"use client";

import { BudgetSummary } from "@/lib/types";
import { AlertTriangle, TrendingDown, Wallet, Calendar } from "lucide-react";

interface BudgetRingProps {
  budget: BudgetSummary | null;
  loading?: boolean;
}

export function BudgetRing({ budget, loading }: BudgetRingProps) {
  if (loading || !budget) {
    return (
      <div className="rounded-2xl p-4 bg-aura-card border border-aura-border animate-pulse h-48 flex items-center justify-center">
        <span className="text-xs text-zinc-500">Loading wallet dynamics...</span>
      </div>
    );
  }

  const percentage = Math.min(100, Math.round((budget.total_spent / budget.monthly_budget) * 100));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isCritical = budget.status === "critical_burn" || budget.days_early > 0;

  return (
    <div className="rounded-2xl p-4 bg-aura-card border border-aura-border backdrop-blur-md relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Monthly Budget Twin</h3>
            <p className="text-[11px] text-zinc-400">₹6,000 Student Allowance</p>
          </div>
        </div>

        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            isCritical
              ? "bg-red-950/60 text-red-300 border-red-500/40"
              : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
          }`}
        >
          {isCritical ? "Early Depletion Alert" : "On Track"}
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Radial SVG Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-zinc-800"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className={isCritical ? "text-rose-500" : "text-aura-primary"}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-lg font-black tracking-tight text-white">{percentage}%</span>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400">Spent</span>
          </div>
        </div>

        {/* Stats Column */}
        <div className="flex-1 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">Spent So Far</span>
            <span className="text-sm font-bold text-white">₹{budget.total_spent.toLocaleString()}</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">Remaining</span>
            <span className="text-sm font-bold text-emerald-400">
              ₹{budget.remaining_budget.toLocaleString()}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-[11px] text-zinc-400 border-t border-white/5 pt-1.5">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-400" />
              Daily Burn
            </span>
            <span className="font-semibold text-rose-300">
              ₹{Math.round(budget.burn_rate_daily)}/day
            </span>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {isCritical && (
        <div className="mt-3.5 p-2 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent border border-red-500/25 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-[11px] text-red-200 leading-tight">
            Projected run out on the <strong className="text-white">24th</strong> (
            <strong className="text-white">6 days early</strong>). Cap today to ₹120.
          </p>
        </div>
      )}
    </div>
  );
}
