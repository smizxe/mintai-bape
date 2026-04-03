import { PaymentMode, Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizePaymentMode } from "@/lib/shop-config";

type ProductBase = {
  id: string;
  code: string;
  slug: string;
  title: string;
  tag: string;
  tier: string;
  tierClass: string;
  price: string;
  priceValue: number;
  summary: string;
  shortDescription: string;
  descriptionHtml: string;
  skinXe: string;
  thanhGiap: string;
  doBAPE: string;
  stats: string[];
  badges: Array<{ label: string; className: string }>;
  images: string[];
  status: string;
  paymentMode: string;
  isFeaturedHero: boolean;
  featuredWeekRank: number | null;
  createdAt: string;
};

export type Product = ProductBase;

export type AdminProduct = ProductBase & {
  accountLoginEmail: string;
  accountLoginPassword: string;
};

type AdminProductPayload = Omit<AdminProduct, "id" | "stats" | "badges" | "createdAt">;
type ProductRecord = Prisma.ProductGetPayload<{
  include: {
    images: true;
  };
}>;

const PRODUCT_CODE_PATTERN = /^[A-Za-z0-9-]+$/;

function statusToUi(status: ProductStatus | string | null | undefined): string {
  return (status ?? "ACTIVE").toString().toLowerCase();
}

function statusToDb(status: string | undefined): ProductStatus {
  const normalized = (status ?? "active").toUpperCase();

  if (normalized === "DRAFT") return ProductStatus.DRAFT;
  if (normalized === "SOLD") return ProductStatus.SOLD;
  if (normalized === "ARCHIVED") return ProductStatus.ARCHIVED;

  return ProductStatus.ACTIVE;
}

function paymentModeToDb(paymentMode?: string | null): PaymentMode {
  return normalizePaymentMode(paymentMode) === "zalo" ? PaymentMode.ZALO : PaymentMode.AUTOMATIC;
}

export function tierToClass(tier: string): string {
  const map: Record<string, string> = {
    Mythic: "tier-mythic",
    Elite: "tier-elite",
    Rare: "tier-rare",
    Starter: "tier-starter",
  };

  return map[tier] ?? "tier-starter";
}

export function formatPriceLabel(priceValue: number): string {
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return "0đ";
  }

  return `${priceValue.toLocaleString("vi-VN")}đ`;
}

export function requiresAccountCredentials(paymentMode?: string | null): boolean {
  return normalizePaymentMode(paymentMode) === "automatic";
}

export function normalizeProductCode(input: string): string {
  return input.trim();
}

export function validateProductCode(input: string): string | null {
  const code = normalizeProductCode(input);

  if (!code) {
    return "Bạn cần nhập ID acc.";
  }

  if (!PRODUCT_CODE_PATTERN.test(code)) {
    return "ID acc chỉ được gồm chữ, số và dấu gạch ngang (-), không dùng khoảng trắng hay ký tự đặc biệt.";
  }

  return null;
}

export function validateProductCredentials(input: {
  paymentMode?: string | null;
  accountLoginEmail?: string | null;
  accountLoginPassword?: string | null;
}) {
  if (!requiresAccountCredentials(input.paymentMode)) {
    return null;
  }

  const email = input.accountLoginEmail?.trim() ?? "";
  const password = input.accountLoginPassword?.trim() ?? "";

  if (!email || !password) {
    return "Khi chọn thanh toán tự động, bạn cần nhập email và mật khẩu tài khoản để hệ thống giao acc sau khi thanh toán.";
  }

  return null;
}

export function buildBadgesFromFields(
  skinXe: string,
  thanhGiap: string,
  doBAPE: string,
  tier: string,
): Array<{ label: string; className: string }> {
  const badges: Array<{ label: string; className: string }> = [];

  if (tier) badges.push({ label: tier, className: tier === "Mythic" ? "tag-red" : "tag-green" });
  if (skinXe) badges.push({ label: skinXe, className: "tag-yellow" });
  if (thanhGiap) badges.push({ label: thanhGiap, className: "tag-dark" });
  if (doBAPE) badges.push({ label: doBAPE, className: "tag-red" });

  return badges;
}

