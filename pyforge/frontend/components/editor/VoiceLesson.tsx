"use client";

import { useState, useEffect } from "react";
import { Volume2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { useEditorStore } from "@/stores/editorStore";
import { checkDrillSolution } from "@/lib/learning/drills";
import { drillsForErrorType } from "@/lib/learning/drills";

type Step = "intro" | "concept" | "challenge" | "done";

export function VoiceLesson() {
  const error = useErrorAssistantStore((s) => s.error);
  const getActiveContent = useEditorStore((s) => s.getActiveContent);
  const [step, setStep] = useState<Step>("intro");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (error) setStep("intro");
  }, [error]);

  if (!error) return null;

  const speak = (text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
    setRunning(true);
    setTimeout(() => setRunning(false), text.length * 50);
  };

  const drill = drillsForErrorType(error.type)[0];

  const startLesson = () => {
    speak(`${error.type}. ${error.explanation}`, () => setStep("concept"));
  };

  const challenge = () => {
    setStep("challenge");
    speak("Now try to fix the code in the editor. When ready, press Check.");
  };

  const checkFix = () => {
    if (drill && checkDrillSolution(getActiveContent(), drill)) {
      setStep("done");
      speak("Great job! You fixed it.");
    } else {
      speak("Not quite yet. Read the how to fix section and try a small change.");
    }
  };

  return (
    <div className="p-3 border-t border-border bg-card/50">
      <p className="text-xs font-semibold mb-2 flex items-center gap-1">
        <Volume2 className="h-3.5 w-3.5" /> Voice lesson
      </p>
      <div className="flex flex-wrap gap-2">
        {step === "intro" && (
          <Button variant="accent" size="sm" onClick={startLesson} disabled={running}>
            <Play className="h-3 w-3 mr-1" /> Start
          </Button>
        )}
        {step === "concept" && (
          <Button variant="outline" size="sm" onClick={challenge}>
            Next: your turn
          </Button>
        )}
        {step === "challenge" && (
          <Button variant="accent" size="sm" onClick={checkFix}>
            Check my fix
          </Button>
        )}
        {step === "done" && <span className="text-xs text-accent">Lesson complete!</span>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.speechSynthesis?.cancel();
            setRunning(false);
          }}
        >
          <Pause className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
