import { NextRequest, NextResponse } from "next/server";
import { deleteAccountType, updateAccountType } from "@/lib/account-types-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;
  return session?.role === "admin";
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const item = await updateAccountType(id, {
    name: body.name,
    className: body.className,
    sortOrder: Number(body.sortOrder ?? 0) || 0,
  });

  if (!item) {
    return NextResponse.json({ error: "Không tìm thấy loại acc" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteAccountType(id);

  if (!ok) {
    return NextResponse.json({ error: "Không xóa được loại acc" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
