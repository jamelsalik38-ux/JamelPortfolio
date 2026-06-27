export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getSkills, createSkill } from "@/lib/db";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import type { Skill } from "@/types";

export async function GET() {
  const skills = await getSkills();
  return NextResponse.json(skills);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const skill: Skill = {
    id: nanoid(8),
    name: body.name,
    category: body.category || "Other",
    level: typeof body.level === "number" ? Math.max(0, Math.min(100, body.level)) : 70,
  };

  const created = await createSkill(skill);
  return NextResponse.json(created, { status: 201 });
}
