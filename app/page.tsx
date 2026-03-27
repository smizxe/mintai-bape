import {
  ArrowRight,
  Crosshair,
  Crown,
  Gamepad2,
  BarChart3,
  Shield,
  Send,
  Menu,
} from "lucide-react";

const inventory = [
  {
    name: "Stealth Crate ID 1024",
    tier: "Elite",
    tierClass: "tier-elite",
    price: "1.750.000đ",
    loadout: "38 skin, 1 nâng cấp, outfit hiếm",
  },
  {
    name: "Winner Pass Vault ID 1870",
    tier: "Rare",
    tierClass: "tier-rare",
    price: "3.150.000đ",
    loadout: "54 skin, nhiều emote, rank đẹp",
  },
  {
    name: "X-Suit Locker ID 2201",
    tier: "Mythic",
    tierClass: "tier-mythic",
    price: "7.200.000đ",
    loadout: "92 skin, 3 nâng cấp, lobby nổi bật",
  },
  {
    name: "Balanced Combat ID 3114",
    tier: "Starter+",
    tierClass: "tier-starter",
    price: "980.000đ",
    loadout: "28 skin, tài nguyên ổn, dễ vào trận",
  },
];

const featuredAccounts = [
  {
    title: "Glacier Sưu Tập",
    price: "6.900.000đ",
    meta: "89 skin • Mythic • Lv. 76",
    tag: "Hot nhất",
  },
  {
    title: "Mythic Ranked",
    price: "4.500.000đ",
    meta: "61 skin • Ace Master",
    tag: "Rank đẹp",
  },
  {
    title: "UC Bonus Full Set",
    price: "2.890.000đ",
    meta: "47 skin • Set hiếm",
    tag: "Deal nhanh",
  },
  {
    title: "Winner Pass Locker",
    price: "980.000đ",
    meta: "Starter+ • Đăng nhập ổn",
    tag: "Giá mềm",
  },
  {
    title: "Stealth Crate",
    price: "3.150.000đ",
    meta: "54 skin • Emote đẹp",
    tag: "Elite",
  },
  {
    title: "X-Suit Locker",
    price: "7.200.000đ",
    meta: "92 skin • Lobby nổi bật",
    tag: "Top tier",
  },
];

export default function Home() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="logo-block">
            <div className="logo-front">
              <span className="brand-kicker">PUBG Mobile Shop</span>
              <h1>
                <span className="accent">MinTai</span> Bape
              </h1>
            </div>
            <div className="logo-shadow" />
          </div>

          <div className="nav-links">
            <a href="#featured" className="nav-link nav-link--light">
              <span>Acc nổi bật</span>
            </a>
            <a href="/products" className="nav-link nav-link--dark">
              <span>Kho acc</span>
            </a>
            <a href="#" className="nav-link nav-link--light">
              <span>Liên hệ</span>
            </a>
            <a href="/login" className="nav-link nav-link--dark">
              <span>Login / Register</span>
            </a>
          </div>

          <div className="mobile-menu">
            <Menu size={28} />
          </div>
        </div>
      </nav>

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
              Lướt qua từng tài khoản PUBG Mobile như đang chọn loadout trước giờ thả dù. Hiếm, rõ, giá gọn — bấm là chốt.
            </p>

            <div className="hero-cta">
              <div className="hero-cta-shadow" />
              <div className="hero-cta-front">
                <span>
                  Xem kho acc
                  <ArrowRight size={20} />
                </span>
              </div>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>120+</strong>
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
              <div className="showcase-badge">Acc Hot nhất!</div>

              <div className="showcase-inner">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="2" />
                </svg>

                <div className="showcase-inner-content">
                  <div className="showcase-icon">
                    <Gamepad2 size={80} />
                  </div>
                  <h3>Glacier X-Suit</h3>
                  <div className="showcase-stats">
                    <span>Lv. 76</span>
                    <span className="stat-hot">89 Skin</span>
                    <span>Mythic</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-floating hero-floating-price">
              <div className="hero-floating-icon">
                <Crown size={28} />
              </div>
              <div>
                <strong>6.900.000đ</strong>
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
                  <p>Dữ liệu rõ ràng, giá gọn, ảnh đẹp. Lướt một lượt là biết acc nào đáng chốt.</p>
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
                  <p>Skin, level, nâng cấp, rank — tất cả hiện rõ trên mỗi card để bạn so sánh dễ dàng.</p>
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
                  <p>Tài khoản được kiểm tra kỹ. Liên kết an toàn, đăng nhập ổn định, hỗ trợ sau mua.</p>
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
            <p className="featured-subtitle">Ba tài khoản được tuyển chọn kỹ nhất — sẵn sàng vào trận.</p>
          </div>

          <div className="featured-cards-grid">
            {featuredAccounts.map((account, index) => (
              <article key={account.title} className={`featured-account-card featured-account-card-${(index % 3) + 1}`}>
                <div className="featured-account-head">
                  <span className="featured-account-tag">{account.tag}</span>
                  <span className="featured-account-index">0{index + 1}</span>
                </div>
                <h3>{account.title}</h3>
                <p>{account.meta}</p>
                <div className="featured-account-price">{account.price}</div>
                <a href="/products" className="featured-account-link">
                  Xem sản phẩm
                  <ArrowRight size={16} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="inventory-section" id="inventory">
        <div className="inventory-container">
          <div className="inventory-header">
            <div className="inventory-eyebrow">Khám phá tất cả acc</div>
            <h2>Kho loadout đang mở — chọn acc vào trận</h2>
            <p>
              Quét nhanh, so sánh dễ. Nhìn một lượt là biết acc nào hợp ngân sách và gu sưu tầm của bạn.
            </p>
          </div>

          <div className="inventory-list">
            {inventory.map((item) => (
              <article key={item.name} className="inventory-row">
                <div className="inventory-row-info">
                  <span className={`tier-badge ${item.tierClass}`}>{item.tier}</span>
                  <h3>{item.name}</h3>
                  <p>{item.loadout}</p>
                </div>
                <div className="inventory-row-price">
                  <strong>{item.price}</strong>
                  <a href="#">
                    Giữ acc này
                    <ArrowRight size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-jagged" />

        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h2>MinTai Bape</h2>
              <p>Shop acc PUBG Mobile uy tín.</p>
            </div>

            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="Facebook">f</a>
              <a href="#" className="footer-social-link" aria-label="Zalo">Z</a>
              <a href="#" className="footer-social-link" aria-label="Discord">D</a>
            </div>

            <div className="footer-newsletter">
              <div className="footer-newsletter-title">
                <span className="nl-white">Nhận</span>
                <span className="nl-red">Thông</span>
                <span className="nl-dark">Báo</span>
                <span className="nl-yellow">Acc Mới</span>
              </div>
              <form className="footer-newsletter-form" action="#">
                <input type="email" placeholder="Email hoặc Zalo..." />
                <button type="button" aria-label="Gửi">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2024 MinTai Bape. Shop acc PUBG Mobile.</p>
          </div>
        </div>

        <div className="footer-corner bg-halftone" />
      </footer>
    </>
  );
}
