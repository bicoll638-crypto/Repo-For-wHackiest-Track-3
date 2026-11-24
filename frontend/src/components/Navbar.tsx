"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, Database } from "lucide-react";

interface NavbarProps {
  onOpenPrivacy?: () => void;
}

export function Navbar({ onOpenPrivacy }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0B0D17]/80 border-b border-aura-border px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-aura-primary via-indigo-500 to-aura-accent flex items-center justify-center shadow-lg shadow-aura-primary/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              AURA
            </span>
            <span className="text-[10px] block -mt-1 font-medium text-indigo-400/80">
              Personal Data Twin
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Demo Mode Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-[11px] text-indigo-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Arjun (2nd Yr)
          </div>

          {/* Privacy Badge */}
          <button
            onClick={onOpenPrivacy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-950/50 border border-violet-500/30 text-[11px] text-violet-300 hover:bg-violet-900/60 transition-colors"
            title="Data Sovereignty & Local Privacy"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Local & Private</span>
          </button>
        </div>
      </div>
    </header>
  );
}
