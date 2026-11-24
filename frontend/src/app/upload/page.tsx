"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { UploadDropzone } from "@/components/UploadDropzone";
import { PrivacyModal } from "@/components/PrivacyBadge";
import { UploadCloud, CheckCircle2, ShieldCheck, Info } from "lucide-react";
import { LifeEvent } from "@/lib/types";

export default function UploadPage() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [ingestedCount, setIngestedCount] = useState(0);

  const handleEventsIngested = (events: LifeEvent[]) => {
    setIngestedCount((prev) => prev + events.length);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenPrivacy={() => setPrivacyOpen(true)} />

      <div className="p-4 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <UploadCloud className="w-4 h-4 text-aura-primary" />
            <span>Multimodal Ingestion</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
            Ingest Student Data
          </h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Upload UPI payment receipts, academic timetable PDFs, or speak quick notes.
            Parsed into structured events with confidence scoring.
          </p>
        </div>

        {/* Feature Highlights Banner */}
        <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5 text-[11px] text-zinc-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Mock OCR parser extracts vendor, amount, time, and confidence</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Natural language regex parses voice notes into expense/class/sleep</span>
          </div>
        </div>

        {/* Upload Component */}
        <UploadDropzone onEventsIngested={handleEventsIngested} />
      </div>

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </div>
  );
}
