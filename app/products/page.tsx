import { Menu } from "lucide-react";

export const dynamic = "force-dynamic";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getAllProducts } from "@/lib/products-store";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => !p.status || p.status === "active");

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="inner-page products-page">
        <div className="products-backdrop" aria-hidden="true">
          <div className="products-backdrop-red bg-halftone" />
          <div className="products-backdrop-shadow" />
          <span className="products-backdrop-line products-backdrop-line-1" />
          <span className="products-backdrop-line products-backdrop-line-2" />
        </div>

        <section className="page-hero page-hero-light">
          <div className="section-heading">
            <span className="inventory-eyebrow">Kho acc</span>
            <h1>Chọn acc PUBG Mobile phù hợp với bạn</h1>
            <p>
              Lọc nhanh theo skin, loại acc và mức giá để tìm đúng tài khoản bạn muốn chốt.
            </p>
          </div>
        </section>

        <ProductsClient initialProducts={products} />
      </main>

      <SiteFooter />
    </>
  );
}
