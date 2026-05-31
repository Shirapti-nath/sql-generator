"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useMemo } from "react";
import type { editor } from "monaco-editor";
import { useThemeStore } from "@/stores/themeStore";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { ensurePythonCompletions } from "@/lib/monaco/setup-completions";
import { analyzeSyntaxGhost } from "@/lib/learning/syntax-ghost";
import { analyzeIntentAlignment } from "@/lib/learning/intent-lens";
import { useSettingsStore } from "@/stores/settingsStore";

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
  const goal = useSettingsStore((s) => s.learningGoal);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const ghostMarks = useMemo(() => analyzeSyntaxGhost(value), [value]);
  const intentLines = useMemo(() => {
    if (!goal.trim()) return new Set<number>();
    return new Set(analyzeIntentAlignment(goal, value).filter((a) => !a.aligned).map((a) => a.line));
  }, [goal, value]);

  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;

    const decos: editor.IModelDeltaDecoration[] = [];

    if (highlightLine && highlightLine > 0) {
      const maxLine = ed.getModel()?.getLineCount() ?? 1;
      const line = Math.min(highlightLine, maxLine);
      decos.push({
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
      });
    }

    for (const g of ghostMarks) {
      decos.push({
        range: {
          startLineNumber: g.line,
          startColumn: g.startColumn,
          endLineNumber: g.line,
          endColumn: g.endColumn,
        },
        options: {
          inlineClassName: "syntax-ghost-identifier",
          hoverMessage: { value: g.label },
        },
      });
    }

    for (const line of intentLines) {
      decos.push({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: ed.getModel()?.getLineMaxColumn(line) ?? 1,
        },
        options: {
          isWholeLine: true,
          className: "intent-orphan-line",
        },
      });
    }

    decorationsRef.current = ed.deltaDecorations(decorationsRef.current, decos);
    if (highlightLine) ed.revealLineInCenter(Math.min(highlightLine, ed.getModel()?.getLineCount() ?? 1));
  }, [highlightLine, value, ghostMarks, intentLines]);

  const handleMount = (ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;
    void ensurePythonCompletions();
    ed.updateOptions({
      tabCompletion: "on",
      glyphMargin: true,
      quickSuggestions: { other: true, comments: false, strings: true },
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
        wordWrap: "on",
      }}
    />
  );
}
