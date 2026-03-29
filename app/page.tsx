import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Crosshair, Crown, Menu, Shield } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getAllProducts, getFeaturedHeroProduct, getFeaturedWeekProducts } from "@/lib/products-store";

export default async function Home() {
  const allProducts = (await getAllProducts()).filter((product) => product.status === "active");
  const featuredHeroProduct = (await getFeaturedHeroProduct()) ?? allProducts[0] ?? null;
  const featuredWeekProducts = await getFeaturedWeekProducts(3);
  const weeklyProducts = featuredWeekProducts.length > 0 ? featuredWeekProducts : allProducts.slice(0, 3);

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <header className="hero">
        <div className="hero-bg-halftone bg-halftone" />
        <div className="hero-bg-dark" />
        <div className="hero-line-1" />
        <div className="hero-line-2" />

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-tag">
              <span>Kho acc tuyển chọn mới cập nhật</span>
            </div>

            <h2 className="hero-headline">
              <span className="hero-line">Chọn Acc</span>
              <span className="hero-line highlight-white">Vào Trận</span>
              <span className="hero-line highlight-red">Chiến Thắng</span>
            </h2>

            <p className="hero-description">
              Chọn nhanh tài khoản PUBG Mobile phù hợp với lối chơi của bạn. Ảnh rõ, thông tin gọn, giá
              dễ chốt.
            </p>

            <Link href="/products" className="hero-cta">
              <div className="hero-cta-shadow" />
              <div className="hero-cta-front">
                <span>
                  Xem kho acc
                  <ArrowRight size={20} />
                </span>
              </div>
            </Link>

            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>{allProducts.length || 0}</strong>
                <span>acc đang lên kệ</span>
              </div>
              <div className="hero-metric">
                <strong>24H</strong>
                <span>cập nhật liên tục</span>
              </div>
              <div className="hero-metric">
                <strong>Top Tier</strong>
                <span>skin hiếm, rank đẹp</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="showcase-frame">
              <div className="showcase-badge">Acc hot nhất!</div>

              <div className="showcase-inner">
                {featuredHeroProduct?.images[0] ? (
                  <Image
                    src={featuredHeroProduct.images[0]}
                    alt={featuredHeroProduct.title}
                    fill
                    className="showcase-photo"
                    sizes="(max-width: 760px) 320px, 380px"
                  />
                ) : (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="2" />
                  </svg>
                )}

                <div className="showcase-overlay" />
              </div>
            </div>

            <div className="hero-floating hero-floating-price">
              <div className="hero-floating-icon">
                <Crown size={28} />
              </div>
              <div>
                <strong>{featuredHeroProduct?.price ?? "Liên hệ"}</strong>
                <span>Giá đang lên sàn</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="features-strip">
        <div className="features-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-outer">
                <div className="feature-inner">
                  <div className="feature-bg-icon">
                    <Crosshair size={80} />
                  </div>
                  <div className="feature-icon-box feature-icon-box--red">
                    <Crosshair size={22} />
                  </div>
                  <h3>Chọn acc nhanh</h3>
                  <p>Xem một lượt là biết ngay acc nào đáng chốt, không mất thời gian lọc lại từ đầu.</p>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-outer">
                <div className="feature-inner">
                  <div className="feature-bg-icon">
                    <BarChart3 size={80} />
                  </div>
                  <div className="feature-icon-box feature-icon-box--white">
                    <BarChart3 size={22} />
                  </div>
                  <h3>Thông tin rõ ràng</h3>
                  <p>Skin, rank, điểm nổi bật và mức giá được hiển thị gọn để bạn so sánh nhanh hơn.</p>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-outer">
                <div className="feature-inner">
                  <div className="feature-bg-icon">
                    <Shield size={80} />
                  </div>
                  <div className="feature-icon-box feature-icon-box--black">
                    <Shield size={22} />
                  </div>
                  <h3>Chốt acc yên tâm</h3>
                  <p>Chọn đúng tài khoản mình cần, xem ảnh trước khi mua và vào trận nhanh hơn.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section" id="featured">
        <div className="featured-glow-1" />
        <div className="featured-glow-2" />
        <div className="featured-bg-text">MinTai Bape</div>

        <div className="featured-container">
          <div className="featured-header">
            <h2 className="featured-title">Acc nổi bật tuần này</h2>
            <p className="featured-subtitle">Ba lựa chọn được săn nhiều, sẵn sàng để bạn vào trận ngay.</p>
          </div>

          <div className="featured-cards-grid featured-cards-grid-compact">
            {weeklyProducts.map((account) => (
              <article key={account.id} className="product-card">
                <div className="product-card-media">
                  <Image
                    src={account.images[0] ?? "/accounts/acc-01.svg"}
                    alt={account.title}
                    fill
                    sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                  <span className="product-card-badge">{account.code}</span>
                </div>

                <div className="product-card-body">
                  <div className="gallery-topline">
                    <span className={`tier-badge ${account.tierClass}`}>{account.tier}</span>
                    <span className="tag-dark">{account.tag}</span>
                  </div>

                  <h3>{account.title}</h3>
                  <p>{account.summary}</p>

                  <div className="product-bullets">
                    {account.skinXe && (
                      <span className="product-bullet product-bullet-xe">
                        <span className="bullet-label">Skin xe</span>
                        {account.skinXe}
                      </span>
                    )}
                    {account.thanhGiap && (
                      <span className="product-bullet product-bullet-giap">
                        <span className="bullet-label">Thánh giáp</span>
                        {account.thanhGiap}
                      </span>
                    )}
                    {account.doBAPE && (
                      <span className="product-bullet product-bullet-bape">
                        <span className="bullet-label">BAPE</span>
                        {account.doBAPE}
                      </span>
                    )}
                  </div>

                  <div className="product-card-bottom">
                    <strong>{account.price}</strong>
                    <div className="product-card-actions">
                      <Link href="/user">Mua ngay</Link>
                      <Link href={`/products/${encodeURIComponent(account.code)}`}>
                        Xem chi tiết
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="inventory-section inventory-section-cta" id="inventory">
        <div className="inventory-container">
          <div className="inventory-header inventory-header-cta">
            <div className="inventory-eyebrow">Vào kho acc ngay</div>
            <h2>Lấy Acc Của Bạn Ngay</h2>
            <p>Vào kho acc để lọc nhanh, xem ảnh thật và chọn đúng tài khoản phù hợp với ngân sách của bạn.</p>
          </div>

          <div className="inventory-cta-panel">
            <div className="inventory-cta-copy">
              <span className="inventory-cta-kicker">Kho acc PUBG Mobile</span>
              <h3>Chọn đúng acc, chốt nhanh, vào trận tự tin hơn.</h3>
              <p>
                Từ acc ngon, acc hiếm cho tới acc xịn, mọi lựa chọn đều đã sẵn sàng trong kho để bạn xem
                chi tiết và quyết định nhanh hơn.
              </p>
            </div>

            <div className="inventory-cta-actions">
              <Link href="/products" className="hero-cta hero-cta-inline">
                <div className="hero-cta-shadow" />
                <div className="hero-cta-front">
                  <span>
                    Lấy acc ngay
                    <ArrowRight size={20} />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
