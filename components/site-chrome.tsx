"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { AUTH_EVENT, getRoleFromDocumentCookie } from "@/lib/auth-client";

type NavLink = {
  href: string;
  label: string;
};

type SessionRole = "guest" | "user" | "admin";

export const primaryNavLinks: NavLink[] = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Kho acc" },
  { href: "#", label: "Liên hệ" },
];

function getUserLinks(role: SessionRole): NavLink[] {
  if (role === "user") {
    return [
      { href: "/cart", label: "Giỏ hàng" },
      { href: "/user", label: "Hồ sơ" },
    ];
  }

  if (role === "admin") {
    return [{ href: "/admin", label: "Hồ sơ" }];
  }

  return [{ href: "/login", label: "Đăng nhập / Đăng ký" }];
}

export function SiteHeader({
  links = primaryNavLinks,
  mobileIcon,
}: {
  links?: NavLink[];
  mobileIcon: ReactNode;
}) {
  const [sessionRole, setSessionRole] = useState<SessionRole>("guest");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncSessionRole = () => {
      setSessionRole(getRoleFromDocumentCookie());
    };

    syncSessionRole();
    window.addEventListener("storage", syncSessionRole);
    window.addEventListener(AUTH_EVENT, syncSessionRole);

    return () => {
      window.removeEventListener("storage", syncSessionRole);
      window.removeEventListener(AUTH_EVENT, syncSessionRole);
    };
  }, []);

  const finalLinks = [...links, ...getUserLinks(sessionRole)];

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
          {finalLinks.map((link, index) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`nav-link ${index % 2 === 0 ? "nav-link--light" : "nav-link--dark"}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <button
          className="mobile-menu"
          aria-label="Mở menu"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          {mobileIcon}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-inner">
            {finalLinks.map((link, index) => (
              <Link
                key={`mobile-${link.href}-${link.label}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`mobile-nav-link ${index % 2 === 0 ? "mobile-nav-link--light" : "mobile-nav-link--dark"}`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
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
            <p>Nơi chọn acc PUBG Mobile rõ ràng, nhanh gọn và dễ chốt.</p>
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
          <p>© 2026 MinTai Bape. Chọn đúng acc, vào trận nhanh.</p>
        </div>
      </div>

      <div className="footer-corner bg-halftone" />
    </footer>
  );
}
