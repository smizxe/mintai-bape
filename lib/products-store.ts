import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Product = {
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
};

type ProductPayload = Omit<Product, "id" | "stats" | "badges">;
type ProductRecord = Prisma.ProductGetPayload<{
  include: {
    images: true;
  };
}>;

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

function mapProduct(record: ProductRecord): Product {
  const skinXe = record.skinXe ?? "";
  const thanhGiap = record.thanhGiap ?? "";
  const doBAPE = record.doBAPE ?? "";

  return {
    id: record.id,
    code: record.code,
    slug: record.slug,
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
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return products.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return product ? mapProduct(product) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  return product ? mapProduct(product) : null;
}

export async function createProduct(data: ProductPayload): Promise<Product> {
  const skinXe = data.skinXe ?? "";
  const thanhGiap = data.thanhGiap ?? "";
  const doBAPE = data.doBAPE ?? "";

  const product = await prisma.product.create({
    data: {
      code: data.code,
      slug: data.slug,
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

  return mapProduct(product);
}

export async function updateProduct(id: string, data: Partial<ProductPayload>): Promise<Product | null> {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!existing) {
    return null;
  }

  const nextTier = data.tier ?? existing.tier;
  const nextTitle = data.title ?? existing.title;
  const nextSkinXe = data.skinXe ?? existing.skinXe ?? "";
  const nextThanhGiap = data.thanhGiap ?? existing.thanhGiap ?? "";
  const nextDoBAPE = data.doBAPE ?? existing.doBAPE ?? "";

  const product = await prisma.$transaction(async (tx) => {
    if (data.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }

    return tx.product.update({
      where: { id },
      data: {
        code: data.code,
        slug: data.slug,
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

  return mapProduct(product);
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
