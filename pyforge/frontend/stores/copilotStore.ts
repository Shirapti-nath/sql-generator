"use client";

import { create } from "zustand";

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

interface CopilotState {
  messages: CopilotMessage[];
  loading: boolean;
  addMessage: (msg: CopilotMessage) => void;
  setLoading: (v: boolean) => void;
  clear: () => void;
}

export const useCopilotStore = create<CopilotState>((set) => ({
  messages: [
    {
      role: "assistant",
      content:
        "I'm **PyForge Copilot** — your AI pair programmer for data science & ML. Ask me to fix errors, improve code, or explain Python patterns. Press **Tab** in the editor for autocomplete.",
    },
  ],
  loading: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (loading) => set({ loading }),
  clear: () =>
    set({
      messages: [
        {
          role: "assistant",
          content: "Chat cleared. How can I help with your Python code?",
        },
      ],
    }),
}));
