import Link from "next/link";
import { ArrowRight, Lock, Menu, ShieldCheck, User } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function LoginPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Trang chu" },
          { href: "/products", label: "San pham" },
          { href: "/login", label: "Login" },
          { href: "/register", label: "Register" },
        ]}
        mobileIcon={<Menu size={28} />}
      />

      <main className="auth-page">
        <section className="auth-layout">
          <div className="auth-copy">
            <span className="inventory-eyebrow">Dang nhap</span>
            <h1>Chon dung vai tro de vao dung flow cua app.</h1>
            <p>
              Admin se duoc dua vao dashboard quan ly kho acc. User se vao giao dien mua hang binh thuong,
              co trang san pham, trang account va gio hang.
            </p>
            <div className="auth-role-strip">
              <div className="auth-role-pill">
                <ShieldCheck size={18} />
                <span>Admin dashboard</span>
              </div>
              <div className="auth-role-pill">
                <User size={18} />
                <span>User storefront</span>
              </div>
            </div>
          </div>

          <div className="auth-panel">
            <div className="auth-switch">
              <span className="auth-switch-active">Login</span>
              <Link href="/register">Register</Link>
            </div>

            <form className="auth-form">
              <label>
                <span>Email</span>
                <div className="auth-input">
                  <User size={16} />
                  <input type="email" placeholder="admin@royaldrop.vn" />
                </div>
              </label>
              <label>
                <span>Mat khau</span>
                <div className="auth-input">
                  <Lock size={16} />
                  <input type="password" placeholder="••••••••" />
                </div>
              </label>
            </form>

            <div className="auth-actions-grid">
              <Link className="auth-action-card auth-action-admin" href="/admin">
                <strong>Vao voi admin</strong>
                <span>Quan ly tai khoan, san pham, anh va don hang.</span>
                <ArrowRight size={18} />
              </Link>
              <Link className="auth-action-card auth-action-user" href="/user">
                <strong>Vao voi user</strong>
                <span>Mo shop, xem gio hang va tiep tuc dat mua.</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
