import { NextRequest, NextResponse } from "next/server";
import { createAccountType, getAllAccountTypes } from "@/lib/account-types-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;
  return session?.role === "admin";
}

export async function GET() {
  const items = await getAllAccountTypes();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Thiếu tên loại acc" }, { status: 400 });
  }

  try {
    const item = await createAccountType({
      name,
      className: String(body.className ?? "tier-starter"),
      sortOrder: Number(body.sortOrder ?? 0) || 0,
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Không tạo được loại acc" }, { status: 400 });
  }
}
