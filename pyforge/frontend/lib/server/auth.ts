import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pyforge-dev-secret-change-in-production-32chars"
);

export async function signToken(userId: string, type: "access" | "refresh" = "access"): Promise<string> {
  const expiresIn = type === "access" ? "7d" : "30d";
  return new SignJWT({ sub: userId, type })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, SECRET);
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("Invalid token");
  }
  return payload.sub;
}
