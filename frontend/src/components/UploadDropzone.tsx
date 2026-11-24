"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, Sparkles, Send, Tag, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { LifeEvent } from "@/lib/types";

interface UploadDropzoneProps {
  onEventsIngested?: (events: LifeEvent[]) => void;
}

export function UploadDropzone({ onEventsIngested }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [textNote, setTextNote] = useState("");
  const [parsedChips, setParsedChips] = useState<LifeEvent[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setExtracting(true);
    setStatusMessage(`Scanning '${file.name}' with OCR & visual parser...`);

    try {
      const res = await api.ingestFile(file);
      setParsedChips((prev) => [...res.parsed_events, ...prev]);
      setStatusMessage(res.message);
      if (onEventsIngested) onEventsIngested(res.parsed_events);
    } catch (err: any) {
      setStatusMessage(`Extraction error: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textNote.trim()) return;
    setExtracting(true);
    setStatusMessage("Parsing natural language note into twin parameters...");

    try {
      const res = await api.ingestText(textNote);
      setParsedChips((prev) => [...res.parsed_events, ...prev]);
      setStatusMessage(res.message);
      setTextNote("");
      if (onEventsIngested) onEventsIngested(res.parsed_events);
    } catch (err: any) {
      setStatusMessage(`Parse error: ${err.message}`);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
          isDragging
            ? "border-aura-primary bg-aura-primary/10 scale-[1.01]"
            : "border-white/15 bg-aura-card hover:border-aura-primary/50 hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-aura-primary/20 to-indigo-500/20 border border-aura-primary/30 flex items-center justify-center text-aura-primary">
            {extracting ? (
              <Sparkles className="w-6 h-6 animate-spin text-aura-accent" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">
              {extracting ? "Extracting Data Twin Signals..." : "Upload UPI Screenshot or Timetable PDF"}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Drag & drop or tap to browse • UPI receipts, class timetables, sleep logs
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              GPay / PhonePe / Zomato
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              PDF Timetables
            </span>
          </div>
        </div>

        {extracting && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 p-4 animate-in fade-in">
            <span className="w-8 h-8 border-2 border-aura-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-indigo-300 animate-pulse">
              Running mock multi-modal document extraction...
            </p>
          </div>
        )}
      </div>

      {/* Quick Text / Voice Note Input */}
      <div className="rounded-2xl p-3.5 bg-aura-card border border-aura-border">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-white">Quick Text Note Ingestion</span>
        </div>
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <input
            type="text"
            value={textNote}
            onChange={(e) => setTextNote(e.target.value)}
            placeholder="e.g. Spent 120 on snacks after late lab"
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-aura-primary"
          />
          <button
            type="submit"
            disabled={extracting || !textNote.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-aura-primary to-indigo-600 text-white font-medium text-xs flex items-center gap-1.5 hover:opacity-95 disabled:opacity-50 transition-all shadow-md shadow-aura-primary/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ingest</span>
          </button>
        </form>

        {/* Example prompts */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {[
            "Spent 120 on snacks after late lab",
            "Slept 5 hours feeling exhausted",
            "Skipped 8:30 OS class",
            "Paid 350 for Uber to campus",
          ].map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => setTextNote(sample)}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              + {sample}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Extracted Event Chips */}
      {parsedChips.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              Recently Extracted Events ({parsedChips.length})
            </span>
            <span className="text-[10px] text-zinc-500">Auto-saved to local twin</span>
          </div>

          <div className="grid gap-2">
            {parsedChips.map((chip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 animate-in fade-in"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0 uppercase">
                    {chip.event_type.slice(0, 2)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-medium text-white truncate">{chip.title}</p>
                    <p className="text-[10px] text-zinc-400">
                      {chip.event_type.toUpperCase()} • {chip.category || chip.subject || "General"}
                      {chip.amount ? ` • ₹${chip.amount}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                    {Math.round(chip.confidence_score * 100)}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
