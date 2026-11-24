import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { VoiceOrb } from "@/components/VoiceOrb";

export const metadata: Metadata = {
  title: "AURA: Your Voice-First Personal Data Twin",
  description:
    "Proactive, voice-first personal intelligence assistant for college students. Hackathon Track 3: Know Thyself.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0D17",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0B0D17] text-white selection:bg-aura-primary selection:text-white">
        <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-24 shadow-2xl bg-[#0B0D17] border-x border-aura-border/40">
          <main className="flex-1">{children}</main>
          <VoiceOrb />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
