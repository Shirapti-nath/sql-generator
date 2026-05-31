import { NextResponse } from "next/server";
import { askCopilot } from "@/lib/server/ai";

export async function POST(req: Request) {
  try {
    const { code, message, error_context, socratic_mode } = await req.json();
    if (!code || !message) {
      return NextResponse.json({ detail: "code and message required" }, { status: 400 });
    }
    const reply = await askCopilot(code, message, error_context, Boolean(socratic_mode));
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Copilot failed" },
      { status: 500 }
    );
  }
}
