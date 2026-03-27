import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data", "products.json");

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

export async function getAllProducts(): Promise<Product[]> {
  const raw = await readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as Product[];
}

export async function saveAllProducts(products: Product[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(products, null, 2), "utf8");
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find((p) => p.id === id) ?? null;
}

export async function createProduct(data: Omit<Product, "id">): Promise<Product> {
  const products = await getAllProducts();
  const product: Product = { ...data, id: `acc-${Date.now()}` };
  products.push(product);
  await saveAllProducts(products);
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id">>,
): Promise<Product | null> {
  const products = await getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data };
  await saveAllProducts(products);
  return products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getAllProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  await saveAllProducts(products);
  return true;
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
