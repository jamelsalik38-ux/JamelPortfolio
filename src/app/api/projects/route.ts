export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getProjects, createProject } from "@/lib/db";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import type { Project } from "@/types";

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title || !body.description) {
    return NextResponse.json(
      { error: "Title and description are required" },
      { status: 400 }
    );
  }

  const project: Project = {
    id: nanoid(8),
    title: body.title,
    description: body.description,
    image: body.image || "/uploads/placeholder-project.svg",
    tech: Array.isArray(body.tech) ? body.tech : [],
    github: body.github || "",
    demo: body.demo || "",
    featured: !!body.featured,
    createdAt: new Date().toISOString(),
  };

  const created = await createProject(project);
  return NextResponse.json(created, { status: 201 });
}
