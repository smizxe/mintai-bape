import products from "@/data/products.json";

export type CatalogProduct = (typeof products)[number];

export const accountCatalog = products as CatalogProduct[];

export function getProductBySlug(slug: string) {
  return accountCatalog.find((item) => item.slug === slug);
}
