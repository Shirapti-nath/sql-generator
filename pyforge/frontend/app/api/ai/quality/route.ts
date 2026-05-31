import { NextResponse } from "next/server";
import { askQualityReview } from "@/lib/server/ai";
import { analyzeCodeQuality } from "@/lib/code-quality";

export async function POST(req: Request) {
  try {
    const { code, use_ai } = await req.json();
    if (!code) {
      return NextResponse.json({ detail: "code required" }, { status: 400 });
    }

    const staticSuggestions = analyzeCodeQuality(code);
    let aiSummary: string | null = null;
    if (use_ai !== false) {
      aiSummary = await askQualityReview(code);
    }

    return NextResponse.json({ suggestions: staticSuggestions, ai_summary: aiSummary });
  } catch (err) {
    return NextResponse.json(
      { detail: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
