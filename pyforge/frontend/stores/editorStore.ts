"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditorFile {
  name: string;
  content: string;
}

interface EditorState {
  files: EditorFile[];
  activeFile: string;
  setActiveFile: (name: string) => void;
  updateFile: (name: string, content: string) => void;
  addFile: (name: string) => void;
  deleteFile: (name: string) => boolean;
  getActiveContent: () => string;
}

const DEFAULT_CODE = `# PyForge Playground — Run with ⌘+Enter
# Tip: use # %% to split notebook-style cells

print("Hello, Engineer!")
`;

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      files: [{ name: "main.py", content: DEFAULT_CODE }],
      activeFile: "main.py",

      setActiveFile: (name) => set({ activeFile: name }),

      updateFile: (name, content) =>
        set((state) => ({
          files: state.files.map((f) => (f.name === name ? { ...f, content } : f)),
        })),

      addFile: (name) => {
        const state = get();
        let finalName = name;
        let n = 1;
        while (state.files.some((f) => f.name === finalName)) {
          finalName = name.replace(/\.py$/, "") + `_${n++}.py`;
        }
        set({
          files: [...state.files, { name: finalName, content: "# New file\n" }],
          activeFile: finalName,
        });
      },

      deleteFile: (name) => {
        const state = get();
        if (state.files.length <= 1) return false;
        const next = state.files.filter((f) => f.name !== name);
        if (next.length === state.files.length) return false;
        const activeFile =
          state.activeFile === name ? next[0].name : state.activeFile;
        set({ files: next, activeFile });
        return true;
      },

      getActiveContent: () => {
        const { files, activeFile } = get();
        return files.find((f) => f.name === activeFile)?.content ?? "";
      },
    }),
    { name: "pyforge-editor" }
  )
);
