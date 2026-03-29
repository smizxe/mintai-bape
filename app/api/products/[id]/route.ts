import { NextRequest, NextResponse } from "next/server";
import {
  deleteProduct,
  formatPriceLabel,
  getProductByIdForAdmin,
  tierToClass,
  updateProduct,
  validateProductCode,
  validateProductCredentials,
} from "@/lib/products-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { resolveAccountTypeClass } from "@/lib/account-types-store";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;
  return session?.role === "admin";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const existing = await getProductByIdForAdmin(id);

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const update: Record<string, unknown> = { ...body };

  if ("code" in body) {
    const codeError = validateProductCode(typeof body.code === "string" ? body.code : "");
    if (codeError) {
      return NextResponse.json({ error: codeError }, { status: 400 });
    }
  }

  if ("tier" in body && body.tier) {
    update.tierClass = (await resolveAccountTypeClass(body.tier)) || tierToClass(body.tier);
  }

  let priceValue = existing.priceValue;

  if ("priceValue" in body) {
    const normalizedPrice = Number(body.priceValue) || 0;
    update.priceValue = normalizedPrice;
    update.price = formatPriceLabel(normalizedPrice);
    priceValue = normalizedPrice;
  }

  const credentialError =
    "priceValue" in body || "accountLoginEmail" in body || "accountLoginPassword" in body
      ? validateProductCredentials({
          priceValue,
          accountLoginEmail:
            typeof body.accountLoginEmail === "string" ? body.accountLoginEmail.trim() : existing.accountLoginEmail,
          accountLoginPassword:
            typeof body.accountLoginPassword === "string"
              ? body.accountLoginPassword.trim()
              : existing.accountLoginPassword,
        })
      : null;

  if (credentialError) {
    return NextResponse.json({ error: credentialError }, { status: 400 });
  }

  delete update.price;

  const product = await updateProduct(id, update);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
