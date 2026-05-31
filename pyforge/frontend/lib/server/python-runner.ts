import { spawn } from "child_process";
import { writeFileSync, mkdirSync, rmSync, existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

export interface RunResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
  plots: string[];
}

export async function runPythonCode(code: string, stdin = "", timeoutMs = 15000): Promise<RunResult> {
  const start = Date.now();
  const workDir = join(process.cwd(), ".data", "runs", randomUUID());

  try {
    mkdirSync(workDir, { recursive: true });
    const userScriptPath = join(workDir, "user_code.py");
    const runnerPath = join(workDir, "runner.py");
    const plotsDir = join(workDir, "plots");
    mkdirSync(plotsDir);

    writeFileSync(userScriptPath, code);

    const runner = `import sys, os, io
os.environ["MPLBACKEND"] = "Agg"
os.chdir(${JSON.stringify(plotsDir)})
os.makedirs(${JSON.stringify(plotsDir)}, exist_ok=True)
try:
    import matplotlib
    matplotlib.use("Agg")
except ImportError:
    pass
${stdin ? `sys.stdin = io.StringIO(${JSON.stringify(stdin)})\n` : ""}
with open(${JSON.stringify(userScriptPath)}, "r") as _f:
    _src = _f.read()
exec(compile(_src, "user_code.py", "exec"), {"__name__": "__main__"})
`;

    writeFileSync(runnerPath, runner);

    const result = await execPython(runnerPath, workDir, timeoutMs);
    const plots: string[] = [];
    if (existsSync(plotsDir)) {
      for (const f of readdirSync(plotsDir)) {
        if (f.endsWith(".png")) {
          plots.push(readFileSync(join(plotsDir, f)).toString("base64"));
        }
      }
    }

    return {
      ...result,
      duration_ms: Date.now() - start,
      plots,
    };
  } finally {
    try {
      rmSync(workDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

function execPython(scriptPath: string, cwd: string, timeoutMs: number): Promise<Pick<RunResult, "stdout" | "stderr" | "exit_code">> {
  return new Promise((resolve) => {
    const pythonCmd = process.platform === "win32" ? "python" : "python3";
    const proc = spawn(pythonCmd, [scriptPath], {
      cwd,
      env: { ...process.env, PYTHONUNBUFFERED: "1", MPLBACKEND: "Agg" },
    });

    let stdout = "";
    let stderr = "";
    let killed = false;

    const timer = setTimeout(() => {
      killed = true;
      proc.kill("SIGKILL");
    }, timeoutMs);

    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (killed) {
        resolve({ stdout, stderr: stderr || "Execution timed out", exit_code: 124 });
      } else {
        resolve({ stdout, stderr, exit_code: code ?? 1 });
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout: "",
        stderr: `Python not found. Install Python 3: ${err.message}`,
        exit_code: 1,
      });
    });
  });
}
