import { NextResponse } from "next/server";
import { runPythonCode } from "@/lib/server/python-runner";

export async function POST(req: Request) {
  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      {
        detail:
          "Server-side Python is disabled on Vercel. Code runs in your browser via Pyodide (including NumPy/Pandas).",
        use_browser: true,
      },
      { status: 503 }
    );
  }

  try {
    const { code, stdin = "" } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ detail: "Code is required" }, { status: 400 });
    }
    if (code.length > 100_000) {
      return NextResponse.json({ detail: "Code too long (max 100KB)" }, { status: 400 });
    }

    const result = await runPythonCode(code, stdin);

    return NextResponse.json({
      stdout: result.stdout,
      stderr: result.stderr,
      plots: result.plots,
      exit_code: result.exit_code,
      duration_ms: result.duration_ms,
      status: result.exit_code === 0 ? "completed" : "error",
      mode: "server",
    });
  } catch (err) {
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Execution failed" },
      { status: 500 }
    );
  }
}
