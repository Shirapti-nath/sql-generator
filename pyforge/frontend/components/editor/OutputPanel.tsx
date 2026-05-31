"use client";

import { useMemo } from "react";
import { useExecutionStore } from "@/stores/executionStore";
import { useEditorStore } from "@/stores/editorStore";
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, Clock, BarChart3, FlaskConical } from "lucide-react";
import { diagnosePlotCode } from "@/lib/learning/plot-diagnostics";
import { friendlyError } from "@/lib/error-parser";
import { useEliteFeaturesStore } from "@/stores/eliteFeaturesStore";

export function OutputPanel() {
  const { output, isRunning } = useExecutionStore();
  const code = useEditorStore((s) => s.getActiveContent());
  const counterfactual = useEliteFeaturesStore((s) => s.counterfactual);

  const plotTips = useMemo(
    () => diagnosePlotCode(code, output.plots.length),
    [code, output.plots.length]
  );

  const friendlyStderr =
    output.status === "error" && output.stderr
      ? friendlyError(output.stderr)
      : output.stderr;

  return (
    <div className="flex flex-col h-full bg-[var(--editor-bg)] border-t border-border">
      <TabsRoot defaultValue="output" className="h-full">
        <TabsList>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
          {counterfactual && <TabsTrigger value="counterfactual">What-if</TabsTrigger>}
          {output.plots.length > 0 && <TabsTrigger value="plots">Plots</TabsTrigger>}
        </TabsList>

        <TabsContent value="output" className="h-[calc(100%-40px)] overflow-auto p-4">
          {isRunning && (
            <div className="flex items-center gap-2 text-muted mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </div>
          )}
          {plotTips.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {plotTips.map((tip) => (
                <div
                  key={tip.id}
                  className={cn(
                    "flex gap-2 text-xs p-2 rounded-lg border",
                    tip.severity === "warning"
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                      : "border-border text-muted"
                  )}
                >
                  <BarChart3 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>
                    <strong>{tip.title}</strong> — {tip.message}
                  </span>
                </div>
              ))}
            </div>
          )}
          {output.stdout && (
            <pre className="font-mono text-sm text-emerald-400 whitespace-pre-wrap">{output.stdout}</pre>
          )}
          {friendlyStderr && (
            <pre className="font-mono text-sm text-red-400/90 whitespace-pre-wrap mt-2">{friendlyStderr}</pre>
          )}
          {!output.stdout && !friendlyStderr && !isRunning && (
            <p className="text-muted text-sm">
              Run your code to see output here. Errors open in the <strong>Guide</strong> sidebar with explanations.
            </p>
          )}
        </TabsContent>

        <TabsContent value="terminal" className="h-[calc(100%-40px)] overflow-auto p-4">
          <pre className="font-mono text-sm whitespace-pre-wrap">
            {output.stdout || output.stderr || "No terminal output yet."}
          </pre>
        </TabsContent>

        <TabsContent value="counterfactual" className="h-[calc(100%-40px)] overflow-auto p-4">
          {counterfactual && (
            <div className="space-y-3 text-xs">
              <p className="flex items-center gap-1 text-accent">
                <FlaskConical className="h-3.5 w-3.5" /> {counterfactual.description}
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-muted mb-1">Your code (failed)</p>
                  <pre className="font-mono text-red-400/90 bg-background p-2 rounded border whitespace-pre-wrap">
                    {counterfactual.originalStdout || "(no output)"}
                  </pre>
                </div>
                <div>
                  <p className="text-muted mb-1">
                    Shadow fix {counterfactual.patchedSucceeded ? "✓" : "…"}
                  </p>
                  <pre className="font-mono text-emerald-400/90 bg-background p-2 rounded border whitespace-pre-wrap">
                    {counterfactual.patchedStdout || "(no output)"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="plots" className="h-[calc(100%-40px)] overflow-auto p-4">
          <div className="flex flex-wrap gap-4">
            {output.plots.map((plot, i) => (
              <img
                key={i}
                src={`data:image/png;base64,${plot}`}
                alt={`Plot ${i + 1}`}
                className="max-w-full rounded-lg border border-border"
              />
            ))}
          </div>
        </TabsContent>
      </TabsRoot>

      <StatusBar />
    </div>
  );
}

function StatusBar() {
  const { output, isRunning } = useExecutionStore();

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 border-t border-border bg-background text-xs text-muted">
      {output.mode && (
        <span
          className={cn(
            "px-2 py-0.5 rounded",
            output.mode === "browser" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
          )}
        >
          {output.mode === "browser" ? "instant" : "server"}
        </span>
      )}
      {output.status === "completed" && (
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="h-3 w-3" /> Done
        </span>
      )}
      {output.status === "error" && (
        <span className="flex items-center gap-1 text-red-400">
          <XCircle className="h-3 w-3" /> See Guide tab →
        </span>
      )}
      {output.durationMs > 0 && (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {output.durationMs}ms
        </span>
      )}
      <span className="ml-auto">Python 3.12</span>
    </div>
  );
}
