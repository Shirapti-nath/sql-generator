"use client";

import {
  AlertCircle,
  Lightbulb,
  Wrench,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { conceptsForError } from "@/lib/learning/concepts";

export function ErrorAssistant({ embedded = false }: { embedded?: boolean }) {
  const { error } = useErrorAssistantStore();

  const wrapper = embedded
    ? "w-full flex flex-col h-full"
    : "w-80 border-l border-border bg-card/50 flex flex-col hidden lg:flex";

  const speakExplanation = () => {
    if (!error || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = `${error.type}. ${error.message}. ${error.explanation}. How to fix: ${error.howToFix}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  if (!error) {
    return (
      <aside className={wrapper}>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" />
            Error Guide
          </h2>
          <p className="text-xs text-muted mt-1">
            Run code — errors are explained here with concepts, suggestions, and fixes.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-muted text-sm">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-accent/40" />
            <p>No errors detected.</p>
            <p className="text-xs mt-2">Pre-run checks appear above the editor when we spot issues early.</p>
          </div>
        </div>
      </aside>
    );
  }

  const relatedConcepts = conceptsForError(error.type);

  return (
    <aside
      className={`${embedded ? "w-full h-full" : "w-80 border-l border-border"} bg-card flex flex-col overflow-hidden`}
    >
      <div className="p-4 border-b border-red-500/30 bg-red-500/5">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-red-400">{error.type}</h2>
            {error.line && (
              <p className="text-xs text-muted mt-0.5">
                Line <span className="text-amber-400 font-mono font-bold">{error.line}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={speakExplanation}
            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
            title="Read explanation aloud"
            aria-label="Read explanation aloud"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm mt-2 font-mono text-foreground/90 break-words">{error.message}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Concept
          </h3>
          <p className="text-sm leading-relaxed">{error.explanation}</p>
          {relatedConcepts.length > 0 && (
            <ul className="mt-2 space-y-1">
              {relatedConcepts.map((c) => (
                <li key={c.id} className="text-xs text-muted">
                  <span className="text-accent">{c.title}</span> — {c.description}
                </li>
              ))}
            </ul>
          )}
        </section>

        {error.suggestions && error.suggestions.length > 0 && (
          <section className="rounded-lg border border-border p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Suggestions
            </h3>
            <ul className="text-sm space-y-1.5 list-disc list-inside text-foreground/90">
              {error.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-lg border border-accent/30 bg-accent/5 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 flex items-center gap-1">
            <Wrench className="h-3.5 w-3.5" /> How to fix
          </h3>
          <p className="text-sm leading-relaxed">{error.howToFix}</p>
        </section>

        {error.example && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              Correct example
            </h3>
            <pre className="text-xs font-mono bg-background rounded-lg p-3 border border-border overflow-x-auto text-emerald-400/90 whitespace-pre-wrap">
              {error.example}
            </pre>
          </section>
        )}

        {error.line && (
          <p className="text-xs text-amber-400/80 border-t border-border pt-3">
            The highlighted line in the editor marks where Python reported the problem. Open the{" "}
            <strong>Learn</strong> tab for practice drills on this error type.
          </p>
        )}
      </div>
    </aside>
  );
}
