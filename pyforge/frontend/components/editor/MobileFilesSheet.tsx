"use client";

import { FileCode, Plus, Code2, Trash2, X } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

interface MobileFilesSheetProps {
  open: boolean;
  onClose: () => void;
}

export function MobileFilesSheet({ open, onClose }: MobileFilesSheetProps) {
  const { files, activeFile, setActiveFile, addFile, deleteFile } = useEditorStore();

  if (!open) return null;

  const nextScriptName = () => {
    let n = 1;
    while (files.some((f) => f.name === `script${n}.py`)) n++;
    return `script${n}.py`;
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close" />
      <div className="relative bg-card border-t border-border rounded-t-xl max-h-[50vh] flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-semibold flex items-center gap-2">
            <FileCode className="h-4 w-4" /> Files
          </span>
          <button type="button" onClick={onClose} className="p-1 text-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-2">
          {files.map((f) => (
            <div key={f.name} className="flex items-center gap-1 mb-1">
              <button
                type="button"
                onClick={() => {
                  setActiveFile(f.name);
                  onClose();
                }}
                className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left",
                  activeFile === f.name ? "bg-accent/15 text-accent" : "text-muted"
                )}
              >
                <Code2 className="h-4 w-4" />
                {f.name}
              </button>
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteFile(f.name)}
                  className="p-2 text-muted hover:text-red-400"
                  aria-label={`Delete ${f.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addFile(nextScriptName())}
          className="flex items-center gap-2 p-3 border-t border-border text-sm text-muted"
        >
          <Plus className="h-4 w-4" /> New file
        </button>
      </div>
    </div>
  );
}
