import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct, formatPriceLabel, tierToClass } from "@/lib/products-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { resolveAccountTypeClass } from "@/lib/account-types-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const filter = searchParams.get("filter") ?? "";

  let products = await getAllProducts();

  // Only show active products to public
  products = products.filter((p) => !p.status || p.status === "active");

  if (filter === "skinXe") products = products.filter((p) => p.skinXe);
  if (filter === "thanhGiap") products = products.filter((p) => p.thanhGiap);
  if (filter === "doBAPE") products = products.filter((p) => p.doBAPE);

  if (search) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.summary.toLowerCase().includes(search) ||
        p.shortDescription.toLowerCase().includes(search) ||
        p.skinXe?.toLowerCase().includes(search) ||
        p.thanhGiap?.toLowerCase().includes(search) ||
        p.doBAPE?.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search),
    );
  }

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { skinXe = "", thanhGiap = "", doBAPE = "", tier = "Acc gà" } = body;
  const priceValue = Number(body.priceValue) || 0;
  const tierClass = await resolveAccountTypeClass(tier);

  const product = await createProduct({
    code: body.code ?? `RD-${Date.now()}`,
    slug: body.slug ?? body.title?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    title: body.title ?? "Untitled",
    tag: body.tag ?? "",
    tier,
    tierClass: tierClass || tierToClass(tier),
    price: formatPriceLabel(priceValue),
    priceValue,
    summary: body.summary ?? "",
    shortDescription: body.shortDescription ?? "",
    descriptionHtml: body.descriptionHtml ?? "",
    skinXe,
    thanhGiap,
    doBAPE,
    isFeaturedHero: false,
    featuredWeekRank: null,
    images: Array.isArray(body.images) ? body.images : [],
    status: body.status ?? "active",
  });

  return NextResponse.json(product, { status: 201 });
}
