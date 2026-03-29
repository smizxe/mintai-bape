import { NextRequest, NextResponse } from "next/server";
import {
  createProduct,
  formatPriceLabel,
  getAllProducts,
  tierToClass,
  validateProductCredentials,
} from "@/lib/products-store";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";
import { resolveAccountTypeClass } from "@/lib/account-types-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const filter = searchParams.get("filter") ?? "";

  let products = await getAllProducts();
  products = products.filter((product) => !product.status || product.status === "active");

  if (filter === "skinXe") products = products.filter((product) => product.skinXe);
  if (filter === "thanhGiap") products = products.filter((product) => product.thanhGiap);
  if (filter === "doBAPE") products = products.filter((product) => product.doBAPE);

  if (search) {
    products = products.filter(
      (product) =>
        product.title.toLowerCase().includes(search) ||
        product.summary.toLowerCase().includes(search) ||
        product.shortDescription.toLowerCase().includes(search) ||
        product.skinXe?.toLowerCase().includes(search) ||
        product.thanhGiap?.toLowerCase().includes(search) ||
        product.doBAPE?.toLowerCase().includes(search) ||
        product.code.toLowerCase().includes(search),
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
  const skinXe = body.skinXe ?? "";
  const thanhGiap = body.thanhGiap ?? "";
  const doBAPE = body.doBAPE ?? "";
  const tier = body.tier ?? "Acc gà";
  const priceValue = Number(body.priceValue) || 0;
  const accountLoginEmail = typeof body.accountLoginEmail === "string" ? body.accountLoginEmail.trim() : "";
  const accountLoginPassword =
    typeof body.accountLoginPassword === "string" ? body.accountLoginPassword.trim() : "";

  const credentialError = validateProductCredentials({
    priceValue,
    accountLoginEmail,
    accountLoginPassword,
  });

  if (credentialError) {
    return NextResponse.json({ error: credentialError }, { status: 400 });
  }

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
    accountLoginEmail,
    accountLoginPassword,
    isFeaturedHero: false,
    featuredWeekRank: null,
    images: Array.isArray(body.images) ? body.images : [],
    status: body.status ?? "active",
  });

  return NextResponse.json(product, { status: 201 });
}
