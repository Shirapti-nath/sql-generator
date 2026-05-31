"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { editor } from "monaco-editor";
import { useThemeStore } from "@/stores/themeStore";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { ensurePythonCompletions } from "@/lib/monaco/setup-completions";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, height = "100%", readOnly = false }: CodeEditorProps) {
  const theme = useThemeStore((s) => s.theme);
  const highlightLine = useErrorAssistantStore((s) => s.highlightLine);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;

    if (highlightLine && highlightLine > 0) {
      const maxLine = ed.getModel()?.getLineCount() ?? 1;
      const line = Math.min(highlightLine, maxLine);
      decorationsRef.current = ed.deltaDecorations(decorationsRef.current, [
        {
          range: {
            startLineNumber: line,
            startColumn: 1,
            endLineNumber: line,
            endColumn: ed.getModel()?.getLineMaxColumn(line) ?? 1,
          },
          options: {
            isWholeLine: true,
            className: "error-line-highlight",
            glyphMarginClassName: "error-glyph-margin",
          },
        },
      ]);
      ed.revealLineInCenter(line);
    } else {
      decorationsRef.current = ed.deltaDecorations(decorationsRef.current, []);
    }
  }, [highlightLine, value]);

  const handleMount = (ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;
    void ensurePythonCompletions();

    ed.updateOptions({
      tabCompletion: "on",
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
      quickSuggestions: { other: true, comments: false, strings: true },
      suggestOnTriggerCharacters: true,
      wordBasedSuggestions: "matchingDocuments",
      snippetSuggestions: "top",
      suggest: {
        preview: true,
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showClasses: true,
        showModules: true,
      },
    });
  };

  return (
    <MonacoEditor
      height={height}
      language="python"
      theme={theme === "dark" ? "vs-dark" : "light"}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "var(--font-jetbrains), monospace",
        lineNumbers: "on",
        glyphMargin: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        readOnly,
        padding: { top: 12 },
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        bracketPairColorization: { enabled: true },
        smoothScrolling: true,
        tabCompletion: "on",
        quickSuggestions: { other: true, strings: true },
        wordWrap: "on",
      }}
    />
  );
}
