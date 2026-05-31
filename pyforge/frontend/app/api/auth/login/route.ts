import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/server/store";
import { signToken } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
    }
    const access_token = await signToken(user.id, "access");
    const refresh_token = await signToken(user.id, "refresh");
    return NextResponse.json({ access_token, refresh_token, token_type: "bearer" });
  } catch {
    return NextResponse.json({ detail: "Login failed" }, { status: 500 });
  }
}
