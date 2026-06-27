export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const normalizedUsername = username?.toString().trim();
  const normalizedPassword = password?.toString().trim();
  const validUsername = process.env.ADMIN_USERNAME?.trim();
  const validHash = process.env.ADMIN_PASSWORD_HASH;
  const fallbackPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || (!validHash && !fallbackPassword)) {
    return NextResponse.json(
      {
        error:
          "Admin credentials are not configured. Set ADMIN_USERNAME and either ADMIN_PASSWORD_HASH or ADMIN_PASSWORD in .env.local.",
      },
      { status: 500 }
    );
  }

  if (normalizedUsername !== validUsername) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const passwordMatchesHash = validHash ? await bcrypt.compare(normalizedPassword, validHash) : false;
  const passwordMatchesPlain = fallbackPassword ? normalizedPassword === fallbackPassword : false;

  if (!passwordMatchesHash && !passwordMatchesPlain) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminToken(username);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
