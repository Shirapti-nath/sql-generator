"use client";

import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: "⌘ + Enter", action: "Run code" },
  { keys: "⌘ + S", action: "Save (auto-saved)" },
  { keys: "⌘ + /", action: "Toggle comment" },
];

export function KeyboardShortcuts() {
  return (
    <div className="hidden lg:flex items-center gap-4 text-xs text-muted">
      <Keyboard className="h-3.5 w-3.5" />
      {shortcuts.map((s) => (
        <span key={s.keys}>
          <kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono">{s.keys}</kbd>
          {" "}{s.action}
        </span>
      ))}
    </div>
  );
}
