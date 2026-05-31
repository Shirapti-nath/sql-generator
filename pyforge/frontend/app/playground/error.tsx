"use client";

import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong in the editor</h2>
      <p className="text-muted text-sm mb-4 max-w-md">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium"
      >
        Reload playground
      </button>
    </div>
  );
}
