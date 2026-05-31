"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  socraticMode: boolean;
  ethicsAcknowledged: boolean;
  learningGoal: string;
  portfolioPublic: boolean;
  toggleSocratic: () => void;
  setEthicsAcknowledged: (v: boolean) => void;
  setLearningGoal: (goal: string) => void;
  setPortfolioPublic: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      socraticMode: false,
      ethicsAcknowledged: false,
      learningGoal: "",
      portfolioPublic: false,
      toggleSocratic: () => set((s) => ({ socraticMode: !s.socraticMode })),
      setEthicsAcknowledged: (v) => set({ ethicsAcknowledged: v }),
      setLearningGoal: (goal) => set({ learningGoal: goal }),
      setPortfolioPublic: (v) => set({ portfolioPublic: v }),
    }),
    { name: "pyforge-settings" }
  )
);

export const SOCRATIC_HINTS = [
  "What type of value did Python expect on that line?",
  "Which names are defined before this line runs?",
  "If you wrapped the text in quotes, how would Python read it differently?",
  "What is one small change you could try before asking for the full fix?",
];
