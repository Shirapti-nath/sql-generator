"use client";

import { useCallback } from "react";
import { parsePythonError } from "@/lib/error-parser";
import { api } from "@/lib/api";
import { useExecutionStore } from "@/stores/executionStore";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";

export function useExecution() {
  const { reset, setRunning, setResult } = useExecutionStore();
  const { setError, clear: clearError } = useErrorAssistantStore();

  const handleError = useCallback(
    (raw: string, codeContext?: string) => {
      const parsed = parsePythonError(raw, codeContext);
      setError(parsed);
      return parsed;
    },
    [setError]
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
          });
        } else {
          setResult({
            stdout: result.stdout,
            stderr: "",
            plots: result.plots || [],
            status: "completed",
            durationMs,
            exitCode: 0,
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
        });
      } finally {
        setRunning(false);
      }
    },
    [reset, clearError, setRunning, setResult, handleError]
  );

  const run = useCallback(
    async (code: string, stdin = "") => {
      try {
        await runServer(code, stdin);
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        handleError(raw, code);
        useExecutionStore.getState().setRunning(false);
      }
    },
    [runServer, handleError]
  );

  return { run, runServer };
}
