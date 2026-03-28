"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Menu } from "lucide-react";
import { notifyAuthChanged } from "@/lib/auth-client";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

function resolveRedirectTarget(role: "admin" | "user", nextPath: string | null) {
  const fallback = role === "admin" ? "/admin" : "/user";
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback;
  }

  if (role === "user" && nextPath.startsWith("/admin")) {
    return fallback;
  }

  if (role === "admin" && nextPath.startsWith("/user")) {
    return fallback;
  }

  return nextPath;
}

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next"));
  }, []);

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
        setError(data.error ?? "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      notifyAuthChanged();
      router.push(resolveRedirectTarget(data.role, nextPath));
      router.refresh();
    } catch {
      setError("Không thể kết nối ngay lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register";

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="auth-page">
        <section className="auth-layout">
          <div className="auth-copy">
            <span className="inventory-eyebrow">Đăng nhập</span>
            <h1>Đăng nhập để tiếp tục chọn acc bạn muốn.</h1>
            <p>
              Theo dõi tài khoản, vào hồ sơ cá nhân và tiếp tục chốt những acc phù hợp với nhu cầu của bạn.
            </p>
          </div>

          <div className="auth-panel">
            <div className="auth-switch">
              <span className="auth-switch-active">Đăng nhập</span>
              <Link href={registerHref}>Đăng ký</Link>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                <span>Email</span>
                <div className="auth-input">
                  <Mail size={16} />
                  <input
                    type="email"
                    placeholder="you@example.com"
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
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
