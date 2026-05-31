"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  EXERCISES,
  mutateTestCase,
  buildExerciseHarness,
} from "@/lib/learning/exercises";
import { runPythonInBrowser } from "@/lib/pyodide-runner";
import { useLearningStore } from "@/stores/learningStore";

export default function ExercisesPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ passed: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const incrementExerciseAttempt = useLearningStore((s) => s.incrementExerciseAttempt);

  const active = EXERCISES.find((e) => e.id === activeId);

  const startExercise = (id: string) => {
    const ex = EXERCISES.find((e) => e.id === id);
    if (!ex) return;
    setActiveId(id);
    setCode(ex.starterCode);
    setResult(null);
  };

  const runTest = async () => {
    if (!active) return;
    setLoading(true);
    setResult(null);
    const attempt = incrementExerciseAttempt(active.id);
    const { function: fn, args, expected } = mutateTestCase(active, attempt);
    const harness = buildExerciseHarness(code, fn, args, expected);
    const r = await runPythonInBrowser(harness);
    const line = (r.stdout + r.stderr).split("\n").find((l) => l.includes("__PYFORGE_TEST__"));
    if (line) {
      try {
        const parsed = JSON.parse(line.replace("__PYFORGE_TEST__", "")) as {
          passed: boolean;
          actual?: string;
          expected?: string;
          error?: string;
        };
        setResult({
          passed: parsed.passed,
          message: parsed.passed
            ? "All tests passed!"
            : parsed.error ?? `Expected ${parsed.expected}, got ${parsed.actual}`,
        });
      } catch {
        setResult({ passed: false, message: "Could not parse test output." });
      }
    } else {
      setResult({ passed: false, message: r.stderr || "Test harness failed." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 mesh-bg min-h-[calc(100vh-3.5rem)]">
      <Link href="/playground" className="text-sm text-muted hover:text-accent flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to playground
      </Link>

      <h1 className="text-3xl font-bold mb-2">Challenge Mutations</h1>
      <p className="text-muted mb-8">
        Each attempt mutates the test inputs — your function must generalize, not memorize one case.
      </p>

      {!active ? (
        <div className="space-y-4">
          {EXERCISES.map((ex) => (
            <Card key={ex.id} className="hover:border-accent/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{ex.title}</CardTitle>
                <CardDescription>{ex.prompt}</CardDescription>
                <Button variant="accent" size="sm" className="mt-2 w-fit" onClick={() => startExercise(ex.id)}>
                  Start challenge
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{active.title}</CardTitle>
              <CardDescription>{active.prompt}</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6 space-y-3">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 font-mono text-sm bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-accent"
                spellCheck={false}
              />
              <div className="flex gap-2">
                <Button variant="accent" onClick={() => void runTest()} disabled={loading}>
                  {loading ? "Running..." : "Run mutation test"}
                </Button>
                <Button variant="outline" onClick={() => setActiveId(null)}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Choose another
                </Button>
              </div>
              {result && (
                <div
                  className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${
                    result.passed ? "border-accent/40 text-accent" : "border-red-500/40 text-red-400"
                  }`}
                >
                  {result.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {result.message}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
