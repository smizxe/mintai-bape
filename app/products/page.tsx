import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, SlidersHorizontal } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { SectionHeading } from "@/components/section-heading";
import { accountCatalog } from "@/lib/catalog";

const filterChips = ["Glacier", "Mythic", "Giá dưới 3 triệu", "Rank đẹp", "UC bonus"];

export default function ProductsPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Trang chủ" },
          { href: "/accounts", label: "Account" },
          { href: "/products", label: "Sản phẩm" },
          { href: "/register", label: "Register" },
        ]}
        mobileIcon={<Menu size={28} />}
      />

      <main className="inner-page">
        <section className="page-hero page-hero-light">
          <SectionHeading
            eyebrow="Trang san pham"
            title="Danh sách account được trình bày như một kho hàng có chọn lọc"
            description="Phần này là layout để list sản phẩm, bộ lọc, card giá và CTA mua ngay. Sau này chỉ cần nối thêm dữ liệu thật và tính năng giỏ hàng."
          />
        </section>

        <section className="products-shell">
          <div className="filter-bar">
            <div className="filter-label">
              <SlidersHorizontal size={18} />
              <span>Bộ lọc nhanh</span>
            </div>
            <div className="filter-chip-row">
              {filterChips.map((chip) => (
                <button key={chip} type="button" className="filter-chip">
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {accountCatalog.map((account) => (
              <article key={account.id} className="product-card">
                <div className="product-card-media">
                  <Image src={account.image} alt={account.title} fill sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                  <span className="product-card-badge">{account.code}</span>
                </div>
                <div className="product-card-body">
                  <div className="gallery-topline">
                    <span className={`tier-badge ${account.tierClass}`}>{account.tier}</span>
                    <span className="tag-dark">{account.tag}</span>
                  </div>
                  <h3>{account.title}</h3>
                  <p>{account.summary}</p>
                  <div className="next-match-tags">
                    {account.badges.map((badge) => (
                      <span key={badge.label} className={badge.className}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                  <div className="product-card-bottom">
                    <strong>{account.price}</strong>
                    <div className="product-card-actions">
                      <Link href="/user">Thêm vào giỏ</Link>
                      <Link href="/login">
                        Mua ngay
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
