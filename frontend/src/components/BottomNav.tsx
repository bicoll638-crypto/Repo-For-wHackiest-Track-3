"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, UploadCloud, CalendarDays, BrainCircuit, HelpCircle } from "lucide-react";
import clsx from "clsx";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Twin", href: "/", icon: Sparkles },
    { label: "Upload", href: "/upload", icon: UploadCloud },
    { label: "Timeline", href: "/timeline", icon: CalendarDays },
    { label: "Insights", href: "/insights", icon: BrainCircuit },
    { label: "What-If", href: "/whatif", icon: HelpCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0D17]/90 backdrop-blur-xl border-t border-aura-border pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative",
                isActive
                  ? "text-aura-primary font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-aura-primary to-aura-accent shadow-[0_0_10px_#8B5CF6]" />
              )}
              <Icon className={clsx("w-5 h-5 mb-0.5", isActive && "text-aura-primary scale-110")} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
