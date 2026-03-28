import Link from "next/link";
import { ArrowLeft, Menu, ShoppingCart } from "lucide-react";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductGallery } from "@/components/product-gallery";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getProductBySlug } from "@/lib/products-store";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="inner-page">
        <section className="product-detail-shell">
          <div className="product-detail-back">
            <Link href="/products">
              <ArrowLeft size={16} />
              Quay lại sản phẩm
            </Link>
          </div>

          <div className="product-detail-grid">
            <ProductGallery images={product.images} title={product.title} />

            <div className="product-detail-info">
              <div className="gallery-topline">
                <span className={`tier-badge ${product.tierClass}`}>{product.tier}</span>
                <span className="tag-dark">{product.tag}</span>
              </div>
              <h1>{product.title}</h1>
              <p className="product-detail-summary">{product.shortDescription}</p>

              <div className="next-match-tags">
                {product.badges.map((badge) => (
                  <span key={badge.label} className={badge.className}>
                    {badge.label}
                  </span>
                ))}
              </div>

              <div className="product-detail-price">{product.price}</div>

              <div
                className="product-detail-description"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />

              <div className="product-detail-actions">
                <AddToCartButton productId={product.id} className="product-detail-cart-button" />
                <Link href="/cart">
                  <ShoppingCart size={16} />
                  Xem giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