function mapProductBase(record: ProductRecord): ProductBase {
  const skinXe = record.skinXe ?? "";
  const thanhGiap = record.thanhGiap ?? "";
  const doBAPE = record.doBAPE ?? "";

  return {
    id: record.id,
    code: record.code,
    slug: record.code,
    title: record.title,
    tag: record.tag,
    tier: record.tier,
    tierClass: record.tierClass || tierToClass(record.tier),
    price: record.price,
    priceValue: record.priceValue,
    summary: record.summary,
    shortDescription: record.shortDescription,
    descriptionHtml: record.descriptionHtml,
    skinXe,
    thanhGiap,
    doBAPE,
    stats: [skinXe, thanhGiap, doBAPE].filter(Boolean),
    badges: buildBadgesFromFields(skinXe, thanhGiap, doBAPE, record.tier),
    images: record.images.map((image) => image.imageUrl),
    status: statusToUi(record.status),
    paymentMode: normalizePaymentMode(record.paymentMode),
    isFeaturedHero: record.isFeaturedHero ?? false,
    featuredWeekRank: record.featuredWeekRank ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapProduct(record: ProductRecord): Product {
  return mapProductBase(record);
}

function mapAdminProduct(record: ProductRecord): AdminProduct {
  return {
    ...mapProductBase(record),
    accountLoginEmail: record.accountLoginEmail ?? "",
    accountLoginPassword: record.accountLoginPassword ?? "",
  };
}

function decodeMaybeEncodedCode(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function buildCodeCandidates(code: string) {
  const decoded = decodeMaybeEncodedCode(code);
  const normalized = normalizeProductCode(decoded);
  return Array.from(new Set([code, decoded, normalized].filter(Boolean)));
}

async function findManyProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
}

async function findProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await findManyProducts();
  return products.map(mapProduct);
}

export async function getAllProductsForAdmin(): Promise<AdminProduct[]> {
  const products = await findManyProducts();
  return products.map(mapAdminProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await findProductById(id);
  return product ? mapProduct(product) : null;
}

export async function getProductByIdForAdmin(id: string): Promise<AdminProduct | null> {
  const product = await findProductById(id);
  return product ? mapAdminProduct(product) : null;
}

export async function getProductByCode(code: string): Promise<Product | null> {
  const candidates = buildCodeCandidates(code);

  const product = await prisma.product.findFirst({
    where: {
      OR: candidates.flatMap((candidate) => [
        {
          code: {
            equals: candidate,
            mode: "insensitive",
          },
        },
        {
          slug: {
            equals: candidate,
            mode: "insensitive",
          },
        },
      ]),
    },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return product ? mapProduct(product) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return getProductByCode(slug);
}

export async function createProduct(data: AdminProductPayload): Promise<AdminProduct> {
  const skinXe = data.skinXe ?? "";
  const thanhGiap = data.thanhGiap ?? "";
  const doBAPE = data.doBAPE ?? "";
  const accountLoginEmail = data.accountLoginEmail?.trim() ?? "";
  const accountLoginPassword = data.accountLoginPassword?.trim() ?? "";
  const paymentMode = normalizePaymentMode(data.paymentMode);
  const normalizedCode = normalizeProductCode(data.code);

  const product = await prisma.product.create({
    data: {
      code: normalizedCode,
      slug: normalizedCode,
      title: data.title,
      tag: data.tag,
      tier: data.tier,
      tierClass: data.tierClass || tierToClass(data.tier),
      price: data.price,
      priceValue: data.priceValue,
      summary: data.summary,
      shortDescription: data.shortDescription,
      descriptionHtml: data.descriptionHtml,
      skinXe,
      thanhGiap,
      doBAPE,
      accountLoginEmail: accountLoginEmail || null,
      accountLoginPassword: accountLoginPassword || null,
      paymentMode: paymentModeToDb(paymentMode),
      isFeaturedHero: data.isFeaturedHero ?? false,
      featuredWeekRank: data.featuredWeekRank ?? null,
      status: statusToDb(data.status),
      images: {
        create: (data.images ?? []).map((imageUrl, index) => ({
          imageUrl,
          alt: `${data.title} image ${index + 1}`,
          position: index,
        })),
      },
    },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return mapAdminProduct(product);
}

export async function updateProduct(id: string, data: Partial<AdminProductPayload>): Promise<AdminProduct | null> {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!existing) return null;

  const nextTier = data.tier ?? existing.tier;
  const nextTitle = data.title ?? existing.title;
  const nextSkinXe = data.skinXe ?? existing.skinXe ?? "";
  const nextThanhGiap = data.thanhGiap ?? existing.thanhGiap ?? "";
  const nextDoBAPE = data.doBAPE ?? existing.doBAPE ?? "";
  const nextAccountLoginEmail =
    data.accountLoginEmail !== undefined ? data.accountLoginEmail.trim() : existing.accountLoginEmail ?? "";
  const nextAccountLoginPassword =
    data.accountLoginPassword !== undefined
      ? data.accountLoginPassword.trim()
      : existing.accountLoginPassword ?? "";
  const nextPaymentMode =
    data.paymentMode !== undefined ? normalizePaymentMode(data.paymentMode) : normalizePaymentMode(existing.paymentMode);
  const nextCode = data.code !== undefined ? normalizeProductCode(data.code) : existing.code;

  const product = await prisma.$transaction(async (tx) => {
    if (data.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }

    return tx.product.update({
      where: { id },
      data: {
        code: nextCode,
        slug: nextCode,
        title: data.title,
        tag: data.tag,
        tier: data.tier,
        tierClass: data.tierClass || tierToClass(nextTier),
        price: data.price,
        priceValue: data.priceValue,
        summary: data.summary,
        shortDescription: data.shortDescription,
        descriptionHtml: data.descriptionHtml,
        skinXe: nextSkinXe,
        thanhGiap: nextThanhGiap,
        doBAPE: nextDoBAPE,
        accountLoginEmail: nextAccountLoginEmail || null,
        accountLoginPassword: nextAccountLoginPassword || null,
        paymentMode: paymentModeToDb(nextPaymentMode),
        isFeaturedHero: data.isFeaturedHero,
        featuredWeekRank: data.featuredWeekRank,
        status: data.status ? statusToDb(data.status) : undefined,
        images: data.images
          ? {
              create: data.images.map((imageUrl, index) => ({
                imageUrl,
                alt: `${nextTitle} image ${index + 1}`,
                position: index,
              })),
            }
          : undefined,
      },
      include: {
        images: {
          orderBy: { position: "asc" },
        },
      },
    });
  });

  return mapAdminProduct(product);
}

export async function getFeaturedHeroProduct(): Promise<Product | null> {
  const product = await prisma.product.findFirst({
    where: { isFeaturedHero: true, status: ProductStatus.ACTIVE },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return product ? mapProduct(product) : null;
}

export async function getFeaturedWeekProducts(limit = 3): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      featuredWeekRank: {
        not: null,
      },
      status: ProductStatus.ACTIVE,
    },
    orderBy: [{ featuredWeekRank: "asc" }, { updatedAt: "desc" }],
    take: limit,
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return products.map(mapProduct);
}

export async function saveFeaturedProducts(input: {
  heroProductId: string | null;
  weekProductIds: string[];
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.product.updateMany({
      data: {
        isFeaturedHero: false,
        featuredWeekRank: null,
      },
    });

    if (input.heroProductId) {
      await tx.product.update({
        where: { id: input.heroProductId },
        data: { isFeaturedHero: true },
      });
    }

    for (const [index, productId] of input.weekProductIds.entries()) {
      await tx.product.update({
        where: { id: productId },
        data: { featuredWeekRank: index + 1 },
      });
    }
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
