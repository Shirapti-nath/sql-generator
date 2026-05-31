"use client";

import { create } from "zustand";
import type { ParsedError } from "@/lib/error-parser";

interface ErrorAssistantState {
  error: ParsedError | null;
  highlightLine: number | null;
  setError: (error: ParsedError | null) => void;
  clear: () => void;
}

export const useErrorAssistantStore = create<ErrorAssistantState>((set) => ({
  error: null,
  highlightLine: null,
  setError: (error) =>
    set({ error, highlightLine: error?.line ?? null }),
  clear: () => set({ error: null, highlightLine: null }),
}));
