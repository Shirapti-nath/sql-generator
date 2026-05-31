"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { xpForDrill, xpForRun } from "@/lib/learning/career-path";

interface MistakeRecord {
  type: string;
  count: number;
  lastAt: string;
}

interface LearningState {
  xp: number;
  totalRuns: number;
  successfulRuns: number;
  mistakes: Record<string, MistakeRecord>;
  completedDrills: string[];
  dueDrillIds: string[];
  lastStoryboardCode: string;
  recordRun: (success: boolean, hadPreRunWarning: boolean) => void;
  recordError: (errorType: string) => void;
  completeDrill: (drillId: string) => void;
  scheduleReview: (drillId: string) => void;
  getTopMistakes: (limit?: number) => MistakeRecord[];
  setLastStoryboardCode: (code: string) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalRuns: 0,
      successfulRuns: 0,
      mistakes: {},
      completedDrills: [],
      dueDrillIds: [],
      lastStoryboardCode: "",

      recordRun: (success, hadPreRunWarning) =>
        set((s) => ({
          totalRuns: s.totalRuns + 1,
          successfulRuns: success ? s.successfulRuns + 1 : s.successfulRuns,
          xp: s.xp + xpForRun(success, hadPreRunWarning),
        })),

      recordError: (errorType) => {
        const key = errorType.split("—")[0].trim() || "Unknown";
        set((s) => {
          const prev = s.mistakes[key];
          return {
            mistakes: {
              ...s.mistakes,
              [key]: {
                type: key,
                count: (prev?.count ?? 0) + 1,
                lastAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      completeDrill: (drillId) =>
        set((s) => {
          if (s.completedDrills.includes(drillId)) return s;
          return {
            completedDrills: [...s.completedDrills, drillId],
            dueDrillIds: s.dueDrillIds.filter((id) => id !== drillId),
            xp: s.xp + xpForDrill(),
          };
        }),

      scheduleReview: (drillId) =>
        set((s) => ({
          dueDrillIds: s.dueDrillIds.includes(drillId) ? s.dueDrillIds : [...s.dueDrillIds, drillId],
        })),

      getTopMistakes: (limit = 5) => {
        const list = Object.values(get().mistakes);
        return list.sort((a, b) => b.count - a.count).slice(0, limit);
      },

      setLastStoryboardCode: (code) => set({ lastStoryboardCode: code }),
    }),
    { name: "pyforge-learning" }
  )
);
