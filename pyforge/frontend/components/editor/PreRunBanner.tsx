"use client";

import { useMemo } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { analyzeBeforeRun } from "@/lib/learning/pre-run-analyzer";
import { cn } from "@/lib/utils";

interface PreRunBannerProps {
  code: string;
  onDismiss?: () => void;
}

export function PreRunBanner({ code }: PreRunBannerProps) {
  const warnings = useMemo(() => analyzeBeforeRun(code), [code]);
  const errors = warnings.filter((w) => w.severity === "error");
  const others = warnings.filter((w) => w.severity !== "error");

  if (warnings.length === 0) return null;

  return (
    <div className="border-b border-border bg-card/60 px-4 py-2 space-y-1.5 max-h-32 overflow-y-auto">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        Before you run — predicted issues
      </p>
      {errors.map((w) => (
        <div key={w.id} className="flex gap-2 text-xs text-red-400">
          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>{w.title}</strong>
            {w.line ? ` (line ${w.line})` : ""}: {w.message}
            {w.fix && (
              <span className="block mt-0.5 font-mono text-emerald-400/90">→ {w.fix}</span>
            )}
          </span>
        </div>
      ))}
      {others.map((w) => (
        <div
          key={w.id}
          className={cn(
            "flex gap-2 text-xs",
            w.severity === "warning" ? "text-amber-400" : "text-muted"
          )}
        >
          {w.severity === "warning" ? (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          )}
          <span>{w.title}: {w.message}</span>
        </div>
      ))}
    </div>
  );
}
