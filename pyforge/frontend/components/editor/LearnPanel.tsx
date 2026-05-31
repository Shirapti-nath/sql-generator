"use client";

import { useState } from "react";
import {
  GraduationCap,
  Target,
  Flame,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  ListOrdered,
  GitBranch,
  LineChart,
} from "lucide-react";
import { MLSimPanel } from "@/components/learning/MLSimPanel";
import { buildTransitions, timelineSummary } from "@/lib/learning/error-genealogy";
import { Button } from "@/components/ui/button";
import { useLearningStore, useClassroomPulseStore } from "@/stores/learningStore";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { useEditorStore } from "@/stores/editorStore";
import {
  CAREER_MILESTONES,
  currentMilestone,
  nextMilestone,
} from "@/lib/learning/career-path";
import { CONCEPT_GRAPH, conceptsForError } from "@/lib/learning/concepts";
import {
  DRILLS,
  drillsForErrorType,
  checkDrillSolution,
} from "@/lib/learning/drills";
import { buildExecutionStoryboard } from "@/lib/learning/execution-storyboard";
import { hasNotebookMarkers, splitNotebookCells } from "@/lib/learning/notebook-cells";
import { cn } from "@/lib/utils";

type LearnSection = "path" | "mistakes" | "drills" | "trace" | "genealogy" | "mlsim";

