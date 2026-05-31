"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ErrorEvent } from "@/lib/learning/error-genealogy";
import type { CodeSnapshot } from "@/lib/learning/snapshots";

interface ClassroomPulseEvent {
  errorType: string;
  at: string;
}

interface LearningState {
  xp: number;
  totalRuns: number;
  successfulRuns: number;
  mistakes: Record<string, { type: string; count: number; lastAt: string }>;
  completedDrills: string[];
  dueDrillIds: string[];
  lastStoryboardCode: string;
  errorEvents: ErrorEvent[];
  snapshots: CodeSnapshot[];
  exerciseAttempts: Record<string, number>;
  recordRun: (success: boolean, hadPreRunWarning: boolean) => void;
  recordError: (errorType: string, line?: number | null) => void;
  completeDrill: (drillId: string) => void;
  scheduleReview: (drillId: string) => void;
  getTopMistakes: (limit?: number) => Array<{ type: string; count: number; lastAt: string }>;
  setLastStoryboardCode: (code: string) => void;
  saveSnapshot: (concept: string, code: string) => void;
  incrementExerciseAttempt: (id: string) => number;
}

function xpForRun(success: boolean, hadPreRunWarning: boolean): number {
  if (success) return hadPreRunWarning ? 8 : 12;
  return 3;
}

function xpForDrill(): number {
  return 25;
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
      errorEvents: [],
      snapshots: [],
      exerciseAttempts: {},

      recordRun: (success, hadPreRunWarning) =>
        set((s) => ({
          totalRuns: s.totalRuns + 1,
          successfulRuns: success ? s.successfulRuns + 1 : s.successfulRuns,
          xp: s.xp + xpForRun(success, hadPreRunWarning),
        })),

      recordError: (errorType, line = null) => {
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
            errorEvents: [
              ...s.errorEvents.slice(-99),
              { type: key, at: new Date().toISOString(), line },
            ],
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

      saveSnapshot: (concept, code) =>
        set((s) => ({
          snapshots: [
            ...s.snapshots.filter((snap) => snap.concept !== concept).slice(-19),
            {
              id: crypto.randomUUID(),
              concept,
              code,
              at: new Date().toISOString(),
            },
          ],
        })),

      incrementExerciseAttempt: (id) => {
        const next = (get().exerciseAttempts[id] ?? 0) + 1;
        set((s) => ({ exerciseAttempts: { ...s.exerciseAttempts, [id]: next } }));
        return next;
      },
    }),
    { name: "pyforge-learning" }
  )
);

/** In-memory classroom pulse (MVP — resets on refresh) */
export const useClassroomPulseStore = create<{
  sessionCode: string | null;
  events: ClassroomPulseEvent[];
  joinSession: (code: string) => void;
  reportError: (errorType: string) => void;
  getHeatmap: () => Record<string, number>;
}>((set, get) => ({
  sessionCode: null,
  events: [],
  joinSession: (code) => set({ sessionCode: code.toUpperCase(), events: [] }),
  reportError: (errorType) => {
    const code = get().sessionCode;
    if (code) {
      fetch(`/api/class/${code}/pulse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorType }),
      }).catch(() => {});
    }
    set((s) => ({
      events: [...s.events, { errorType, at: new Date().toISOString() }],
    }));
  },
  getHeatmap: () => {
    const map: Record<string, number> = {};
    for (const e of get().events) {
      map[e.errorType] = (map[e.errorType] ?? 0) + 1;
    }
    return map;
  },
}));
