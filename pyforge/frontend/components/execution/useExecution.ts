"use client";

import { useCallback } from "react";
import { parsePythonError } from "@/lib/error-parser";
import { api } from "@/lib/api";
import { detectExecutionMode } from "@/lib/execution-router";
import { isVercelDeployment } from "@/lib/is-vercel";
import { runPythonInBrowser } from "@/lib/pyodide-runner";
import { analyzeBeforeRun } from "@/lib/learning/pre-run-analyzer";
import { useExecutionStore } from "@/stores/executionStore";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { useLearningStore } from "@/stores/learningStore";
import { drillsForErrorType } from "@/lib/learning/drills";

const forceBrowser = isVercelDeployment();

export function useExecution() {
  const { reset, setRunning, setResult } = useExecutionStore();
  const { setError, clear: clearError } = useErrorAssistantStore();
  const { recordRun, recordError, setLastStoryboardCode, scheduleReview } = useLearningStore();

  const handleError = useCallback(
    (raw: string, codeContext?: string) => {
      const parsed = parsePythonError(raw, codeContext);
      setError(parsed);
      recordError(parsed.type);
      const drill = drillsForErrorType(parsed.type)[0];
      if (drill) scheduleReview(drill.id);
      return parsed;
    },
    [setError, recordError, scheduleReview]
  );

  const runBrowser = useCallback(
    async (code: string) => {
      setResult({ mode: "browser", status: "running" });
      const result = await runPythonInBrowser(code);

      if (result.exit_code !== 0) {
        handleError(result.stderr, code);
        setResult({
          stdout: result.stdout,
          stderr: result.stderr,
          plots: result.plots,
          status: "error",
          durationMs: result.duration_ms,
          exitCode: result.exit_code,
          mode: "browser",
        });
      } else {
        setResult({
          stdout: result.stdout,
          stderr: "",
          plots: result.plots,
          status: "completed",
          durationMs: result.duration_ms,
          exitCode: 0,
          mode: "browser",
        });
      }
    },
    [handleError, setResult]
  );

  const runServer = useCallback(
    async (code: string, stdin = "") => {
      const start = performance.now();
      reset();
      clearError();
      setRunning(true);
      setResult({ mode: "server", status: "running" });

      try {
        const result = await api.execute(code, stdin);
        const durationMs = result.duration_ms || Math.round(performance.now() - start);

        if (result.exit_code !== 0 || result.stderr) {
          const raw = result.stderr || "Execution failed";
          handleError(raw, code);
          setResult({
            stdout: result.stdout,
            stderr: raw,
            plots: result.plots || [],
            status: "error",
            durationMs,
            exitCode: result.exit_code,
            mode: "server",
          });
        } else {
          setResult({
            stdout: result.stdout,
            stderr: "",
            plots: result.plots || [],
            status: "completed",
            durationMs,
            exitCode: 0,
            mode: "server",
          });
        }
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        handleError(raw, code);
        setResult({
          stderr: raw,
          status: "error",
          durationMs: Math.round(performance.now() - start),
          exitCode: 1,
          mode: "server",
        });
      } finally {
        setRunning(false);
      }
    },
    [reset, clearError, setRunning, setResult, handleError]
  );

  const run = useCallback(
    async (code: string, stdin = "") => {
      const preWarnings = analyzeBeforeRun(code);
      const hadPreRunWarning = preWarnings.some((w) => w.severity === "error");

      setLastStoryboardCode(code);
      reset();
      clearError();
      setRunning(true);

      try {
        const mode = detectExecutionMode(code, forceBrowser);
        if (mode === "browser") {
          await runBrowser(code);
        } else {
          await runServer(code, stdin);
          return;
        }
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        handleError(raw, code);
        setResult({
          stderr: raw,
          status: "error",
          exitCode: 1,
        });
      } finally {
        setRunning(false);
        const status = useExecutionStore.getState().output.status;
        recordRun(status === "completed", hadPreRunWarning);
      }
    },
    [
      reset,
      clearError,
      setRunning,
      setResult,
      runBrowser,
      runServer,
      handleError,
      recordRun,
      setLastStoryboardCode,
    ]
  );

  return { run, runServer };
}
