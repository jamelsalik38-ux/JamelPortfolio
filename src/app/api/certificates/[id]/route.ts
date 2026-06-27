export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { updateCertificate, deleteCertificate } from "@/lib/db";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const updated = await updateCertificate(params.id, body);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ok = await deleteCertificate(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
