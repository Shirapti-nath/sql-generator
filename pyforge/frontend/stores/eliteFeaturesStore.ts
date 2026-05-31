"use client";

import { create } from "zustand";
import type { DataFrameInsight } from "@/lib/learning/data-detective";

export interface CounterfactualResult {
  originalStdout: string;
  patchedStdout: string;
  description: string;
  patchedSucceeded: boolean;
}

interface EliteFeaturesState {
  counterfactual: CounterfactualResult | null;
  dataInsight: DataFrameInsight | null;
  setCounterfactual: (r: CounterfactualResult | null) => void;
  setDataInsight: (d: DataFrameInsight | null) => void;
  clearRunExtras: () => void;
}

export const useEliteFeaturesStore = create<EliteFeaturesState>((set) => ({
  counterfactual: null,
  dataInsight: null,
  setCounterfactual: (r) => set({ counterfactual: r }),
  setDataInsight: (d) => set({ dataInsight: d }),
  clearRunExtras: () => set({ counterfactual: null, dataInsight: null }),
}));
