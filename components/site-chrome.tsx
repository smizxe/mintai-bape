import type { ReactNode } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
};

export function SiteHeader({
  links,
  mobileIcon,
}: {
  links: NavLink[];
  mobileIcon: ReactNode;
}) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="logo-block">
          <div className="logo-front">
            <span className="brand-kicker">PUBG Mobile Shop</span>
            <h1>
              <span className="accent">MinTai</span> Bape
            </h1>
          </div>
          <div className="logo-shadow" />
        </Link>

        <div className="nav-links">
          {links.map((link, index) => (
            <Link key={`${link.href}-${link.label}`} href={link.href} className={`nav-link ${index % 2 === 0 ? "nav-link--light" : "nav-link--dark"}`}>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="mobile-menu">{mobileIcon}</div>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-jagged" />

      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>MinTai Bape</h2>
            <p>Shop acc PUBG Mobile theo style comic combat.</p>
          </div>

          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Facebook">
              f
            </a>
            <a href="#" className="footer-social-link" aria-label="Zalo">
              Z
            </a>
            <a href="#" className="footer-social-link" aria-label="Discord">
              D
            </a>
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
          <p>© 2026 MinTai Bape. Homepage, account, product, login, register, admin, user.</p>
        </div>
      </div>

      <div className="footer-corner bg-halftone" />
    </footer>
  );
}
