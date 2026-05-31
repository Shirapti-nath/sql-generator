"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function PlaygroundError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PyForge Playground]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center max-w-lg mx-auto">
      <AlertTriangle className="h-12 w-12 text-amber-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2">Editor needs a refresh</h2>
      <p className="text-muted text-sm mb-2">
        The playground hit an unexpected error — your code and learning progress are still saved locally.
      </p>
      <p className="text-xs text-muted font-mono mb-6 break-all">{error.message}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium"
        >
          Reload playground
        </button>
        <a
          href="/playground"
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-card"
        >
          Open fresh
        </a>
      </div>
    </div>
  );
}
