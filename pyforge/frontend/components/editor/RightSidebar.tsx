"use client";

import { useState, useEffect } from "react";
import { Bot, ShieldCheck, AlertCircle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorAssistant } from "@/components/editor/ErrorAssistant";
import { QualityPanel } from "@/components/editor/QualityPanel";
import { CopilotPanel } from "@/components/editor/CopilotPanel";
import { LearnPanel } from "@/components/editor/LearnPanel";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";

type Tab = "learn" | "fix" | "quality" | "copilot";

export function RightSidebar() {
  const [tab, setTab] = useState<Tab>("learn");
  const hasError = useErrorAssistantStore((s) => !!s.error);

  useEffect(() => {
    if (hasError) setTab("fix");
  }, [hasError]);

  const tabs: { id: Tab; label: string; icon: typeof Bot; badge?: boolean }[] = [
    { id: "learn", label: "Learn", icon: GraduationCap },
    { id: "fix", label: "Guide", icon: AlertCircle, badge: hasError },
    { id: "quality", label: "Quality", icon: ShieldCheck },
    { id: "copilot", label: "Copilot", icon: Bot },
  ];

  return (
    <aside className="w-80 border-l border-border bg-card/50 flex flex-col shrink-0 hidden lg:flex">
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors relative",
              tab === t.id
                ? "text-accent border-b-2 border-accent bg-accent/5"
                : "text-muted hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.badge && (
              <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "learn" && <LearnPanel />}
        {tab === "copilot" && <CopilotPanel />}
        {tab === "quality" && <QualityPanel />}
        {tab === "fix" && <ErrorAssistant embedded />}
      </div>
    </aside>
  );
}