export function LearnPanel() {
  const [section, setSection] = useState<LearnSection>("path");
  const [sessionInput, setSessionInput] = useState("");
  const joinSession = useClassroomPulseStore((s) => s.joinSession);
  const sessionCode = useClassroomPulseStore((s) => s.sessionCode);
  const xp = useLearningStore((s) => s.xp);
  const totalRuns = useLearningStore((s) => s.totalRuns);
  const successfulRuns = useLearningStore((s) => s.successfulRuns);
  const completedDrills = useLearningStore((s) => s.completedDrills);
  const dueDrillIds = useLearningStore((s) => s.dueDrillIds);
  const getTopMistakes = useLearningStore((s) => s.getTopMistakes);
  const completeDrill = useLearningStore((s) => s.completeDrill);
  const lastStoryboardCode = useLearningStore((s) => s.lastStoryboardCode);
  const errorEvents = useLearningStore((s) => s.errorEvents);
  const error = useErrorAssistantStore((s) => s.error);
  const { getActiveContent, updateFile, activeFile } = useEditorStore();

  const milestone = currentMilestone(xp);
  const next = nextMilestone(xp);
  const progressToNext = next
    ? Math.min(100, Math.round(((xp - milestone.xpRequired) / (next.xpRequired - milestone.xpRequired)) * 100))
    : 100;

  const mistakes = getTopMistakes(5);
  const relevantDrills = error
    ? drillsForErrorType(error.type)
    : DRILLS.filter((d) => dueDrillIds.includes(d.id)).slice(0, 2);
  const concepts = error ? conceptsForError(error.type) : [];

  const [activeDrillId, setActiveDrillId] = useState<string | null>(null);
  const activeDrill = DRILLS.find((d) => d.id === activeDrillId);

  const startDrill = (id: string) => {
    const drill = DRILLS.find((d) => d.id === id);
    if (!drill) return;
    setActiveDrillId(id);
    updateFile(activeFile, drill.starterCode);
    setSection("drills");
  };

  const checkDrill = () => {
    if (!activeDrill) return;
    const code = getActiveContent();
    if (checkDrillSolution(code, activeDrill)) {
      completeDrill(activeDrill.id);
      setActiveDrillId(null);
    }
  };

  const storyboard = lastStoryboardCode ? buildExecutionStoryboard(lastStoryboardCode) : [];
  const code = getActiveContent();
  const notebookCells = hasNotebookMarkers(code) ? splitNotebookCells(code) : [];

  const transitions = buildTransitions(errorEvents);
  const timeline = timelineSummary(errorEvents);

  const sections: { id: LearnSection; label: string; icon: typeof Target }[] = [
    { id: "path", label: "Path", icon: GraduationCap },
    { id: "mistakes", label: "Mistakes", icon: Flame },
    { id: "drills", label: "Drills", icon: Target },
    { id: "trace", label: "Trace", icon: ListOrdered },
    { id: "genealogy", label: "History", icon: GitBranch },
    { id: "mlsim", label: "ML Sim", icon: LineChart },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={cn(
              "flex-1 min-w-[4.5rem] py-2 text-[10px] font-medium flex flex-col items-center gap-0.5",
              section === s.id ? "text-accent border-b-2 border-accent" : "text-muted"
            )}
          >
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {section === "path" && (
          <>
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
              <div className="flex items-center gap-2 text-accent font-semibold">
                <GraduationCap className="h-4 w-4" />
                {milestone.title}
              </div>
              <p className="text-xs text-muted mt-1">{milestone.description}</p>
              <div className="mt-3 h-1.5 rounded-full bg-background overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
              <p className="text-[10px] text-muted mt-1">
                {xp} XP · {successfulRuns}/{totalRuns} successful runs
                {next && ` · ${next.xpRequired - xp} XP to ${next.title}`}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase text-muted mb-2">Milestones</h3>
              <ul className="space-y-2">
                {CAREER_MILESTONES.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "flex items-center gap-2 text-xs",
                      xp >= m.xpRequired ? "text-foreground" : "text-muted/60"
                    )}
                  >
                    {xp >= m.xpRequired ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {m.title}
                  </li>
                ))}
              </ul>
            </div>

            {concepts.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted mb-2 flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> Related concepts
                </h3>
                {concepts.map((c) => (
                  <div key={c.id} className="mb-2 p-2 rounded border border-border">
                    <p className="font-medium text-xs">{c.title}</p>
                    <p className="text-[11px] text-muted mt-0.5">{c.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <h3 className="text-xs font-semibold uppercase text-muted mb-2">Classroom session</h3>
              {sessionCode ? (
                <p className="text-xs text-accent">
                  Joined <span className="font-mono">{sessionCode}</span> — errors report to teacher pulse.
                </p>
              ) : (
                <div className="flex gap-1">
                  <input
                    value={sessionInput}
                    onChange={(e) => setSessionInput(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="flex-1 text-xs font-mono bg-background border border-border rounded px-2 py-1"
                    maxLength={8}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => sessionInput.trim() && joinSession(sessionInput.trim())}
                  >
                    Join
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        {section === "mistakes" && (
          <>
            <p className="text-xs text-muted">
              PyForge remembers errors you hit and suggests focused practice.
            </p>
            {mistakes.length === 0 ? (
              <p className="text-muted text-xs">No mistakes recorded yet — run some code!</p>
            ) : (
              <ul className="space-y-2">
                {mistakes.map((m) => (
                  <li
                    key={m.type}
                    className="flex justify-between items-center p-2 rounded-lg border border-border"
                  >
                    <span className="font-medium text-xs">{m.type}</span>
                    <span className="text-xs text-amber-400">{m.count}×</span>
                  </li>
                ))}
              </ul>
            )}
            {dueDrillIds.length > 0 && (
              <p className="text-xs text-accent">
                {dueDrillIds.length} drill(s) scheduled for spaced review — open Drills tab.
              </p>
            )}
          </>
        )}

        {section === "drills" && (
          <>
            {activeDrill ? (
              <div className="space-y-3">
                <p className="font-medium">{activeDrill.title}</p>
                <p className="text-xs text-muted">{activeDrill.prompt}</p>
                <p className="text-xs text-amber-400/90">Hint: {activeDrill.hint}</p>
                <div className="flex gap-2">
                  <Button variant="accent" size="sm" onClick={checkDrill}>
                    Check solution
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveDrillId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {(relevantDrills.length > 0 ? relevantDrills : DRILLS.slice(0, 3)).map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg border border-border hover:border-accent/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-xs">{d.title}</p>
                      {completedDrills.includes(d.id) && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted mt-1">{d.prompt}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => startDrill(d.id)}
                    >
                      Start drill
                    </Button>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {section === "trace" && (
          <>
            <p className="text-xs text-muted">
              Execution storyboard — what each line does (teaching view, not a full debugger).
            </p>
            {notebookCells.length > 1 && (
              <div className="mb-3 p-2 rounded border border-blue-500/30 bg-blue-500/5">
                <p className="text-xs font-medium text-blue-400">Notebook cells detected</p>
                <p className="text-[11px] text-muted mt-1">
                  {notebookCells.length} cells — use <code className="font-mono"># %%</code> to split. Run all with ⌘↵.
                </p>
              </div>
            )}
            {storyboard.length === 0 ? (
              <p className="text-muted text-xs flex items-center gap-2">
                <RotateCcw className="h-3.5 w-3.5" />
                Run code to build a trace.
              </p>
            ) : (
              <ol className="space-y-1 font-mono text-[11px]">
                {storyboard.map((step) => (
                  <li
                    key={step.line}
                    className={cn(
                      "flex gap-2 p-1.5 rounded",
                      step.kind === "run" && "bg-accent/5",
                      step.kind === "comment" && "opacity-50"
                    )}
                  >
                    <span className="text-muted w-5 shrink-0">{step.line}</span>
                    <div className="min-w-0 flex-1">
                      <span className={step.kind === "comment" ? "text-muted" : ""}>
                        {step.code.trim() || " "}
                      </span>
                      {step.note && (
                        <p className="text-[10px] text-accent/80 font-sans mt-0.5">{step.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="pt-2 border-t border-border">
              <h3 className="text-xs font-semibold text-muted mb-2">Concept library</h3>
              {CONCEPT_GRAPH.slice(0, 4).map((c) => (
                <p key={c.id} className="text-[11px] text-muted mb-1">
                  <strong className="text-foreground">{c.title}</strong> — {c.description}
                </p>
              ))}
            </div>
          </>
        )}

        {section === "genealogy" && (
          <>
            <p className="text-xs text-muted">
              Error genealogy — how one mistake leads to the next as you iterate.
            </p>
            {timeline.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted mb-2">Timeline</h3>
                <ul className="space-y-1 font-mono text-[11px]">
                  {timeline.map((line, i) => (
                    <li key={i} className="text-muted">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {transitions.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold uppercase text-muted mb-2">Common transitions</h3>
                <ul className="space-y-2">
                  {transitions.slice(0, 5).map((t) => (
                    <li key={`${t.from}-${t.to}`} className="p-2 rounded border border-border text-xs">
                      <span className="text-red-400">{t.from}</span>
                      <span className="text-muted mx-1">→</span>
                      <span className="text-amber-400">{t.to}</span>
                      <span className="text-muted ml-2">({t.count}×)</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted text-xs">Fix a few errors to see patterns emerge.</p>
            )}
          </>
        )}

        {section === "mlsim" && <MLSimPanel />}
      </div>
    </div>
  );
}
