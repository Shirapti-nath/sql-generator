"use client";

import { useMemo } from "react";
import { Target } from "lucide-react";
import { analyzeIntentAlignment } from "@/lib/learning/intent-lens";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

export function IntentLensPanel({ code }: { code: string }) {
  const goal = useSettingsStore((s) => s.learningGoal);
  const setGoal = useSettingsStore((s) => s.setLearningGoal);
  const alignment = useMemo(() => analyzeIntentAlignment(goal, code), [goal, code]);

  return (
    <div className="p-4 space-y-3 h-full overflow-y-auto">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Target className="h-4 w-4 text-accent" />
        Intent Lens
      </div>
      <input
        type="text"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder='Your goal: e.g. "Load CSV and print first 5 rows"'
        className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background"
      />
      {!goal.trim() ? (
        <p className="text-xs text-muted">Describe what you want this script to do — we highlight matching lines.</p>
      ) : alignment.length === 0 ? (
        <p className="text-xs text-muted">Add code to see alignment.</p>
      ) : (
        <ul className="space-y-1.5">
          {alignment.map((a) => (
            <li
              key={a.line}
              className={cn(
                "text-xs p-2 rounded border font-mono",
                a.aligned ? "border-accent/30 bg-accent/5" : "border-border opacity-50"
              )}
            >
              <span className="text-muted mr-2">L{a.line}</span>
              {a.code.slice(0, 60)}
              <p className="text-[10px] text-muted mt-1 font-sans">{a.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
