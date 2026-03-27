"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
};

type SessionRole = "guest" | "user" | "admin";

const SESSION_KEY = "mintai-session-role";

export const primaryNavLinks: NavLink[] = [
  { href: "/", label: "Trang chủ" },
  { href: "/products", label: "Kho acc" },
  { href: "#", label: "Liên hệ" },
];

function getProfileLink(role: SessionRole): NavLink {
  if (role === "admin") {
    return { href: "/admin", label: "Hồ sơ" };
  }

  if (role === "user") {
    return { href: "/user", label: "Hồ sơ" };
  }

  return { href: "/login", label: "Đăng nhập / Đăng ký" };
}

export function setMockSessionRole(role: Exclude<SessionRole, "guest">) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, role);
  window.dispatchEvent(new Event("mintai-session-change"));
}

export function clearMockSessionRole() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("mintai-session-change"));
}

export function SiteHeader({
  links = primaryNavLinks,
  mobileIcon,
}: {
  links?: NavLink[];
  mobileIcon: ReactNode;
}) {
  const [sessionRole, setSessionRole] = useState<SessionRole>("guest");

  useEffect(() => {
    const syncSessionRole = () => {
      const storedRole = window.localStorage.getItem(SESSION_KEY);
      if (storedRole === "user" || storedRole === "admin") {
        setSessionRole(storedRole);
        return;
      }

      setSessionRole("guest");
    };

    syncSessionRole();
    window.addEventListener("storage", syncSessionRole);
    window.addEventListener("mintai-session-change", syncSessionRole);

    return () => {
      window.removeEventListener("storage", syncSessionRole);
      window.removeEventListener("mintai-session-change", syncSessionRole);
    };
  }, []);

  const finalLinks = [...links, getProfileLink(sessionRole)];

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
            >
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
          <p>© 2026 MinTai Bape. Homepage, product, login, register, admin, user.</p>
        </div>
      </div>

      <div className="footer-corner bg-halftone" />
    </footer>
  );
}
