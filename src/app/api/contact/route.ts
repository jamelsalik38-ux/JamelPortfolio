export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { sendContactEmail } from "@/lib/mailer";

const MESSAGES_PATH = path.join(process.cwd(), "data", "messages.json");

// Simple in-memory rate limit: 5 submissions per IP per 10 minutes.
// Resets on server restart — fine for a portfolio contact form, but swap
// for a persistent store (Redis, DB table) if you expect real traffic.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > MAX_PER_WINDOW;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages — please try again later." },
      { status: 429 }
    );
  }

  const { name, email, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const entry = {
    id: Date.now().toString(36),
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    message: String(message).slice(0, 4000),
    receivedAt: new Date().toISOString(),
  };

  const existing = fs.existsSync(MESSAGES_PATH)
    ? JSON.parse(fs.readFileSync(MESSAGES_PATH, "utf-8"))
    : [];
  existing.unshift(entry);
  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(existing, null, 2));

  try {
    await sendContactEmail(entry);
  } catch (err) {
    // The message is already saved above, so a failed email send doesn't
    // lose the submission — just log it for now.
    console.error("Failed to send contact email:", err);
  }

  return NextResponse.json({ success: true });
}
