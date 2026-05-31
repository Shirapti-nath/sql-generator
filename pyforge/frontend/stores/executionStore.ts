"use client";

import { create } from "zustand";

export interface ExecutionOutput {
  stdout: string;
  stderr: string;
  plots: string[];
  status: "idle" | "running" | "completed" | "error" | "timeout";
  mode: "browser" | "server" | null;
  durationMs: number;
  exitCode: number;
}

interface ExecutionState {
  output: ExecutionOutput;
  isRunning: boolean;
  setRunning: (running: boolean) => void;
  reset: () => void;
  appendStdout: (text: string) => void;
  appendStderr: (text: string) => void;
  addPlot: (base64: string) => void;
  setResult: (partial: Partial<ExecutionOutput>) => void;
}

const initialOutput: ExecutionOutput = {
  stdout: "",
  stderr: "",
  plots: [],
  status: "idle",
  mode: null,
  durationMs: 0,
  exitCode: 0,
};

export const useExecutionStore = create<ExecutionState>((set) => ({
  output: { ...initialOutput },
  isRunning: false,

  setRunning: (running) => set({ isRunning: running }),

  reset: () => set({ output: { ...initialOutput }, isRunning: false }),

  appendStdout: (text) =>
    set((s) => ({ output: { ...s.output, stdout: s.output.stdout + text } })),

  appendStderr: (text) =>
    set((s) => ({ output: { ...s.output, stderr: s.output.stderr + text } })),

  addPlot: (base64) =>
    set((s) => ({ output: { ...s.output, plots: [...s.output.plots, base64] } })),

  setResult: (partial) =>
    set((s) => ({ output: { ...s.output, ...partial } })),
}));
