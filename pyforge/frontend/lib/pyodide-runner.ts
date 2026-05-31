import { getPyodide } from "@/lib/pyodide-runtime";
import { pyodidePackagesForCode } from "@/lib/pyodide-packages";

export interface BrowserRunResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  plots: string[];
}

export async function runPythonInBrowser(code: string): Promise<BrowserRunResult> {
  const start = performance.now();
  const { toLoad, unsupported } = pyodidePackagesForCode(code);

  if (unsupported.length > 0) {
    const msg = `${unsupported.join(", ")} is not available in the browser runtime. Use PyTorch/TensorFlow locally or a full PyForge server deployment.`;
    return {
      stdout: "",
      stderr: msg,
      exit_code: 1,
      duration_ms: Math.round(performance.now() - start),
      plots: [],
    };
  }

  const pyodide = await getPyodide();
  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (msg: string) => { stdout += msg; } });
  pyodide.setStderr({ batched: (msg: string) => { stderr += msg; } });

  try {
    if (toLoad.length > 0) {
      await pyodide.loadPackages(toLoad);
    }
    await pyodide.runPythonAsync(code);
  } catch (e) {
    stderr = e instanceof Error ? e.message : String(e);
  }

  return {
    stdout,
    stderr,
    exit_code: stderr ? 1 : 0,
    duration_ms: Math.round(performance.now() - start),
    plots: [],
  };
}
