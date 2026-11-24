"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { WhatIfPanel } from "@/components/WhatIfPanel";
import { PrivacyModal } from "@/components/PrivacyBadge";
import { HelpCircle, Sparkles } from "lucide-react";

export default function WhatIfPage() {
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenPrivacy={() => setPrivacyOpen(true)} />

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <Sparkles className="w-4 h-4 text-aura-accent" />
            <span>Prospective Reasoning Engine</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
            What-If Simulator
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Test any proposed action before doing it. AURA calculates cross-impacts
            on your ₹1,231 remaining budget, 8:30 AM attendance, and OS Mid-Term.
          </p>
        </div>

        <WhatIfPanel />
      </div>

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </div>
  );
}
