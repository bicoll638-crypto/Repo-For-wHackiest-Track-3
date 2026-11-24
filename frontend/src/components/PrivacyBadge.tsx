"use client";

import { useState } from "react";
import { ShieldCheck, Trash2, RotateCcw, X, Lock, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export function PrivacyModal({ isOpen, onClose, onDataChanged }: PrivacyModalProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWipe = async () => {
    if (!confirm("Are you sure you want to permanently erase all personal events?")) return;
    setLoading(true);
    try {
      const res = await api.wipeData();
      setMessage(res.message);
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setMessage("Failed to erase data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    setLoading(true);
    try {
      const res = await api.reseedDemoData();
      setMessage(res.message);
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setMessage("Failed to reseed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-[#121627] border border-aura-border p-5 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3 text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="text-base font-bold text-white">Your Data Stays Yours</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-4">
          AURA processes all financial UPI records, sleep metrics, and academic timetables
          strictly on your local machine in SQLite. Zero cloud telemetry. Zero personal data selling.
        </p>

        <div className="space-y-2 mb-5">
          <div className="flex items-start gap-2 text-[11px] text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
            <span>Local SQLite database with instant one-click purge.</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <span>Voice processing uses browser-native Web Speech API with 0 external API calls.</span>
          </div>
        </div>

        {message && (
          <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-[11px] text-indigo-200 mb-4 animate-in fade-in">
            {message}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleWipe}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {loading ? "Processing..." : "Delete All My Data"}
          </button>

          <button
            onClick={handleReseed}
            disabled={loading}
            className="w-full py-2 px-3 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {loading ? "Processing..." : "Reset 30-Day Demo Data (Arjun)"}
          </button>
        </div>
      </div>
    </div>
  );
}
