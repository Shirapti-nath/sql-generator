import { registerPythonCompletions } from "@/lib/monaco/python-completions";

let completionDisposable: { dispose: () => void } | null = null;
let setupPromise: Promise<void> | null = null;

export async function ensurePythonCompletions(): Promise<void> {
  if (completionDisposable) return;

  if (!setupPromise) {
    setupPromise = (async () => {
      const monaco = await import("monaco-editor");
      if (completionDisposable) return;
      completionDisposable = registerPythonCompletions(monaco);
    })();
  }

  await setupPromise;
}
