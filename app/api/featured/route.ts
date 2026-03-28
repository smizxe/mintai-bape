import { NextRequest, NextResponse } from "next/server";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { getAllProducts, getFeaturedHeroProduct, getFeaturedWeekProducts, saveFeaturedProducts } from "@/lib/products-store";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;
  return session?.role === "admin";
}

export async function GET() {
  const [heroProduct, weekProducts, products] = await Promise.all([
    getFeaturedHeroProduct(),
    getFeaturedWeekProducts(3),
    getAllProducts(),
  ]);

  return NextResponse.json({
    heroProductId: heroProduct?.id ?? null,
    weekProductIds: weekProducts.map((product) => product.id),
    products,
  });
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const heroProductId = typeof body.heroProductId === "string" && body.heroProductId.trim()
    ? body.heroProductId
    : null;
  const weekProductIds = Array.isArray(body.weekProductIds)
    ? body.weekProductIds.filter((id: unknown): id is string => typeof id === "string").slice(0, 3)
    : [];

  await saveFeaturedProducts({
    heroProductId,
    weekProductIds,
  });

  const [heroProduct, weekProducts] = await Promise.all([
    getFeaturedHeroProduct(),
    getFeaturedWeekProducts(3),
  ]);

  return NextResponse.json({
    heroProductId: heroProduct?.id ?? null,
    weekProductIds: weekProducts.map((product) => product.id),
  });
}
