import { NextRequest, NextResponse } from "next/server";
import { updateProduct, deleteProduct, tierToClass, buildBadgesFromFields } from "@/lib/products-store";
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

  const { skinXe = "", thanhGiap = "", doBAPE = "", tier } = body;

  const update: Record<string, unknown> = { ...body };

  if (tier) {
    update.tierClass = tierToClass(tier);
  }

  // Rebuild auto-generated fields when the three bullets change
  if ("skinXe" in body || "thanhGiap" in body || "doBAPE" in body || "tier" in body) {
    update.stats = [skinXe, thanhGiap, doBAPE].filter(Boolean);
    update.badges = buildBadgesFromFields(skinXe, thanhGiap, doBAPE, tier ?? "");
  }

  const product = await updateProduct(id, update);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteProduct(id);

  if (!ok) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
