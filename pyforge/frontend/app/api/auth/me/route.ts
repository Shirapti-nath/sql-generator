import { NextResponse } from "next/server";
import { findUserById } from "@/lib/server/store";
import { verifyToken } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }
    const userId = await verifyToken(auth.slice(7));
    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ detail: "User not found" }, { status: 401 });
    }
    return NextResponse.json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      created_at: user.created_at,
    });
  } catch {
    return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
  }
}
