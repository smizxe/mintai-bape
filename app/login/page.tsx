"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Menu, ShieldCheck, User } from "lucide-react";
import { SiteFooter, SiteHeader, setMockSessionRole } from "@/components/site-chrome";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Đăng nhập thất bại. Thử lại.");
        return;
      }

      // sync localStorage so SiteHeader updates immediately
      setMockSessionRole(data.role);
      router.push(data.role === "admin" ? "/admin" : "/user");
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="auth-page">
        <section className="auth-layout">
          <div className="auth-copy">
            <span className="inventory-eyebrow">Đăng nhập</span>
            <h1>Đăng nhập để quản lý hoặc mua acc PUBG Mobile.</h1>
            <p>Admin vào dashboard quản lý kho. User vào trang mua hàng bình thường.</p>
            <div className="auth-role-strip">
              <div className="auth-role-pill">
                <ShieldCheck size={18} />
                <span>Admin: admin@mintaibape.vn</span>
              </div>
              <div className="auth-role-pill">
                <User size={18} />
                <span>User: user@mintaibape.vn</span>
              </div>
            </div>
          </div>

          <div className="auth-panel">
            <div className="auth-switch">
              <span className="auth-switch-active">Đăng nhập</span>
              <Link href="/register">Đăng ký</Link>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                <span>Email</span>
                <div className="auth-input">
                  <User size={16} />
                  <input
                    type="email"
                    placeholder="admin@mintaibape.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </label>
              <label>
                <span>Mật khẩu</span>
                <div className="auth-input">
                  <Lock size={16} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p className="auth-hint">
              Demo — Admin: mintai2024 &nbsp;|&nbsp; User: user2024
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
