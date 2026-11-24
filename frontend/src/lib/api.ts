import {
  LifeEvent,
  Insight,
  BudgetSummary,
  Briefing,
  WhatIfResponse,
  IngestResponse,
  HealthResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errorText}`);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`Request failed for ${fullUrl}:`, err);
    throw err;
  }
}

export const api = {
  getHealth: () => fetchJson<HealthResponse>("/api/health"),

  getEvents: (eventType?: string, limit: number = 100) => {
    const query = new URLSearchParams();
    if (eventType && eventType !== "all") query.append("event_type", eventType);
    query.append("limit", limit.toString());
    return fetchJson<LifeEvent[]>(`/api/events?${query.toString()}`);
  },

  getInsights: () => fetchJson<Insight[]>("/api/insights"),

  getBudgetSummary: () => fetchJson<BudgetSummary>("/api/insights/budget"),

  getBriefing: () => fetchJson<Briefing>("/api/briefing"),

  askWhatIf: (question: string) =>
    fetchJson<WhatIfResponse>("/api/whatif", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }),

  ingestText: (text: string, source: string = "quick_note") =>
    fetchJson<IngestResponse>("/api/ingest/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, source }),
    }),

  ingestVoice: (transcript: string) =>
    fetchJson<IngestResponse>("/api/ingest/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    }),

  ingestFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchJson<IngestResponse>("/api/ingest/file", {
      method: "POST",
      body: formData,
    });
  },

  wipeData: () =>
    fetchJson<{ status: string; deleted_events_count: number; message: string }>(
      "/api/privacy/wipe",
      { method: "DELETE" }
    ),

  reseedDemoData: () =>
    fetchJson<{ status: string; deleted_events_count: number; message: string }>(
      "/api/privacy/seed",
      { method: "POST" }
    ),
};
