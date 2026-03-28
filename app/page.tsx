import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Crosshair,
  Crown,
  Menu,
  Shield,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getAllProducts, getFeaturedHeroProduct, getFeaturedWeekProducts } from "@/lib/products-store";

export default async function Home() {
  const allProducts = (await getAllProducts()).filter((product) => product.status === "active");
  const featuredHeroProduct = (await getFeaturedHeroProduct()) ?? allProducts[0] ?? null;
  const featuredWeekProducts = await getFeaturedWeekProducts(3);
  const inventoryProducts = allProducts.length > 0 ? allProducts.slice(0, 4) : featuredWeekProducts;
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
              Lướt qua từng tài khoản PUBG Mobile như đang chọn loadout trước giờ thả dù.
              Hiếm, rõ, giá gọn và dữ liệu thật từ sản phẩm đang bán.
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
                <strong>24h</strong>
                <span>chu kỳ cập nhật</span>
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
                  <p>Dữ liệu rõ ràng, giá gọn, ảnh thật. Lướt một lượt là biết acc nào đáng chốt.</p>
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
                  <h3>Data rõ ràng</h3>
                  <p>Skin, level, nâng cấp, rank và loại acc đều hiện trực tiếp trên card để so sánh nhanh.</p>
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
                  <h3>Mua bán an toàn</h3>
                  <p>Tài khoản được kiểm tra kỹ, đăng nhập ổn định và có hỗ trợ rõ ràng sau mua.</p>
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
            <p className="featured-subtitle">Ba tài khoản được chọn thật từ admin, sẵn sàng vào trận.</p>
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
                      <Link href={`/products/${account.slug}`}>
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

      <section className="inventory-section" id="inventory">
        <div className="inventory-container">
          <div className="inventory-header">
            <div className="inventory-eyebrow">Khám phá tất cả acc</div>
            <h2>Kho loadout đang mở và chọn acc vào trận</h2>
            <p>Quét nhanh, so sánh nhanh. Dữ liệu dưới đây lấy trực tiếp từ sản phẩm thật đang có trên cửa hàng.</p>
          </div>

          <div className="inventory-list">
            {inventoryProducts.map((item) => (
              <article key={item.id} className="inventory-row">
                <div className="inventory-row-info">
                  <span className={`tier-badge ${item.tierClass}`}>{item.tier}</span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <div className="inventory-row-price">
                  <strong>{item.price}</strong>
                  <Link href={`/products/${item.slug}`}>
                    Xem acc này
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
