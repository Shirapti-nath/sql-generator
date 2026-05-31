import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser } from "@/lib/server/store";
import { signToken } from "@/lib/server/auth";
import { sendWelcomeEmail } from "@/lib/server/email";

export async function POST(req: Request) {
  try {
    const { email, password, display_name } = await req.json();
    if (!email || !password || !display_name) {
      return NextResponse.json({ detail: "All fields are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ detail: "Password must be at least 8 characters" }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await createUser(email, hash, display_name);

    sendWelcomeEmail(user.email, user.display_name).catch(() => {});

    const access_token = await signToken(user.id, "access");
    const refresh_token = await signToken(user.id, "refresh");
    return NextResponse.json({ access_token, refresh_token, token_type: "bearer" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ detail: msg }, { status: 400 });
  }
}
