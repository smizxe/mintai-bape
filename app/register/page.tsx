import Link from "next/link";
import { ArrowRight, Mail, Menu, ShieldCheck, User, UserPlus } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function RegisterPage() {
  return (
    <>
      <SiteHeader
        links={[
          { href: "/", label: "Trang chu" },
          { href: "/accounts", label: "Account" },
          { href: "/login", label: "Login" },
          { href: "/register", label: "Register" },
        ]}
        mobileIcon={<Menu size={28} />}
      />

      <main className="auth-page">
        <section className="auth-layout">
          <div className="auth-copy">
            <span className="inventory-eyebrow">Register</span>
            <h1>Tao tai khoan moi theo vai tro phu hop.</h1>
            <p>
              Ban co the giu giao dien nay lam skeleton cho flow auth that. Hien tai minh phan tach san
              2 huong vao admin va user de sau nay noi backend de hon.
            </p>
          </div>

          <div className="auth-panel">
            <div className="auth-switch">
              <Link href="/login">Login</Link>
              <span className="auth-switch-active">Register</span>
            </div>

            <form className="auth-form">
              <label>
                <span>Ten hien thi</span>
                <div className="auth-input">
                  <UserPlus size={16} />
                  <input type="text" placeholder="RoyalDrop Member" />
                </div>
              </label>
              <label>
                <span>Email</span>
                <div className="auth-input">
                  <Mail size={16} />
                  <input type="email" placeholder="user@royaldrop.vn" />
                </div>
              </label>
            </form>

            <div className="auth-actions-grid">
              <Link className="auth-action-card auth-action-admin" href="/admin">
                <ShieldCheck size={18} />
                <strong>Tao admin demo</strong>
                <span>Dung cho luong quan tri va demo dashboard.</span>
              </Link>
              <Link className="auth-action-card auth-action-user" href="/user">
                <User size={18} />
                <strong>Tao user demo</strong>
                <span>Dung cho luong khach mua hang va gio hang.</span>
              </Link>
            </div>

            <Link className="auth-primary-link" href="/user">
              Hoan tat dang ky
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
