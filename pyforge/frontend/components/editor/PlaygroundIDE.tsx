"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, Plus, FileCode, Code2, Trash2, GraduationCap, AlertCircle, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { OutputPanel } from "@/components/editor/OutputPanel";
import { RightSidebar } from "@/components/editor/RightSidebar";
import { PreRunBanner } from "@/components/editor/PreRunBanner";
import { LearnPanel } from "@/components/editor/LearnPanel";
import { ErrorAssistant } from "@/components/editor/ErrorAssistant";
import { CognitiveLoadBar } from "@/components/editor/CognitiveLoadBar";
import { MobileFilesSheet } from "@/components/editor/MobileFilesSheet";
import { EthicsGateModal } from "@/components/editor/EthicsGateModal";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { useEditorStore } from "@/stores/editorStore";
import { useExecution } from "@/components/execution/useExecution";
import { useExecutionStore } from "@/stores/executionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { analyzeBeforeRun } from "@/lib/learning/pre-run-analyzer";
import { cn } from "@/lib/utils";

type MobilePanel = "learn" | "guide" | null;

export function PlaygroundIDE() {
  const { files, activeFile, setActiveFile, updateFile, addFile, deleteFile, getActiveContent } =
    useEditorStore();
  const { run } = useExecution();
  const { isRunning } = useExecutionStore();
  const hasError = useErrorAssistantStore((s) => !!s.error);
  const ethicsAcknowledged = useSettingsStore((s) => s.ethicsAcknowledged);
  const setEthicsAcknowledged = useSettingsStore((s) => s.setEthicsAcknowledged);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [filesOpen, setFilesOpen] = useState(false);
  const [ethicsOpen, setEthicsOpen] = useState(false);
  const [pendingRun, setPendingRun] = useState(false);

  const code = getActiveContent();

  const executeRun = useCallback(async () => {
    try {
      await run(code);
    } catch {
      /* handled in useExecution */
    }
  }, [run, code]);

  const handleRun = useCallback(() => {
    const warnings = analyzeBeforeRun(code);
    const needsEthics = warnings.some(
      (w) => w.id.startsWith("ethics") && !ethicsAcknowledged
    );
    if (needsEthics) {
      setEthicsOpen(true);
      setPendingRun(true);
      return;
    }
    void executeRun();
  }, [code, ethicsAcknowledged, executeRun]);

  const handleDelete = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length <= 1) return;
    deleteFile(name);
  };

  const nextScriptName = () => {
    let n = 1;
    while (files.some((f) => f.name === `script${n}.py`)) n++;
    return `script${n}.py`;
  };

  useEffect(() => {
    if (hasError && typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobilePanel("guide");
    }
  }, [hasError]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background">
      <EthicsGateModal
        open={ethicsOpen}
        onConfirm={() => {
          setEthicsAcknowledged(true);
          setEthicsOpen(false);
          if (pendingRun) {
            setPendingRun(false);
            void executeRun();
          }
        }}
        onCancel={() => {
          setEthicsOpen(false);
          setPendingRun(false);
        }}
      />
      <MobileFilesSheet open={filesOpen} onClose={() => setFilesOpen(false)} />

      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/80">
        <Button
          variant="accent"
          size="sm"
          onClick={handleRun}
          disabled={isRunning}
          className={cn(!isRunning && "run-pulse")}
        >
          <Play className="h-4 w-4 mr-1.5 fill-current" />
          {isRunning ? "Running..." : "Run"}
        </Button>

        <button
          type="button"
          onClick={() => setFilesOpen(true)}
          className="md:hidden flex items-center gap-1 text-xs text-muted px-2 py-1 rounded border border-border"
        >
          <FolderOpen className="h-3.5 w-3.5" /> Files
        </button>

        <span className="ml-auto text-xs text-muted hidden sm:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">⌘</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">↵</kbd>
        </span>
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className="w-44 sm:w-52 border-r border-border bg-card/30 hidden md:flex flex-col shrink-0">
          <div className="p-3 flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider">
            <FileCode className="h-3.5 w-3.5" /> Files
          </div>
          <div className="flex-1 overflow-y-auto">
            {files.map((f) => (
              <div
                key={f.name}
                className={cn(
                  "group flex items-center gap-1 mx-2 mb-0.5 rounded-lg",
                  activeFile === f.name && "bg-accent/15"
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveFile(f.name)}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-left min-w-0",
                    activeFile === f.name ? "text-accent font-medium" : "text-muted hover:text-foreground"
                  )}
                >
                  <Code2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{f.name}</span>
                </button>
                {files.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDelete(f.name, e)}
                    className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 mr-1 rounded text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title={`Delete ${f.name}`}
                    aria-label={`Delete ${f.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addFile(nextScriptName())}
            className="flex items-center gap-2 mx-2 mt-1 mb-3 px-2 py-1.5 text-sm text-muted hover:text-accent transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New file
          </button>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <PreRunBanner code={code} />
          <CognitiveLoadBar code={code} />
          <motion.div className="flex-1 min-h-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CodeEditor value={code} onChange={(v) => updateFile(activeFile, v)} />
          </motion.div>
          <div className="h-[38%] min-h-[140px] max-h-[280px] border-t border-border">
            <OutputPanel />
          </div>
        </div>

        <RightSidebar />
      </div>

      <div className="lg:hidden border-t border-border bg-card/80 flex">
        <button
          type="button"
          onClick={() => setMobilePanel(mobilePanel === "learn" ? null : "learn")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-muted"
        >
          <GraduationCap className="h-4 w-4" /> Learn
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel(mobilePanel === "guide" ? null : "guide")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-muted relative"
        >
          <AlertCircle className="h-4 w-4" /> Guide
          {hasError && <span className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-red-500" />}
        </button>
      </div>
      {mobilePanel && (
        <div className="lg:hidden h-64 border-t border-border bg-card shrink-0 overflow-hidden">
          {mobilePanel === "learn" ? <LearnPanel /> : <ErrorAssistant embedded />}
        </div>
      )}
    </div>
  );
}
