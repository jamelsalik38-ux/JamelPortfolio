import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
export const ADMIN_COOKIE = "portfolio_admin_token";

export function signAdminToken(username: string) {
  return jwt.sign({ role: "admin", username }, SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = jwt.verify(token, SECRET) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** Server-side check, used inside server components / route handlers. */
export function isAdminAuthed(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}
