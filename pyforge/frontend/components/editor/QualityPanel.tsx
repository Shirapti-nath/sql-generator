"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, AlertTriangle, Info, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeCodeQuality, type QualitySuggestion } from "@/lib/code-quality";
import { useEditorStore } from "@/stores/editorStore";

export function QualityPanel() {
  const code = useEditorStore((s) => {
    const f = s.files.find((file) => file.name === s.activeFile);
    return f?.content ?? "";
  });
  const [suggestions, setSuggestions] = useState<QualitySuggestion[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setSuggestions(analyzeCodeQuality(code));
    setLoading(true);
    try {
      const res = await fetch("/api/ai/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.suggestions) setSuggestions(data.suggestions);
      setAiSummary(data.ai_summary);
    } catch {
      /* static only */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(analyze, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const icon = (s: QualitySuggestion["severity"]) => {
    if (s === "warning") return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    if (s === "tip") return <Lightbulb className="h-3.5 w-3.5 text-accent" />;
    return <Info className="h-3.5 w-3.5 text-blue-400" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Code Quality</span>
        </div>
        <Button variant="ghost" size="sm" onClick={analyze} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {aiSummary && (
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 mb-3">
            <p className="text-[10px] font-semibold text-accent uppercase mb-1">AI Review</p>
            <p className="text-xs whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
          </div>
        )}

        {suggestions.map((s) => (
          <div
            key={s.id}
            className="flex gap-2 p-2.5 rounded-lg border border-border bg-background text-xs"
          >
            <div className="shrink-0 mt-0.5">{icon(s.severity)}</div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {s.title}
                {s.line && (
                  <span className="text-[10px] text-muted font-mono">L{s.line}</span>
                )}
              </div>
              <p className="text-muted mt-0.5 leading-relaxed">{s.message}</p>
              <span className="text-[10px] text-muted/70 uppercase">{s.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
