import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/server/auth";
import { findUserById } from "@/lib/server/store";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }
    const userId = await verifyToken(auth.slice(7));
    const user = findUserById(userId);
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 401 });
    }
    return NextResponse.json({
      streak_days: 1,
      lessons_completed: 0,
      exercises_passed: 0,
      total_submissions: 0,
      recent_runs: [],
      recent_snippets: [],
      course_progress: [],
    });
  } catch {
    return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
  }
}
