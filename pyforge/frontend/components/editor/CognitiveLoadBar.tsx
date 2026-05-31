"use client";

import { useMemo } from "react";
import { Brain } from "lucide-react";
import { analyzeCognitiveLoad } from "@/lib/learning/cognitive-load";
import { cn } from "@/lib/utils";

export function CognitiveLoadBar({ code }: { code: string }) {
  const load = useMemo(() => analyzeCognitiveLoad(code), [code]);

  const barColor =
    load.level === "low" ? "bg-emerald-500" : load.level === "medium" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="px-4 py-1.5 border-b border-border bg-card/40 flex items-center gap-3 text-xs">
      <Brain className="h-3.5 w-3.5 text-muted shrink-0" />
      <span className="text-muted shrink-0">Load</span>
      <div className="flex-1 h-1.5 rounded-full bg-background overflow-hidden max-w-[120px]">
        <div className={cn("h-full transition-all", barColor)} style={{ width: `${load.score * 10}%` }} />
      </div>
      <span className="font-mono text-muted">{load.score}/10</span>
      <span className="text-muted truncate hidden sm:inline" title={load.tips[0]}>
        {load.tips[0]}
      </span>
    </div>
  );
}
