"use client";

import { AlertCircle, Lightbulb, Wrench, CheckCircle2, BookOpen } from "lucide-react";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";

export function ErrorAssistant({ embedded = false }: { embedded?: boolean }) {
  const { error } = useErrorAssistantStore();

  const wrapper = embedded
    ? "w-full flex flex-col h-full"
    : "w-80 border-l border-border bg-card/50 flex flex-col hidden lg:flex";

  if (!error) {
    return (
      <aside className={wrapper}>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            Error Guide
          </h2>
          <p className="text-xs text-muted mt-1">Run code — errors are explained here with concepts and fixes.</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted text-sm">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-accent/40" />
            <p>No errors detected.</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${embedded ? "w-full h-full" : "w-80 border-l border-border"} bg-card flex flex-col overflow-hidden`}>
      <div className="p-4 border-b border-red-500/30 bg-red-500/5">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-red-400">{error.type}</h2>
            {error.line && (
              <p className="text-xs text-muted mt-0.5">
                Line <span className="text-amber-400 font-mono font-bold">{error.line}</span>
              </p>
            )}
          </div>
        </div>
        <p className="text-sm mt-2 font-mono text-foreground/90 break-words">{error.message}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Concept
          </h3>
          <p className="text-sm leading-relaxed">{error.explanation}</p>
        </section>

        <section className="rounded-lg border border-accent/30 bg-accent/5 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 flex items-center gap-1">
            <Wrench className="h-3.5 w-3.5" /> How to fix
          </h3>
          <p className="text-sm leading-relaxed">{error.howToFix}</p>
        </section>

        {error.example && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Correct example</h3>
            <pre className="text-xs font-mono bg-background rounded-lg p-3 border border-border overflow-x-auto text-emerald-400/90 whitespace-pre-wrap">
              {error.example}
            </pre>
          </section>
        )}

        {error.line && (
          <p className="text-xs text-amber-400/80 border-t border-border pt-3">
            The highlighted line in the editor marks where Python reported the problem.
          </p>
        )}
      </div>
    </aside>
  );
}
