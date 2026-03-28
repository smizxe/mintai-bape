"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Menu, UserRound } from "lucide-react";
import { notifyAuthChanged } from "@/lib/auth-client";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

function resolveRedirectTarget(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/user";
  }

  if (nextPath.startsWith("/admin")) {
    return "/user";
  }

  return nextPath;
}

export default function RegisterPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Đăng ký thất bại. Vui lòng thử lại.");
        return;
      }

      notifyAuthChanged();
      router.push(resolveRedirectTarget(nextPath));
      router.refresh();
    } catch {
      setError("Không thể kết nối ngay lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <>
      <SiteHeader mobileIcon={<Menu size={28} />} />

      <main className="auth-page">
        <section className="auth-layout">
          <div className="auth-copy">
            <span className="inventory-eyebrow">Đăng ký</span>
            <h1>Tạo tài khoản để bắt đầu săn acc ngay hôm nay.</h1>
            <p>
              Đăng ký nhanh để lưu thông tin của bạn, theo dõi tài khoản đã chọn và tiếp tục chốt acc dễ hơn.
            </p>
          </div>

          <div className="auth-panel">
            <div className="auth-switch">
              <Link href={loginHref}>Đăng nhập</Link>
              <span className="auth-switch-active">Đăng ký</span>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                <span>Tên hiển thị</span>
                <div className="auth-input">
                  <UserRound size={16} />
                  <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </label>

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
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
