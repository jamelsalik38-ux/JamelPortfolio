export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getCertificates, createCertificate } from "@/lib/db";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";
import type { Certificate } from "@/types";

export async function GET() {
  const certificates = await getCertificates();
  return NextResponse.json(certificates);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title || !body.issuer) {
    return NextResponse.json(
      { error: "Title and issuer are required" },
      { status: 400 }
    );
  }

  const cert: Certificate = {
    id: nanoid(8),
    title: body.title,
    issuer: body.issuer,
    category: body.category || "Other",
    image: body.image || "/uploads/placeholder-cert.svg",
    issuedAt: body.issuedAt || new Date().toISOString(),
  };

  const created = await createCertificate(cert);
  return NextResponse.json(created, { status: 201 });
}
